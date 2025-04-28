'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';

import { useParams, useRouter } from 'next/navigation';
import { getWorkById, updateWork, Work } from '@/data';
import BackButton from '@/components/BackButton';
import TopBar from '@/components/TopBar';
import { AIAssistantModal } from '@/components/works/AIAssistantModal';
import { ArchiveModal } from '@/components/archives';
import { workContentUtils } from '@/lib/utils';

// 类型定义
interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

// 防抖函数
const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): DebouncedFunction<T> => {
  let timeoutId: NodeJS.Timeout | null = null;

  // 创建一个包含函数主体和cancel方法的对象
  const debouncedFn = ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  }) as DebouncedFunction<T>;

  // 显式添加cancel方法
  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
};

interface Chapter {
  title: string;
  content: string;
}

// 侧边栏收起状态的实现

// 侧边栏收起状态的localStorage键
const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed';

// 章节管理侧边栏组件
const ChapterSidebar = ({
  chapters,
  activeChapter,
  onChapterClick,
  onAddChapter,
  isDescending,
  setIsDescending
}: {
  chapters: Chapter[];
  activeChapter: number;
  onChapterClick: (index: number) => void;
  onAddChapter: () => void;
  isDescending: boolean;
  setIsDescending: (value: boolean | ((prev: boolean) => boolean)) => void;
}) => {
  // 创建一个颜色数组用于章节项
  const chapterColors = [
    'rgba(120,180,140,0.3)', // 绿色
    'rgba(133,150,230,0.3)', // 蓝色
    'rgba(224,149,117,0.3)', // 橙色
    'rgba(194,129,211,0.3)', // 紫色
    'rgba(231,169,85,0.3)',  // 黄色
  ];

  // 从 localStorage 加载收起状态
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return savedState === 'true';
    }
    return false;
  });

  // 当收起状态变化时，保存到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isCollapsed.toString());
    }
  }, [isCollapsed]);

  return (
    <>
      {/* 收起状态下只显示展开按钮 */}
      {isCollapsed ? (
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-card-color p-2 rounded-r-xl shadow-md border border-l-0 border-[rgba(120,180,140,0.2)] text-text-medium hover:text-primary-green transition-colors duration-200 z-10"
          onClick={() => setIsCollapsed(false)}
          aria-label="展开侧边栏"
        >
          <span className="material-icons">chevron_right</span>
        </button>
      ) : (
        <div className="sidebar w-64 border-r border-[rgba(120,180,140,0.2)] bg-card-color shadow-md flex flex-col rounded-tr-2xl rounded-br-2xl transition-all duration-300">
          <div className="p-5 border-b border-[rgba(120,180,140,0.2)] flex items-center">
            <div className="w-10 h-10 bg-primary-green rounded-xl flex items-center justify-center text-white font-bold mr-3 text-base shadow-sm">烛</div>
            <span className="text-text-dark text-lg font-medium tracking-wide" style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>烛光写作</span>
          </div>

          <div className="flex-1 py-6 px-2 overflow-auto">
            <div className="mb-4 px-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-text-dark font-medium text-lg font-ma-shan transform -translate-y-[2px] mr-2">章节管理</span>
                <button
                  onClick={() => setIsDescending(prev => !prev)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-[rgba(90,157,107,0.1)] transition-all"
                  title={isDescending ? '当前为倒序，点击切换为正序' : '当前为正序，点击切换为倒序'}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {isDescending ? (
                      // 倒序图标
                      <path d="M7 3L7 21M7 21L3 17M7 21L11 17M17 21V3M17 3L13 7M17 3L21 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      // 正序图标
                      <path d="M7 21L7 3M7 3L3 7M7 3L11 7M17 3V21M17 21L13 17M17 21L21 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    )}
                  </svg>
                </button>
              </div>
              <button
                className="p-1 rounded-full hover:bg-[rgba(90,157,107,0.1)] transition-colors duration-200 transform translate-y-[2px]"
                onClick={onAddChapter}
                title="添加新章节"
              >
                <span className="material-icons text-primary-green">add_circle</span>
              </button>
            </div>
            {[...chapters]
              .map((chapter, index) => ({ chapter, index }))
              .sort((a, b) => isDescending ? b.index - a.index : a.index - b.index)
              .map(({ chapter, index }) => {
                // 根据索引选择颜色
                const colorIndex = index % chapterColors.length;
                const borderColor = chapterColors[colorIndex];
                const iconColor = activeChapter === index ?
                  `rgb(${90 + index * 15}, ${130 + (index % 3) * 20}, ${140 - (index % 5) * 10})` :
                  'rgba(90, 90, 90, 0.7)';

                return (
                  <div
                    key={index}
                    className={`menu-item ${activeChapter === index ? 'active shadow-md' : 'shadow-sm opacity-80'}`}
                    onClick={() => onChapterClick(index)}
                    style={{
                      borderLeft: activeChapter === index ? `3px solid ${borderColor}` : 'none'
                    }}
                  >
                    <div className="menu-icon">
                      <span className="material-icons text-2xl" style={{ color: iconColor }}>article</span>
                    </div>
                    <span className="menu-text truncate">第 {index + 1} 章</span>
                  </div>
                );
              })}
          </div>

          {/* 收起/展开按钮 */}
          <div className="p-4 border-t border-[rgba(120,180,140,0.2)] flex justify-center">
            <button
              className="w-full flex items-center justify-center py-2 rounded-xl text-text-medium hover:bg-[rgba(120,180,140,0.1)] transition-colors duration-200"
              onClick={() => setIsCollapsed(true)}
              aria-label="收起侧边栏"
            >
              <span className="material-icons">chevron_left</span>
              <span className="ml-2">收起</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// 富文本编辑器组件
const RichTextEditor = ({
  content,
  onChange,
  title,
  onTitleChange,
  onSave,
  isSaving,
  chapters,
  activeChapter,
  workId,
  lastSavedAt,
  isDescending, // 添加排序状态
}: {
  content: string;
  onChange: (content: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  isSaving: boolean;
  chapters: Array<{title: string, content: string}>;
  activeChapter: number;
  workId: number;
  lastSavedAt: Date | null;
  isDescending: boolean; // 添加排序状态类型
}) => {
  // 选中文本相关状态
  const [selectedText, setSelectedText] = useState('');
  const [showPolishModal, setShowPolishModal] = useState(false);

  // 档案馆状态
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  // 打开AI润色模态窗口
  const openPolishModal = () => {
    // 获取textarea元素
    const textarea = document.querySelector('textarea');
    if (!textarea) {
      return; // 如果找不到编辑器元素，静默返回
    }

    // 直接从文本域获取选中的文本
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    console.log('Selection range:', start, end);

    // 如果有选中文本
    if (start !== end) {
      const text = textarea.value.substring(start, end).trim();
      console.log('Selected text from textarea:', text);

      if (text.length > 0) {
        // 先设置选中的文本，然后打开AI辅助窗口
        setSelectedText(text);
        // 打开AI辅助窗口，设置初始类型为润色
        setTimeout(() => {
          setShowAIModal(true);
        }, 0);
      }
      // 如果选中的文本为空，不做任何反应
    }
    // 如果没有选中文本，不做任何反应
  };

  // 打开档案馆模态窗口
  const openArchiveModal = () => {
    setShowArchiveModal(true);
  };

  // 处理档案选择
  const handleArchiveSelect = (archive: any) => {
    // 将选中的档案内容插入到当前编辑位置
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBefore = content.substring(0, cursorPos);
      const textAfter = content.substring(textarea.selectionEnd);

      // 创建档案引用格式
      const archiveReference = `\n\n--- 档案：${archive.title} ---\n${archive.content}\n---\n\n`;

      // 更新内容
      const newContent = textBefore + archiveReference + textAfter;
      onChange(newContent);

      // 将光标移动到插入内容之后
      setTimeout(() => {
        textarea.selectionStart = cursorPos + archiveReference.length;
        textarea.selectionEnd = cursorPos + archiveReference.length;
        textarea.focus();
      }, 0);
    }
  };

  // 添加一个状态来控制是否使用A4宽度，从localStorage加载初始值
  const [isA4Width, setIsA4Width] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('editor_a4_width_mode');
      // 如果没有保存过设置，默认为true（A4模式）
      return savedState === null ? true : savedState === 'true';
    }
    return true; // 默认为A4模式
  });

  // 切换A4宽度模式并保存到localStorage
  const toggleA4Width = () => {
    setIsA4Width(prev => {
      const newValue = !prev;
      // 保存到localStorage，全局统一记忆
      if (typeof window !== 'undefined') {
        localStorage.setItem('editor_a4_width_mode', newValue.toString());
      }
      return newValue;
    });
  };

  // AI辅助弹窗状态
  const [showAIModal, setShowAIModal] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full bg-card-color rounded-xl overflow-hidden border border-[rgba(120,180,140,0.4)] shadow-md relative">
      <div className="p-4 border-b border-[rgba(120,180,140,0.3)] flex justify-between items-center">
        {/* 左侧标题输入框 */}
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-1/4 text-3xl font-bold border-none focus:outline-none focus:ring-0 bg-transparent text-text-dark"
          placeholder="章节标题"
          style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
        />

        {/* 按钮组（向左移动） */}
        <div className="flex items-center space-x-3 ml-4">
          <button
            onClick={() => setShowAIModal(true)}
            className="p-2.5 rounded-lg bg-[#88b892] hover:bg-[#78a882] active:bg-[#689872] transition-all duration-200 flex items-center text-white border border-[#78a882] shadow-[0_2px_5px_rgba(60,90,70,0.3)]"
            title="AI写作"
          >
            <span className="material-icons text-white">smart_toy</span>
            <span className="ml-1.5 text-sm font-medium">AI写作</span>
          </button>

          <button
            onClick={openPolishModal}
            className="p-2.5 rounded-lg bg-[#d5a26f] hover:bg-[#c5925f] active:bg-[#b5824f] transition-all duration-200 flex items-center text-white border border-[#c5925f] shadow-[0_2px_5px_rgba(100,70,40,0.3)]"
            title="AI润色"
          >
            <span className="material-icons text-white">auto_fix_high</span>
            <span className="ml-1.5 text-sm font-medium">AI润色</span>
          </button>

          <button
            onClick={openArchiveModal}
            className="p-2.5 rounded-lg bg-[#7a9ec0] hover:bg-[#6a8eb0] active:bg-[#5a7ea0] transition-all duration-200 flex items-center text-white border border-[#6a8eb0] shadow-[0_2px_5px_rgba(50,70,90,0.3)]"
            title="档案馆"
          >
            <span className="material-icons text-white">folder_special</span>
            <span className="ml-1.5 text-sm font-medium">档案馆</span>
          </button>

          <button
            onClick={toggleA4Width}
            className="p-2.5 rounded-lg bg-[#a2c3b4] hover:bg-[#92b3a4] active:bg-[#82a394] transition-all duration-200 flex items-center text-white border border-[#92b3a4] shadow-[0_2px_5px_rgba(60,80,70,0.3)]"
            title={isA4Width ? "宽屏模式" : "A4页面模式"}
          >
            <span className="material-icons text-white">{isA4Width ? "fullscreen" : "fit_screen"}</span>
            <span className="ml-1.5 text-sm font-medium">{isA4Width ? "宽屏" : "A4"}</span>
          </button>
        </div>

        {/* 右侧空间 */}
        <div className="w-1/3 flex justify-end">
          {/* 删除保存按钮 */}
        </div>
      </div>

      {/* 文本编辑区域 */}
      <div className="flex-1 overflow-auto relative">
        <div className={`h-full ${isA4Width ? 'flex justify-center' : 'editor-grid-bg'}`}>
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className={`h-full border-none focus:outline-none focus:ring-0 resize-none text-text-dark p-6 ${isA4Width ? 'editor-grid-bg' : ''}`}
            style={{
              fontFamily: "'思源黑体', 'Noto Sans SC', sans-serif",
              fontSize: '16pt',
              fontWeight: 400,
              lineHeight: '2.0',
              color: 'var(--text-dark)',
              width: isA4Width ? '21cm' : '100%',
              maxWidth: isA4Width ? '21cm' : 'none',
              backgroundColor: 'transparent',
              position: isA4Width ? 'relative' : 'absolute',
              left: isA4Width ? 'auto' : 0,
              right: isA4Width ? 'auto' : 0,
              top: isA4Width ? 'auto' : 0,
              bottom: isA4Width ? 'auto' : 0,
            }}
            placeholder="开始创作你的故事..."
          ></textarea>
        </div>
      </div>

      {/* 底部信息栏 */}
      <div className="p-3 border-t border-[rgba(120,180,140,0.3)] bg-card-color flex justify-between items-center text-sm text-text-dark">
        <div className="flex items-center">
          <span className="material-icons text-sm mr-1 text-primary-green">history</span>
          {isSaving ? '正在保存...' : (lastSavedAt ? `已保存于 ${lastSavedAt.toLocaleTimeString()}` : '未保存')}
          <span className="mx-3 text-gray-400">|</span>
          {content ? `${content.length} 个字` : '0 个字'}
        </div>

        <div className="flex-grow"></div>
      </div>

      {/* AI辅助模态窗口 */}
      <AIAssistantModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApply={(content) => {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(textarea.selectionEnd);

            // 在光标位置插入AI生成的内容
            onChange(textBefore + content + textAfter);

            // 将光标移动到插入内容之后
            setTimeout(() => {
              textarea.selectionStart = cursorPos + content.length;
              textarea.selectionEnd = cursorPos + content.length;
              textarea.focus();
            }, 0);
          }
        }}
        currentContent={selectedText}
        chapters={chapters}
        activeChapter={activeChapter}
        initialPromptType={selectedText ? 'ai_polishing' : 'ai_writing'}
        workId={workId}
        defaultIsDescending={isDescending}
      />

      {/* 档案馆模态窗口 */}
      <ArchiveModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onSelect={handleArchiveSelect}
        workId={workId}
      />
    </div>
  );
};

export default function WorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workId = params?.id ? Number(params.id) : 0;

  // 所有状态定义
  const [work, setWork] = useState<Work | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [chapters, setChapters] = useState([{ title: '', content: '' }]);
  const [activeChapter, setActiveChapter] = useState(0);
  // 章节排序状态，默认正序（升序）
  const [isDescending, setIsDescending] = useState<boolean>(() => {
    // 从 localStorage 加载排序状态，如果有的话
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(`work_${workId}_chapter_order`);
      return savedState === 'desc';
    }
    return false;
  });

  // 上次保存的内容引用
  const lastSavedContent = useRef<string>('');
  // 保存计时器
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      // 清除可能存在的定时器
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, []);

  // 监听排序状态变化，保存到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && workId) {
      localStorage.setItem(`work_${workId}_chapter_order`, isDescending ? 'desc' : 'asc');
    }
  }, [isDescending, workId]);

  // 触发保存的函数
  const triggerSave = useCallback(async () => {
    if (!work) return;

    // 获取当前内容的序列化字符串
    const currentContent = workContentUtils.stringifyChapters(chapters);

    // 只有当内容有变化时才保存
    if (currentContent !== lastSavedContent.current) {
      setIsSaving(true);

      try {
        const updatedWork = {
          ...work,
          content: currentContent,
          updatedAt: new Date()
        };

        await updateWork(updatedWork);
        setWork(updatedWork);
        setLastSavedAt(new Date());
        // 更新上次保存的内容
        lastSavedContent.current = currentContent;
        console.log('保存成功', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('保存失败:', error);
        setError('保存失败');
      } finally {
        setIsSaving(false);
      }
    }
  }, [work, chapters]);

  // 安排延迟保存
  const scheduleSave = useCallback(() => {
    // 取消已有的定时器
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // 设置新的定时器，1秒后保存
    saveTimerRef.current = setTimeout(() => {
      triggerSave();
      saveTimerRef.current = null;
    }, 1000);
  }, [triggerSave]);

  // 获取作品数据
  useEffect(() => {
    const fetchWork = async () => {
      if (!workId) return;

      try {
        const workData = await getWorkById(workId);
        if (!workData) {
          router.push('/works');
          return;
        }

        setWork(workData);
        const parsedChapters = workContentUtils.parseContent(workData.content);
        setChapters(parsedChapters);

        // 初始化上次保存的内容
        lastSavedContent.current = workData.content;
        setLastSavedAt(new Date(workData.updatedAt));
      } catch (error) {
        console.error('获取作品失败:', error);
        setError('获取作品失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWork();
  }, [workId, router]);

  // 如果处于加载状态，渲染加载组件
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  // 如果作品不存在，渲染错误组件
  if (!work) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <span className="material-icons text-4xl text-gray-300 mb-3">error</span>
          <p className="text-gray-500">作品不存在或已被删除</p>
          <button
            className="btn-primary mt-4"
            onClick={() => router.push('/works')}
          >
            返回作品列表
          </button>
        </div>
      </div>
    );
  }

  // 处理章节点击事件
  const handleChapterClick = (index: number) => {
    // 保存当前章节
    scheduleSave();

    // 切换章节
    setActiveChapter(index);

    // 在切换章节后重置滚动位置
    setTimeout(() => {
      const editorTextarea = document.querySelector('.flex-1.overflow-auto textarea') as HTMLTextAreaElement;
      if (editorTextarea) {
        editorTextarea.scrollTop = 0;
      }
    }, 0);
  };

  // 处理章节内容变更
  const handleChange = (content: string) => {
    if (activeChapter >= 0 && activeChapter < chapters.length) {
      const newChapters = [...chapters];
      newChapters[activeChapter] = {
        ...newChapters[activeChapter],
        content: content
      };
      setChapters(newChapters);

      // 安排延迟保存
      scheduleSave();
    }
  };

  // 处理章节标题变更
  const handleTitleChange = (title: string) => {
    if (activeChapter >= 0 && activeChapter < chapters.length) {
      const newChapters = [...chapters];
      newChapters[activeChapter] = {
        ...newChapters[activeChapter],
        title: title
      };
      setChapters(newChapters);

      // 安排延迟保存
      scheduleSave();
    }
  };

  const handleAddChapter = () => {
    const newChapter = { title: '', content: '' };
    const newChapters = [...chapters, newChapter];

    // 先更新章节列表
    setChapters(newChapters);
    // 设置激活章节为新添加的章节
    setActiveChapter(chapters.length);

    // 立即保存新章节
    if (work) {
      setIsSaving(true);

      const updatedContent = workContentUtils.stringifyChapters(newChapters);

      try {
        const updatedWork = {
          ...work,
          content: updatedContent,
          updatedAt: new Date()
        };

        updateWork(updatedWork)
          .then(() => {
            setWork(updatedWork);
            setLastSavedAt(new Date());
            // 更新最后保存的内容
            lastSavedContent.current = updatedContent;
            console.log('新章节保存成功', new Date().toLocaleTimeString());
          })
          .catch(err => {
            console.error('保存新章节失败:', err);
            setError('保存新章节失败');
          })
          .finally(() => {
            setIsSaving(false);
          });
      } catch (error) {
        console.error('保存新章节失败:', error);
        setError('保存新章节失败');
        setIsSaving(false);
      }
    }
  };

  const handleSave = async () => {
    // 清除任何挂起的自动保存
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    // 立即执行保存
    if (!work) return;

    setIsSaving(true);
    const currentContent = workContentUtils.stringifyChapters(chapters);

    try {
      const updatedWork = {
        ...work,
        content: currentContent,
        updatedAt: new Date()
      };

      await updateWork(updatedWork);
      setWork(updatedWork);
      setLastSavedAt(new Date());
      // 更新上次保存的内容
      lastSavedContent.current = currentContent;
    } catch (error) {
      console.error('保存作品失败:', error);
      setError('保存作品失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-bg-color animate-fadeIn overflow-hidden">
      {/* 背景网格 */}
      <div className="grid-background"></div>

      {/* 装饰元素，在小屏幕上减少数量 */}
      <div className="dot hidden md:block" style={{ top: "120px", left: "15%" }}></div>
      <div className="dot" style={{ bottom: "80px", right: "20%" }}></div>
      <div className="dot hidden md:block" style={{ top: "30%", right: "25%" }}></div>
      <div className="dot hidden md:block" style={{ bottom: "40%", left: "30%" }}></div>

      <svg className="wave hidden md:block" style={{ bottom: "20px", left: "10%" }} width="100" height="20" viewBox="0 0 100 20">
        <path d="M0,10 Q25,0 50,10 T100,10" fill="none" stroke="var(--accent-brown)" strokeWidth="2" />
      </svg>

      <svg className="wave hidden md:block" style={{ top: "15%", right: "5%" }} width="100" height="20" viewBox="0 0 100 20">
        <path d="M0,10 Q25,0 50,10 T100,10" fill="none" stroke="var(--accent-brown)" strokeWidth="2" />
      </svg>

      {/* 左侧章节管理 */}
      <ChapterSidebar
        chapters={chapters}
        activeChapter={activeChapter}
        onChapterClick={handleChapterClick}
        onAddChapter={handleAddChapter}
        isDescending={isDescending}
        setIsDescending={setIsDescending}
      />

      {/* 中间内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 使用通用顶边栏组件 */}
        <TopBar
          title={work.title}
          showBackButton={true}
          actions={
            <>
              <span className={`badge ${
                work.type === 'novel' ? 'badge-blue' :
                work.type === 'character' ? 'badge-purple' :
                work.type === 'worldbuilding' ? 'badge-green' :
                'badge-yellow'
              }`}>
                {work.type === 'novel' ? '小说' :
                work.type === 'character' ? '角色' :
                work.type === 'worldbuilding' ? '世界' :
                '情节'}
              </span>
            </>
          }
        />

        {/* 富文本编辑器 */}
        <div className="flex-1 flex overflow-hidden p-4 md:p-6 lg:p-8">
          <div className="flex-1 flex rounded-xl overflow-hidden shadow-lg bg-card-color border border-[rgba(120,180,140,0.2)]">
            <RichTextEditor
              content={chapters[activeChapter]?.content || ''}
              onChange={handleChange}
              title={chapters[activeChapter]?.title || ''}
              onTitleChange={handleTitleChange}
              onSave={handleSave}
              isSaving={isSaving}
              chapters={chapters}
              activeChapter={activeChapter}
              workId={workId}
              lastSavedAt={lastSavedAt}
              isDescending={isDescending}
            />
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-card-color border border-[rgba(224,149,117,0.5)] rounded-xl p-4 shadow-md animate-fadeIn">
          <div className="flex items-center">
            <span className="material-icons text-[#E0976F] mr-2">error</span>
            <span className="text-text-dark">{error}</span>
            <button
              className="ml-4 text-text-dark hover:text-[#E0976F]"
              onClick={() => setError('')}
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}