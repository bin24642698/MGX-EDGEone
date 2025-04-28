'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import BackButton from '@/components/BackButton';
import { Prompt, getPromptsByType, deletePrompt, addPrompt, updatePrompt, isUserPrompt, addUserPromptSelection, removeUserPromptSelection, isPromptSelectedByUser, getPublicPrompts, getUserPromptsByType } from '@/data';
import { PromptDescriptionView, PromptDetailView } from '@/components/prompts';
import { getCurrentUser } from '@/lib/supabase';

// 提示词类型映射
const promptTypeMap = {
  'ai_writing': { label: 'AI写作', color: 'bg-green-100 text-green-800', icon: 'create', group: 'novel', gradient: 'from-green-500 to-green-600' },
  'ai_polishing': { label: 'AI润色', color: 'bg-blue-100 text-blue-800', icon: 'auto_fix_high', group: 'novel', gradient: 'from-blue-500 to-blue-600' },
  'ai_analysis': { label: 'AI分析', color: 'bg-indigo-100 text-indigo-800', icon: 'analytics', group: 'novel', gradient: 'from-indigo-500 to-indigo-600' },
  'worldbuilding': { label: '世界观', color: 'bg-purple-100 text-purple-800', icon: 'public', group: 'creative', gradient: 'from-purple-500 to-purple-600' },
  'character': { label: '角色', color: 'bg-amber-100 text-amber-800', icon: 'person', group: 'creative', gradient: 'from-amber-500 to-amber-600' },
  'plot': { label: '情节', color: 'bg-rose-100 text-rose-800', icon: 'timeline', group: 'creative', gradient: 'from-rose-500 to-rose-600' },
  'introduction': { label: '导语', color: 'bg-indigo-100 text-indigo-800', icon: 'format_quote', group: 'creative', gradient: 'from-indigo-500 to-indigo-600' },
  'outline': { label: '大纲', color: 'bg-blue-100 text-blue-800', icon: 'format_list_bulleted', group: 'creative', gradient: 'from-blue-500 to-blue-600' },
  'detailed_outline': { label: '细纲', color: 'bg-teal-100 text-teal-800', icon: 'subject', group: 'creative', gradient: 'from-teal-500 to-teal-600' },
  'book_tool': { label: '一键拆书', color: 'bg-amber-100 text-amber-800', icon: 'auto_stories', group: 'tools', gradient: 'from-amber-500 to-amber-600' }
} as const;

// 提示词类型
type PromptType = keyof typeof promptTypeMap;

// 验证提示词类型是否有效
const isValidPromptType = (type: any): type is PromptType => {
  return Object.keys(promptTypeMap).includes(type as string);
};

// 将类型颜色转换为胶带颜色
const getTypeColor = (type: string): string => {
  const colorText = promptTypeMap[type as keyof typeof promptTypeMap]?.color.split(' ')[1] || 'text-blue-800';
  // 从 text-blue-800 提取 blue
  const colorName = colorText.replace('text-', '').replace('-800', '');
  return `rgba(${colorName === 'blue' ? '125, 133, 204' :
           colorName === 'green' ? '90, 157, 107' :
           colorName === 'purple' ? '156, 111, 224' :
           colorName === 'amber' ? '224, 151, 111' :
           colorName === 'rose' ? '224, 111, 156' :
           colorName === 'indigo' ? '125, 133, 204' :
           colorName === 'teal' ? '111, 224, 197' : '125, 133, 204'}, 0.7)`;
};

// 格式化日期显示
const formatDate = (date: Date | string | number) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// 提示词模板
const promptTemplates = {
  'ai_writing': '',
  'ai_polishing': '',
  'ai_analysis': '',
  'worldbuilding': '',
  'character': '',
  'plot': '',
  'introduction': '',
  'outline': '',
  'detailed_outline': '',
  'book_tool': `你是一位专业的文学分析师，擅长分析和拆解文学作品。现在，你需要对用户提供的小说章节进行深度分析和拆解。

请按照以下结构进行分析：

1. 内容概述：
   - 简要总结所提供章节的主要内容
   - 识别核心情节和关键场景

2. 人物分析：
   - 列出章节中出现的主要和次要人物
   - 分析人物性格、动机和行为模式
   - 探讨人物关系和互动

3. 情节结构：
   - 分析章节的情节架构和节奏
   - 指出高潮和转折点
   - 评估情节的合理性和吸引力

4. 主题探讨：
   - 识别章节中的主要主题和潜在寓意
   - 分析作者如何通过情节和人物表达这些主题

5. 写作技巧：
   - 评价作者的叙事手法和语言风格
   - 分析对话、描写和意象的使用
   - 指出特别有效或需要改进的写作元素

6. 改进建议：
   - 提供具体的改进建议，包括情节发展、人物塑造和写作技巧
   - 指出可能的情节漏洞或不一致之处
   - 建议如何增强读者体验

注意：你的分析应该尊重原文的创作意图，在提供改进建议时保持建设性和支持性的态度。`
};
// 定义Modal组件的参数类型
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

// 弹窗组件
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-4xl" }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className={`bg-card-color rounded-2xl p-6 w-full ${maxWidth} shadow-xl relative flex flex-col`}>
        <div className="flex justify-between items-center mb-6">
          <div className="w-6">
            {/* 左侧占位，保持布局平衡 */}
          </div>
          <h2 className="text-2xl font-bold text-text-dark font-ma-shan text-center">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 w-6 flex justify-center"
            onClick={onClose}
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};
// 截断内容 - 当前未使用，但保留以备将来使用
const truncateContent = (content: string, length: number = 120) => {
  if (!content) return '';
  if (content.length <= length) return content;
  return content.slice(0, length) + '...';
};

export default function PromptTypePage() {
  const router = useRouter();
  const params = useParams();
  const promptType = (params?.type as string) as PromptType;

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [publicPrompts, setPublicPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPublicPrompts, setShowPublicPrompts] = useState(true);
  const [formData, setFormData] = useState<{
    title: string;
    type: PromptType;
    content: string;
    description: string;
    isPublic: boolean;
  }>({
    title: '',
    type: promptType,
    content: promptTemplates[promptType as keyof typeof promptTemplates] || '',
    description: '',
    isPublic: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState<Prompt | null>(null);
  const [isPromptSelected, setIsPromptSelected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    // 获取当前用户ID
    const getCurrentUserId = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUserId();
  }, []);

  // 添加检查是否是提示词所有者的函数
  const isPromptOwner = (prompt: Prompt) => {
    if (!prompt || !currentUserId) return false;
    // 检查userId属性是否存在
    return prompt.userId ? prompt.userId === currentUserId : false;
  };

  // 卡片描述文本
  const descriptions = {
    'introduction': '创建引人入胜的开篇导语，为你的故事设定基调和氛围',
    'outline': '快速生成故事的主要框架和结构，帮助你规划创作方向',
    'detailed_outline': '基于大纲深入展开，为每个章节创建详细的内容规划',
    'character': '创建丰富多彩的角色，赋予他们独特的个性和背景故事',
    'worldbuilding': '构建完整的世界观，包括历史、地理、文化和社会结构',
    'plot': '设计引人入胜的情节，包括冲突、转折和高潮',
    'ai_analysis': '使用AI分析小说的结构、人物、情节和主题，提供深入见解',
    'ai_writing': '使用AI创作高质量的小说内容，生成各类风格的文学作品',
    'ai_polishing': '使用AI润色和优化已有文本，提升其文学性、可读性和吸引力',
    'book_tool': '一键上传TXT文件，AI智能分析文本内容，快速提取关键信息和创作灵感'
  };
  // 加载提示词数据
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        setIsLoading(true);
        if (!promptType || !promptTypeMap[promptType as keyof typeof promptTypeMap]) {
          router.push('/prompts');
          return;
        }

        // 只加载用户自己的提示词，不包括已选择的公开提示词
        const loadedPrompts = await getUserPromptsByType(promptType);
        setPrompts(loadedPrompts);

        // 加载其他用户的公开提示词
        const loadedPublicPrompts = await getPublicPrompts(promptType);
        console.log('加载的公开提示词:', loadedPublicPrompts);
        setPublicPrompts(loadedPublicPrompts);
      } catch (error) {
        console.error('加载提示词失败:', error);
        setPrompts([]);
        setPublicPrompts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrompts();
  }, [promptType, router]);

  // 过滤用户提示词
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prompt.description && prompt.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // 过滤公开提示词
  const filteredPublicPrompts = publicPrompts.filter(prompt => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prompt.description && prompt.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });
  // 处理输入变更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 重置表单数据
  const resetFormData = () => {
    setFormData({
      title: '',
      type: promptType,
      content: promptTemplates[promptType as keyof typeof promptTemplates] || '',
      description: '',
      isPublic: false
    });
  };

  // 打开创建提示词弹窗
  const openCreateModal = () => {
    resetFormData();
    setShowCreateModal(true);
  };

  // 打开删除提示词弹窗
  const openDeleteModal = (prompt: Prompt, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedPrompt(prompt);
    setShowDeleteModal(true);
  };

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date();
      const promptData = {
        ...formData,
        createdAt: now,
        updatedAt: now,
        examples: [], // 保持兼容性，设为空数组
        isPublic: formData.isPublic || false
      };

      const newPrompt = await addPrompt(promptData);
      setPrompts(prev => [newPrompt, ...prev]);
      setShowCreateModal(false);

      // 刷新列表
      if (isValidPromptType(promptType)) {
        const updatedPrompts = await getPromptsByType(promptType);
        setPrompts(updatedPrompts);
      }
    } catch (error) {
      console.error('创建提示词失败:', error);
      alert('创建提示词失败，请重试');
    }
  };

  // 处理删除
  const handleDelete = async () => {
    if (!selectedPrompt || !selectedPrompt.id) return;

    try {
      await deletePrompt(selectedPrompt.id);
      setPrompts(prev => prev.filter(p => p.id !== selectedPrompt.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('删除提示词失败:', error);
      alert('删除提示词失败，请重试');
    }
  };
  // 检查当前用户是否是提示词的作者
  const isPromptAuthor = async (prompt: Prompt): Promise<boolean> => {
    try {
      return await isUserPrompt(prompt.id || 0);
    } catch (error) {
      console.error('检查提示词作者失败:', error);
      return false;
    }
  };

  // 打开详情弹窗
  const openDetailModal = async (prompt: Prompt, isEditing: boolean = false) => {
    setSelectedPrompt(prompt);
    setShowDetailModal(true);

    // 只有提示词作者才能编辑，且只能在"我的提示词"页面编辑
    const isAuthor = await isPromptAuthor(prompt);
    const canEdit = isAuthor && !showPublicPrompts; // 在推荐页面不允许编辑
    setIsEditing(isEditing && canEdit);
    setEditedPrompt(isEditing && canEdit ? prompt : null);

    // 检查提示词是否已被用户选择
    if (prompt.id && !isAuthor) {
      const isSelected = await isPromptSelectedByUser(prompt.id);
      setIsPromptSelected(isSelected);
    } else if (prompt.id && isAuthor && showPublicPrompts) {
      // 如果是用户自己的提示词，但在推荐页面，也需要检查是否已被选择
      const isSelected = await isPromptSelectedByUser(prompt.id);
      setIsPromptSelected(isSelected);
    }
  };

  // 高亮搜索关键词
  const highlightMatch = (text: string, term: string) => {
    if (!term || !text) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part: string, i: number) =>
      part.toLowerCase() === term.toLowerCase() ? <mark key={i} className="bg-yellow-100 px-1 rounded">{part}</mark> : part
    );
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

      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={promptType === 'book_tool' ? '一键拆书' : promptTypeMap[promptType as keyof typeof promptTypeMap]?.label || '提示词管理'}
          showBackButton={true}
          actions={
            <button
              className="ghibli-button outline text-sm"
              onClick={openCreateModal}
            >
              <span className="material-icons mr-1 text-sm">add</span>
              创建提示词
            </button>
          }
        />

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-full mx-auto px-0 sm:px-4 lg:container lg:mx-auto">
          {/* 提示词列表 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md mr-4 bg-[${
                  promptTypeMap[promptType as keyof typeof promptTypeMap]?.color.split(' ')[1].replace('text-', '').replace(/\]/, '')
                }]`}>
                  <span className="material-icons text-xl">{promptTypeMap[promptType as keyof typeof promptTypeMap]?.icon}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-text-dark font-ma-shan">
                    {promptTypeMap[promptType as keyof typeof promptTypeMap]?.label}
                    <span className="ml-2 text-sm font-normal text-text-medium">({filteredPrompts.length})</span>
                  </h3>
                  <p className="text-sm text-text-medium mt-1">
                    {descriptions[promptType as keyof typeof descriptions]}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mb-6 flex flex-wrap items-center gap-4">
              <div className="flex-shrink-0 w-64">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-icons text-text-light">search</span>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-[rgba(120,180,140,0.3)] rounded-xl bg-card-color focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] shadow-sm text-text-dark"
                    placeholder="搜索提示词..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  className={`px-3 py-2 border rounded-xl flex items-center transition-colors shadow-sm ${
                    showPublicPrompts
                    ? "bg-[rgba(120,180,140,0.1)] border-[rgba(120,180,140,0.5)] text-primary-green"
                    : "bg-card-color border-[rgba(120,180,140,0.3)] text-text-medium hover:bg-[rgba(120,180,140,0.1)]"
                  }`}
                  onClick={() => setShowPublicPrompts(true)}
                >
                  <span className="material-icons text-sm mr-2">public</span>
                  推荐
                </button>
                <button
                  className={`px-3 py-2 border rounded-xl flex items-center transition-colors shadow-sm ${
                    !showPublicPrompts
                    ? "bg-[rgba(120,180,140,0.1)] border-[rgba(120,180,140,0.5)] text-primary-green"
                    : "bg-card-color border-[rgba(120,180,140,0.3)] text-text-medium hover:bg-[rgba(120,180,140,0.1)]"
                  }`}
                  onClick={() => setShowPublicPrompts(false)}
                >
                  <span className="material-icons text-sm mr-2">person</span>
                  我的
                </button>

              </div>
            </div>
          </div>
          {/* 提示词内容区域 */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // 加载状态
                <div className="col-span-full flex justify-center p-12">
                  <div className="w-3 h-3 bg-[#7D85CC] rounded-full animate-pulse mr-1"></div>
                  <div className="w-3 h-3 bg-[#E0976F] rounded-full animate-pulse delay-150 mr-1"></div>
                  <div className="w-3 h-3 bg-[#9C6FE0] rounded-full animate-pulse delay-300"></div>
                </div>
              ) : showPublicPrompts ? (
                // 显示公开提示词
                filteredPublicPrompts.length > 0 ? (
                  <>
                    {/* 公开提示词列表 */}
                    {filteredPublicPrompts.map(prompt => {
                  // 获取更新时间
                  const updatedAt = new Date(prompt.updatedAt);
                  const now = new Date();
                  const diffDays = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

                  // 格式化时间显示
                  let timeDisplay;
                  if (diffDays === 0) {
                    timeDisplay = '今天';
                  } else if (diffDays === 1) {
                    timeDisplay = '昨天';
                  } else if (diffDays < 7) {
                    timeDisplay = `${diffDays}天前`;
                  } else {
                    timeDisplay = updatedAt.toLocaleDateString();
                  }

                  const typeConfig = promptTypeMap[prompt.type as keyof typeof promptTypeMap] || {
                    label: '未知',
                    icon: 'help_outline',
                    color: 'text-gray-500',
                    description: '未定义的提示词类型'
                  };

                  // 获取对应的颜色
                  const colorText = typeConfig.color.split(' ')[1];
                  const bgColor = typeConfig.color.split(' ')[0];

                  // 提取颜色代码用于胶带
                  const tapeColor = colorText.replace('text-', 'rgba(').replace(/\]/, ', 0.7)');

                  return (
                    <div
                      key={prompt.id}
                      className="ghibli-card h-80 text-center cursor-pointer animate-fadeIn"
                      onClick={() => openDetailModal(prompt, false)}
                    >
                      <div className="tape" style={{ backgroundColor: tapeColor }}>
                        <div className="tape-texture"></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-14 h-14 mt-8 mb-6 rounded-full ${bgColor} flex items-center justify-center`}>
                          <span className={`material-icons text-2xl ${colorText}`}>{typeConfig.icon}</span>
                        </div>

                        <h3 className="font-medium text-text-dark text-xl mb-4 font-ma-shan">
                          {highlightMatch(prompt.title, searchTerm)}
                        </h3>

                        <p className="text-text-medium text-sm mb-6 px-6 line-clamp-3">
                          {prompt.description ? highlightMatch(prompt.description, searchTerm) : '无描述'}
                        </p>

                        <div className="mt-auto border-t border-[rgba(120,180,140,0.2)] w-full pt-3 px-4 flex justify-between items-center">
                          <div className="flex items-center text-xs text-text-light">
                            <span className="material-icons text-text-light text-sm mr-1">schedule</span>
                            <span>{timeDisplay}</span>
                          </div>
                          <div className="flex space-x-2">
                            {prompt.isPublic ? (
                              <div className="flex items-center text-green-600">
                                <span className="material-icons text-xs mr-1">public</span>
                                <span className="text-xs">公开</span>
                              </div>
                            ) : null}
                            {isPromptOwner(prompt) && (
                              <div className="flex items-center text-[#7D85CC]">
                                <span className="material-icons text-xs mr-1">person</span>
                                <span className="text-xs">我的</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="page-curl"></div>
                    </div>
                  );
                })}
                  </>
                ) : (
                  // 无公开提示词提示
                  <div className="col-span-full ghibli-card p-12 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-[rgba(120,180,140,0.1)] rounded-full flex items-center justify-center mb-4 text-text-light">
                      <span className="material-icons text-4xl">search_off</span>
                    </div>
                    <h3 className="text-xl font-semibold text-text-dark mb-2 font-ma-shan">暂无推荐提示词</h3>
                    <p className="text-text-medium text-center max-w-md mb-6">
                      {searchTerm
                        ? `没有找到包含"${searchTerm}"的推荐提示词`
                        : `暂无${promptTypeMap[promptType as keyof typeof promptTypeMap]?.label}类型的推荐提示词。`}
                    </p>
                    <button
                      className="ghibli-button"
                      onClick={() => searchTerm ? setSearchTerm('') : setShowPublicPrompts(false)}
                    >
                      <span className="material-icons text-sm mr-2">{searchTerm ? 'clear' : 'person'}</span>
                      {searchTerm ? '清除搜索' : '查看我的提示词'}
                    </button>
                  </div>
                )
              ) : (
                // 显示用户自己的提示词
                filteredPrompts.length > 0 ? (
                  <>
                    {/* 用户提示词列表 */}
                    {filteredPrompts.map(prompt => {
                      // 获取更新时间
                      const updatedAt = new Date(prompt.updatedAt);
                      const now = new Date();
                      const diffDays = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

                      // 格式化时间显示
                      let timeDisplay;
                      if (diffDays === 0) {
                        timeDisplay = '今天';
                      } else if (diffDays === 1) {
                        timeDisplay = '昨天';
                      } else if (diffDays < 7) {
                        timeDisplay = `${diffDays}天前`;
                      } else {
                        timeDisplay = updatedAt.toLocaleDateString();
                      }

                      const typeConfig = promptTypeMap[prompt.type as keyof typeof promptTypeMap] || {
                        label: '未知',
                        icon: 'help_outline',
                        color: 'text-gray-500',
                        description: '未定义的提示词类型'
                      };

                      // 获取对应的颜色
                      const colorText = typeConfig.color.split(' ')[1];
                      const bgColor = typeConfig.color.split(' ')[0];

                      // 提取颜色代码用于胶带
                      const tapeColor = colorText.replace('text-', 'rgba(').replace(/\]/, ', 0.7)');

                      return (
                        <div
                          key={prompt.id}
                          className="ghibli-card h-80 text-center cursor-pointer animate-fadeIn"
                          onClick={() => openDetailModal(prompt, false)}
                        >
                          <div className="tape" style={{ backgroundColor: tapeColor }}>
                            <div className="tape-texture"></div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className={`w-14 h-14 mt-8 mb-6 rounded-full ${bgColor} flex items-center justify-center`}>
                              <span className={`material-icons text-2xl ${colorText}`}>{typeConfig.icon}</span>
                            </div>

                            <h3 className="font-medium text-text-dark text-xl mb-4 font-ma-shan">
                              {highlightMatch(prompt.title, searchTerm)}
                            </h3>

                            <p className="text-text-medium text-sm mb-6 px-6 line-clamp-3">
                              {prompt.description ? highlightMatch(prompt.description, searchTerm) : '无描述'}
                            </p>

                            <div className="mt-auto border-t border-[rgba(120,180,140,0.2)] w-full pt-3 px-4 flex justify-between items-center">
                              <div className="flex items-center text-xs text-text-light">
                                <span className="material-icons text-text-light text-sm mr-1">schedule</span>
                                <span>{timeDisplay}</span>
                              </div>
                              <div className="flex space-x-2">
                                {prompt.isPublic ? (
                                  <div className="flex items-center text-green-600">
                                    <span className="material-icons text-xs mr-1">public</span>
                                    <span className="text-xs">公开</span>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div className="page-curl"></div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  // 无用户提示词提示
                  <div className="col-span-full ghibli-card p-12 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-[rgba(120,180,140,0.1)] rounded-full flex items-center justify-center mb-4 text-text-light">
                      <span className="material-icons text-4xl">search_off</span>
                    </div>
                    <h3 className="text-xl font-semibold text-text-dark mb-2 font-ma-shan">暂无提示词</h3>
                    <p className="text-text-medium text-center max-w-md mb-6">
                      {searchTerm
                        ? `没有找到包含"${searchTerm}"的提示词`
                        : `你尚未创建任何${promptTypeMap[promptType as keyof typeof promptTypeMap]?.label}类型的提示词，点击下方按钮创建第一个提示词。`}
                    </p>
                    <button
                      className="ghibli-button"
                      onClick={() => searchTerm ? setSearchTerm('') : openCreateModal()}
                    >
                      <span className="material-icons text-sm mr-2">{searchTerm ? 'clear' : 'add'}</span>
                      {searchTerm ? '清除搜索' : '创建提示词'}
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
      {/* 创建提示词弹窗 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建新提示词"
      >
        <div className="mb-6">
          <div className="ghibli-card p-6 animate-fadeIn relative">
            {/* 顶部胶带 */}
            <div className="tape" style={{ backgroundColor: "rgba(120, 180, 140, 0.7)" }}>
              <div className="tape-texture"></div>
            </div>

            <div className="mt-6 h-[500px] overflow-y-auto px-4">
              <form id="createPromptForm" onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl mx-auto">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-text-dark font-medium mb-2">提示词标题</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    placeholder="输入提示词标题..."
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-[rgba(120,180,140,0.3)] bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="type" className="block text-text-dark font-medium mb-2">提示词类型</label>
                  <div className="py-2 px-4 rounded-xl bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)]">
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs ${promptTypeMap[promptType]?.color}`}>
                        <span className="material-icons text-xs mr-1 align-text-top">{promptTypeMap[promptType]?.icon}</span>
                        {promptTypeMap[promptType]?.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="content" className="block text-text-dark font-medium mb-2">提示词内容</label>
                  <textarea
                    id="content"
                    name="content"
                    required
                    placeholder="输入提示词内容..."
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(120,180,140,0.3)] bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent min-h-[120px] overflow-y-auto break-words whitespace-pre-wrap"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-text-dark font-medium mb-2">提示词描述</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="描述这个提示词的用途和使用场景..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(120,180,140,0.3)] bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent min-h-[120px]"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="block text-text-dark font-medium mb-2">提示词权限</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            isPublic: e.target.checked
                          });
                        }}
                        className="form-checkbox h-5 w-5 text-[#5a9d6b] rounded border-[rgba(120,180,140,0.5)]"
                      />
                      <span className="text-text-medium">允许其他用户查看和使用此提示词</span>
                    </label>
                  </div>
                  <p className="text-text-light text-sm mt-1">
                    <span className="material-icons text-xs align-middle mr-1">info</span>
                    公开的提示词可以被所有用户查看和使用，但内容仍然保持加密状态
                  </p>
                </div>
              </form>
            </div>

            {/* 翻页效果 */}
            <div className="page-curl"></div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-[rgba(120,180,140,0.3)]">
          <button
            type="submit"
            form="createPromptForm"
            className="ghibli-button text-sm py-2"
          >
            创建提示词
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(false)}
            className="ghibli-button outline text-sm py-2"
          >
            取消
          </button>
        </div>
      </Modal>
      {/* 删除确认弹窗 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="删除提示词"
      >
        <div className="mb-6">
          <div className="ghibli-card p-6 animate-fadeIn relative">
            <div className="tape" style={{ backgroundColor: "rgba(224, 111, 111, 0.7)" }}>
              <div className="tape-texture"></div>
            </div>

            <div className="my-auto h-[300px] overflow-y-auto px-4">
              <div className="bg-red-50 rounded-xl p-6 mb-6 text-center w-full max-w-lg mx-auto">
                <span className="material-icons text-red-500 text-4xl mb-4">warning</span>
                <p className="text-center text-red-700 text-lg font-medium mb-2">确定要删除这个提示词吗？</p>
                <p className="text-center text-red-600 text-sm">此操作无法撤销</p>
              </div>
            </div>

            <div className="page-curl"></div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-[rgba(120,180,140,0.3)]">
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm transition-colors shadow-sm"
          >
            确认删除
          </button>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="ghibli-button outline text-sm py-2"
          >
            取消
          </button>
        </div>
      </Modal>
      {/* 详情/编辑弹窗 */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedPrompt?.title || '提示词详情'}
      >
        <div className="mb-6">
          <div className="ghibli-card p-6 animate-fadeIn relative">
            <div className="tape" style={{ backgroundColor: selectedPrompt ? getTypeColor(selectedPrompt.type) : "rgba(120, 180, 140, 0.7)" }}>
              <div className="tape-texture"></div>
            </div>

            <div className="mt-6 h-[500px] overflow-y-auto px-4">
              {selectedPrompt && (
                <div className="w-full max-w-2xl mx-auto">
                  {/* 检查是否是提示词作者且不在推荐页面 */}
                  {isPromptOwner(selectedPrompt) && !showPublicPrompts ? (
                    // 提示词作者视图 - 可以查看完整内容和编辑（仅在"我的"页面）
                    <PromptDetailView
                      prompt={selectedPrompt}
                      isEditing={isEditing}
                      editedPrompt={editedPrompt || undefined}
                      handleInputChange={(e) => {
                        const { name, value } = e.target;
                        setEditedPrompt(prev => prev ? { ...prev, [name]: value } : null);
                      }}
                      handleExampleChange={(index, value) => {
                        if (!editedPrompt) return;
                        const newExamples = [...(editedPrompt.examples || [])];
                        newExamples[index] = value;
                        setEditedPrompt({
                          ...editedPrompt,
                          examples: newExamples
                        });
                      }}
                      addExample={() => {
                        if (!editedPrompt) return;
                        setEditedPrompt({
                          ...editedPrompt,
                          examples: [...(editedPrompt.examples || []), '']
                        });
                      }}
                      removeExample={(index) => {
                        if (!editedPrompt) return;
                        const newExamples = [...(editedPrompt.examples || [])];
                        newExamples.splice(index, 1);
                        setEditedPrompt({
                          ...editedPrompt,
                          examples: newExamples
                        });
                      }}
                      onDelete={() => {
                        setShowDetailModal(false);
                        openDeleteModal(selectedPrompt);
                      }}
                      onEdit={() => {
                        setIsEditing(true);
                        setEditedPrompt(selectedPrompt);
                      }}
                    />
                  ) : (
                    // 其他用户视图或在推荐页面查看自己的提示词 - 只能查看描述
                    <PromptDescriptionView
                      prompt={selectedPrompt}
                      isOwner={isPromptOwner(selectedPrompt) && !showPublicPrompts}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="page-curl"></div>
          </div>
        </div>

        <div className="flex justify-between space-x-3 pt-4 border-t border-[rgba(120,180,140,0.3)]">
          {/* 左侧按钮区域 */}
          <div>
            {selectedPrompt && (
              <>
                {/* 非作者的提示词或在推荐页面查看自己的提示词 */}
                {(!isPromptOwner(selectedPrompt) || (isPromptOwner(selectedPrompt) && showPublicPrompts)) && (
                  <button
                    onClick={async () => {
                      try {
                        if (isPromptSelected) {
                          // 从用户选择中移除提示词
                          await removeUserPromptSelection(selectedPrompt.id!);
                          setIsPromptSelected(false);
                          alert(`已从下拉菜单中移除"${selectedPrompt.title}"`);
                        } else {
                          // 添加提示词到用户选择
                          await addUserPromptSelection(selectedPrompt.id!);
                          setIsPromptSelected(true);
                          alert(`已成功添加"${selectedPrompt.title}"到下拉菜单`);
                        }
                      } catch (error) {
                        console.error('操作提示词选项失败:', error);
                        alert('操作提示词选项失败，请重试');
                      }
                    }}
                    className={`btn-outline flex items-center text-sm px-4 py-2 ${
                      isPromptSelected
                        ? "text-[#e06f6f] border-[#e06f6f]"
                        : "text-[#5a9d6b] border-[#5a9d6b]"
                    }`}
                  >
                    <span className="material-icons mr-1 text-sm">{isPromptSelected ? 'remove' : 'add'}</span>
                    {isPromptSelected ? '从下拉菜单中移除' : '添加到下拉菜单'}
                  </button>
                )}

                {/* 在推荐页面查看自己的提示词时显示提示信息 */}
                {isPromptOwner(selectedPrompt) && showPublicPrompts && (
                  <div className="flex items-center text-text-medium text-sm ml-3">
                    <span className="material-icons text-xs mr-1 text-[#7D85CC]">info</span>
                    <span>要编辑此提示词，请前往"我的"页面</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 右侧按钮区域 */}
          <div className="flex space-x-3">
            {isEditing && isPromptOwner(selectedPrompt!) && !showPublicPrompts ? (
              <>
                <button
                  onClick={async () => {
                    if (!editedPrompt || !editedPrompt.id || !selectedPrompt) return;
                    try {
                      const updatedPrompt = {
                        ...editedPrompt,
                        type: selectedPrompt.type,
                        updatedAt: new Date(),
                        isPublic: editedPrompt.isPublic || false
                      };
                      await updatePrompt(updatedPrompt);
                      setSelectedPrompt(updatedPrompt);
                      setIsEditing(false);

                      // 刷新提示词列表
                      if (isValidPromptType(promptType)) {
                        const updatedPrompts = await getPromptsByType(promptType);
                        setPrompts(updatedPrompts);
                      }
                    } catch (error) {
                      console.error('更新提示词失败:', error);
                      alert('更新提示词失败，请重试');
                    }
                  }}
                  className="ghibli-button text-sm py-2"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedPrompt(selectedPrompt);
                  }}
                  className="ghibli-button outline text-sm py-2"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowDetailModal(false)}
                className="ghibli-button outline text-sm py-2"
              >
                关闭
              </button>
            )}
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
}







