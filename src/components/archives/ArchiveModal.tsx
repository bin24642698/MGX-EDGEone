/**
 * 档案馆模态窗口组件
 */
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/modals';
import { Archive } from '@/data';
import { getAllArchives, getArchivesByCategory, getArchivesByWorkId, addArchive, updateArchive, deleteArchive } from '@/data';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (archive: Archive) => void;
  workId?: number; // 添加 workId 参数，指定当前操作的作品
  footer?: React.ReactNode; // 添加可选的自定义footer
  isMultiSelect?: boolean; // 添加多选模式开关
  initialSelectedIds?: number[]; // 添加初始选中的ID列表
}

// 创意地图类型常量
const creativeMapTypes = {
  'introduction': '导语',
  'outline': '大纲',
  'detailed_outline': '细纲',
  'worldbuilding': '世界观',
  'character': '角色',
  'plot': '情节'
} as const;

const LOCAL_STORAGE_KEY = 'archiveModalLastCategory'; // 定义 localStorage key

/**
 * 档案馆模态窗口组件
 */
export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  workId,
  footer,
  isMultiSelect = false, // 默认为单选
  initialSelectedIds = [] // 默认为空数组
}) => {
  // 状态
  const [archives, setArchives] = useState<Archive[]>([]);
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof creativeMapTypes>(() => {
    if (typeof window !== 'undefined') {
      try {
        const lastCategory = localStorage.getItem(LOCAL_STORAGE_KEY) as keyof typeof creativeMapTypes | null;
        if (lastCategory && lastCategory in creativeMapTypes) {
          return lastCategory;
        }
      } catch (error) {
        console.error("Error reading localStorage key " + LOCAL_STORAGE_KEY + ":", error);
      }
    }
    // 默认返回第一个有效的分类键
    return Object.keys(creativeMapTypes)[0] as keyof typeof creativeMapTypes;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingTitleId, setEditingTitleId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // 自动保存计时器状态
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // 将 initialSelectedIds 转换为 Set 以提高查找效率
  const selectedIdsSet = new Set(initialSelectedIds);

  // 加载档案
  const loadArchives = async () => {
    setIsLoading(true);
    setError('');

    try {
      let archiveData: Archive[];

      // 如果有 workId，表示只加载此作品的档案
      if (workId) {
        // 按作品ID和可选的分类加载档案
        if (selectedCategory) {
          archiveData = await getArchivesByWorkId(workId);
          archiveData = archiveData.filter(archive => archive.category === selectedCategory);
        } else {
          archiveData = await getArchivesByWorkId(workId);
        }
      } else {
        // 否则，加载全部档案或按分类加载
        if (selectedCategory) {
          archiveData = await getArchivesByCategory(selectedCategory);
        } else {
          archiveData = await getAllArchives();
        }
      }

      // 按 updatedAt 降序排序
      archiveData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setArchives(archiveData);

      // 默认选中第一条（如果列表不为空）
      if (archiveData.length > 0) {
        setSelectedArchive(archiveData[0]);
      } else {
        setSelectedArchive(null); // 如果列表为空，则不选中任何项
      }

    } catch (error) {
      console.error('加载档案失败:', error);
      setError('加载档案失败，请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  // 当模态窗口打开时加载档案
  useEffect(() => {
    if (isOpen) {
      loadArchives();
      // 关闭时重置状态
      return () => {
        setSelectedArchive(null);
        setError('');
        // 清理标题编辑状态
        setEditingTitleId(null);
        setEditingTitle('');
        // 清理搜索词
        setSearchTerm('');
      };
    }
  }, [isOpen, workId]);

  // 当分类改变时重新加载
  useEffect(() => {
    if (isOpen) {
      loadArchives();
    }
  }, [selectedCategory]);

  // Effect to save category to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // 确保 selectedCategory 是有效的 key
        if (selectedCategory && selectedCategory in creativeMapTypes) {
          localStorage.setItem(LOCAL_STORAGE_KEY, selectedCategory);
        }
        // 移除 else block，因为不再需要处理 null 或移除 key
      } catch (error) {
        console.error("Error setting localStorage key " + LOCAL_STORAGE_KEY + ":", error);
      }
    }
  }, [selectedCategory]);

  // 清理自动保存计时器
  useEffect(() => {
    // 当组件卸载、模态框关闭或选中的档案切换时，清除计时器
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [isOpen, selectedArchive, saveTimeout]); // 依赖项包含isOpen, selectedArchive和saveTimeout

  // 处理档案点击
  const handleArchiveClick = (archive: Archive) => {
    setSelectedArchive(archive);
    // 如果是多选模式，调用 onSelect 通知父组件切换选中状态
    if (isMultiSelect) {
      onSelect(archive);
    }
  };

  // 处理档案选择 (单选模式下的按钮)
  const handleSingleArchiveSelect = () => {
    if (selectedArchive && !isMultiSelect) { // 仅单选模式下有效
      onSelect(selectedArchive);
    }
  };

  // 处理档案编辑
  const handleEdit = () => {
    if (selectedArchive) {
      setEditingTitleId(selectedArchive.id || null);
      setEditingTitle(selectedArchive.title);
    }
  };

  // 处理档案创建
  const handleCreate = async () => {
    try {
      // 1. 创建新档案对象，标题默认为空
      const newArchive: Omit<Archive, 'id'> = {
        title: '', // 再次确认：默认标题设置为空字符串
        content: '',
        category: selectedCategory || 'worldbuilding',
        workId: workId || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 2. 保存新档案
      const createdArchive = await addArchive(newArchive);

      // 3. 选中新创建的档案并立即进入标题编辑模式
      if (createdArchive) {
        await loadArchives(); // 先重新加载列表
        setSelectedArchive(createdArchive); // 再设置选中项
        setEditingTitleId(createdArchive.id || null); // 进入标题编辑模式
        setEditingTitle(''); // 编辑框内容为空
      }
    } catch (error) {
      console.error('创建档案失败:', error);
      setError('创建档案失败，请稍后再试。');
    }
  };

  // 处理档案删除
  const handleDelete = async () => {
    if (selectedArchive && selectedArchive.id) {
      if (window.confirm('确定要删除这个档案吗？此操作不可撤销。')) {
        try {
          await deleteArchive(selectedArchive.id);
          setSelectedArchive(null);
          await loadArchives();
        } catch (error) {
          console.error('删除档案失败:', error);
          setError('删除档案失败，请稍后再试。');
        }
      }
    }
  };

  // 保存档案（更新）- 现在接收完整的 Archive 对象
  const handleSaveArchive = async (archiveData: Archive & { id: number }) => {
    console.log("[handleSaveArchive] Attempting to save:", archiveData); // 日志：尝试保存
    try {
      // 直接调用 updateArchive
      const updatedArchive = await updateArchive(archiveData);
      console.log("[handleSaveArchive] Successfully saved:", updatedArchive); // 日志：保存成功

      // 重新加载列表即可，不需要手动更新 selectedArchive 或编辑状态
      await loadArchives();

      // 如果当前预览的是被保存的档案，可以考虑更新预览状态（可选，因为列表会刷新）
      if (selectedArchive?.id === updatedArchive.id) {
          setSelectedArchive(updatedArchive);
      }

    } catch (error) {
      console.error('[handleSaveArchive] 保存档案失败:', error); // 日志：保存失败
      setError('保存档案失败，请稍后再试。');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingTitleId(null);
  };

  // 获取分类名称
  const getCategoryName = (categoryId: string): string => {
    if (categoryId in creativeMapTypes) {
      return creativeMapTypes[categoryId as keyof typeof creativeMapTypes];
    }
    return '未知分类';
  };

  // 过滤档案
  const filteredArchives = archives
    // 应用搜索过滤
    .filter(archive => {
      if (!searchTerm) return true;

      return (
        archive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        archive.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (archive.tags && archive.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    });

  // 根据是否有 workId 动态设置标题
  const modalTitle = workId ? "作品档案馆" : "全局档案馆";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={
        footer || (
          <div className="flex justify-between items-center w-full">
            <div>
              {selectedArchive ? (
                <div className="flex items-center">
                  <span className="material-icons text-sm mr-2 text-[rgba(125,133,204,0.7)]">update</span>
                  <span className="text-sm text-text-light">{new Date(selectedArchive.updatedAt).toLocaleString()}</span>
                </div>
              ) : (
                <div className="text-sm text-text-medium">
                  {workId !== undefined && (
                    <span className="flex items-center">
                      <span className="material-icons text-sm align-middle mr-1">folder_special</span>
                      当前作品档案
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {/* 条件渲染按钮区域 */}
              {selectedArchive && !isMultiSelect ? ( // 单选模式 + 有选中项: 显示"使用此档案"
                <button
                  onClick={handleSingleArchiveSelect}
                  className="px-4 py-2 bg-[#7D85CC] text-white rounded-lg hover:bg-[#6b73b3] flex items-center"
                >
                  <span className="material-icons text-lg mr-1">check</span> 使用此档案
                </button>
              ) : selectedArchive && isMultiSelect ? ( // 多选模式 + 有预览项: 不显示特定按钮 (null)
                 null
              ) : ( // 无选中项 (selectedArchive is null): 显示主"关闭"按钮
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#7D85CC] text-white rounded-lg hover:bg-[#6b73b3] flex items-center"
                >
                  关闭
                </button>
              )}
              {/* 始终显示的次要"关闭"按钮 */}
              <button
                onClick={onClose}
                className="px-4 py-2 border border-[rgba(125,133,204,0.3)] rounded-lg text-text-dark hover:bg-[rgba(125,133,204,0.1)]"
              >
                关闭
              </button>
            </div>
          </div>
        )
      }
      maxWidth="max-w-6xl"
    >
      <div className="h-full flex">
        {/* 左侧档案目录 */}
        <div className="w-2/5 pr-4 flex flex-col h-full">
          {/* 顶部搜索和过滤 */}
          <div className="mb-3 flex flex-col gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索档案..."
              className="w-full rounded-lg border border-[rgba(125,133,204,0.3)] px-3 py-2 focus:outline-none focus:border-[#7D85CC]"
            />
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as keyof typeof creativeMapTypes)}
                className="flex-1 rounded-lg border border-[rgba(125,133,204,0.3)] px-3 py-2 focus:outline-none focus:border-[#7D85CC]"
              >
                {Object.entries(creativeMapTypes).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              <button
                onClick={handleCreate}
                className="px-3 py-2 bg-[#7D85CC] text-white rounded-lg hover:bg-[#6b73b3] flex items-center shrink-0"
                title="新建档案"
              >
                <span className="material-icons text-sm mr-1">add</span>
                新建
              </button>
            </div>
          </div>

          {/* 档案列表 */}
          <div className="scrollable-container">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-[#7D85CC]">加载中...</span>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-red-500">{error}</span>
              </div>
            ) : filteredArchives.length === 0 ? (
              <div className="h-full flex items-center justify-center flex-col">
                <span className="material-icons text-4xl text-[rgba(125,133,204,0.3)] mb-2">folder_open</span>
                <span className="text-text-light text-center">
                  {workId !== undefined
                    ? '此作品还没有档案'
                    : '没有找到档案'
                  }
                </span>
                <button
                  onClick={handleCreate}
                  className="mt-4 px-4 py-2 bg-[#7D85CC] text-white rounded-lg hover:bg-[#6b73b3] flex items-center"
                >
                  <span className="material-icons text-lg mr-1">add</span>
                  添加第一个档案
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredArchives.map((archive) => {
                  const isMultiSelected = isMultiSelect && selectedIdsSet.has(archive.id as number);
                  const isCurrentlyEditing = selectedArchive?.id === archive.id;

                  return (
                    <div
                      key={archive.id}
                      className={`group p-3 rounded-lg transition-colors cursor-pointer flex items-start ${
                        isCurrentlyEditing
                        ? 'bg-[rgba(125,133,204,0.25)] border-l-4 border-[#7D85CC]' // 当前编辑项的样式
                        : isMultiSelected
                        ? 'bg-[rgba(125,133,204,0.2)] border-l-4 border-[#7D85CC]' // 多选选中项的样式
                        : 'hover:bg-[rgba(125,133,204,0.1)] border-l-4 border-transparent' // 默认和悬停样式
                      }`}
                      onClick={() => {
                        handleArchiveClick(archive);
                      }}
                    >
                      {/* 多选复选框 */}
                      {isMultiSelect && (
                        <input
                          type="checkbox"
                          checked={isMultiSelected}
                          readOnly // 状态由外部控制，点击整个div触发
                          className="mr-3 mt-1 h-4 w-4 text-[#7D85CC] focus:ring-[#7D85CC] border-gray-300 rounded cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation(); // 阻止冒泡
                            handleArchiveClick(archive); // 点击复选框也触发选中/取消
                          }}
                        />
                      )}
                      {/* 档案信息主体 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          {editingTitleId === archive.id ? (
                            // 编辑标题的 Input
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="flex-1 px-2 py-1 text-base font-medium rounded border-0 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-[#7D85CC]"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && archive.id !== undefined) {
                                  // 检查标题是否为空，为空则使用默认名称
                                  const finalTitle = editingTitle.trim() === '' ? '新建标签页' : editingTitle.trim();
                                  const updatedArchive = { ...archive, title: finalTitle, updatedAt: new Date(), id: archive.id };
                                  updateArchive(updatedArchive).then(() => {
                                    // 重新加载列表并清除编辑状态
                                    loadArchives().then(() => {
                                      // 更新选中的档案，如果它当前被选中
                                      if (selectedArchive?.id === archive.id) {
                                        setSelectedArchive(prev => prev ? {...prev, title: finalTitle, updatedAt: updatedArchive.updatedAt} : null);
                                      }
                                      setEditingTitleId(null);
                                    });
                                  });
                                } else if (e.key === 'Escape') {
                                  setEditingTitleId(null);
                                  // 如果是新建的空标题取消编辑，则删除该档案？ (可选逻辑，暂不实现)
                                  // if (archive.title === '') deleteArchive(archive.id as number).then(loadArchives);
                                }
                              }}
                              onBlur={() => {
                                // 检查标题是否为空，为空则使用默认名称
                                const finalTitle = editingTitle.trim() === '' ? '新建标签页' : editingTitle.trim();
                                if (archive.id !== undefined) {
                                  // 只有在标题确实更改过或从默认空变成默认名时才保存
                                  if (finalTitle !== archive.title) {
                                    const updatedArchive = { ...archive, title: finalTitle, updatedAt: new Date(), id: archive.id };
                                    updateArchive(updatedArchive).then(() => {
                                      // 重新加载列表并清除编辑状态
                                      loadArchives().then(() => {
                                        // 更新选中的档案，如果它当前被选中
                                        if (selectedArchive?.id === archive.id) {
                                          setSelectedArchive(prev => prev ? {...prev, title: finalTitle, updatedAt: updatedArchive.updatedAt} : null);
                                        }
                                        setEditingTitleId(null);
                                      });
                                    });
                                  } else {
                                    // 标题未更改，直接退出编辑模式
                                    setEditingTitleId(null);
                                  }
                                } else {
                                  // ID 不存在，直接退出编辑模式
                                  setEditingTitleId(null);
                                }
                                // 如果是新建的空标题取消编辑，则删除该档案？ (可选逻辑，暂不实现)
                                // if (finalTitle === '新建标签页' && archive.title === '') deleteArchive(archive.id as number).then(loadArchives);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            // 显示标题和类型图标
                            <div className="flex items-center flex-1 overflow-hidden">
                              <div
                                className={`w-5 h-5 rounded-full mr-2 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold
                                    ${archive.category === 'introduction' ? 'bg-[#71a6d2]' :
                                      archive.category === 'outline' ? 'bg-[#7d85cc]' :
                                      archive.category === 'detailed_outline' ? 'bg-[#9c6fe0]' :
                                      archive.category === 'worldbuilding' ? 'bg-[#e0976f]' :
                                      archive.category === 'character' ? 'bg-[#e07f7f]' :
                                      archive.category === 'plot' ? 'bg-[#8bad97]' :
                                      'bg-[#a0a0a0]'}`}
                                title={getCategoryName(archive.category)}
                              >
                                {getCategoryName(archive.category).charAt(0)}
                              </div>
                              <div className="font-medium truncate text-base">
                                {archive.title}
                              </div>
                            </div>
                          )}
                          {/* 编辑和删除按钮 */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTitleId(archive.id || null);
                                setEditingTitle(archive.title);
                              }}
                              className="p-1 rounded-full hover:bg-[rgba(125,133,204,0.2)] text-[#7D85CC]"
                              title="重命名"
                            >
                              <span className="material-icons text-sm">edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`确定要删除"${archive.title}"吗？`)) {
                                  if (archive.id !== undefined) {
                                    deleteArchive(archive.id).then(() => {
                                      if (selectedArchive?.id === archive.id) {
                                        setSelectedArchive(null);
                                      }
                                      loadArchives();
                                    });
                                  }
                                }
                              }}
                              className="p-1 rounded-full hover:bg-[rgba(255,100,100,0.2)] text-red-500"
                              title="删除"
                            >
                              <span className="material-icons text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                        {/* 分类和日期 */}
                        <div className={`text-sm text-text-light flex justify-between items-center mt-1 ${isMultiSelect ? 'pl-0' : 'pl-7'}`}> {/* 移除 pl-7 如果有复选框 */}
                          <span className="text-xs italic">{getCategoryName(archive.category)}</span>
                          <span className="text-xs">{new Date(archive.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 右侧内容/编辑区 */}
        <div className="w-3/5 pl-4 border-l border-[rgba(125,133,204,0.2)] h-full flex flex-col">
          {selectedArchive ? (
            <div className="h-full flex flex-col">
              {/* 直接显示内容编辑区，增强美观性 */}
              <div className="flex-1 overflow-y-auto bg-[rgba(250,253,250,0.8)] rounded-lg shadow-sm">
                <textarea
                  value={selectedArchive.content}
                  onChange={(e) => {
                    const newContent = e.target.value;
                    const now = new Date();

                    // 1. 更新本地状态
                    const updatedSelected = {
                      ...selectedArchive,
                      content: newContent,
                      updatedAt: now
                    };
                    setSelectedArchive(updatedSelected);

                    // 2. 清除旧计时器
                    if (saveTimeout) {
                      clearTimeout(saveTimeout);
                    }

                    // 3. 设置新计时器以自动保存
                    const newTimeout = setTimeout(() => {
                      // 确保 updatedSelected 及其 id 存在
                      if (updatedSelected && updatedSelected.id !== undefined) {
                        console.log("[setTimeout] Triggering auto-save for:", updatedSelected.id); // 日志：触发保存
                        // 直接传递包含 id 的 updatedSelected 对象
                        handleSaveArchive(updatedSelected as Archive & { id: number });
                      } else {
                        console.warn("[setTimeout] Auto-save skipped: Archive or ID missing.", updatedSelected); // 日志：跳过保存
                      }
                    }, 1000); // 1秒延迟

                    setSaveTimeout(newTimeout);
                  }}
                  onBlur={() => {
                    // 检查是否有待处理的自动保存
                    if (saveTimeout) {
                      console.log("[onBlur] Pending save detected, saving immediately."); // 日志：检测到待处理保存
                      // 清除计时器
                      clearTimeout(saveTimeout);
                      // 立即保存
                      if (selectedArchive && selectedArchive.id !== undefined) {
                        handleSaveArchive(selectedArchive as Archive & { id: number });
                      }
                      // 重置计时器状态
                      setSaveTimeout(null);
                    }
                  }}
                  className="w-full h-full rounded-lg px-4 py-3 focus:outline-none border-0 bg-transparent resize-none font-normal text-base leading-relaxed"
                  placeholder="输入档案内容..."
                  style={{
                    backgroundImage: "linear-gradient(transparent, transparent 26px, #e6f1eb 26px, #e6f1eb 27px)",
                    backgroundSize: "100% 27px",
                    lineHeight: "27px",
                  }}
                ></textarea>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center flex-col bg-[rgba(250,253,250,0.5)] rounded-lg">
              <span className="material-icons text-7xl text-[rgba(125,133,204,0.2)] mb-4">description</span>
              <p className="text-text-light mb-6 text-center">选择左侧的档案<br/>或创建新档案</p>
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-[#7D85CC] text-white rounded-full hover:bg-[#6b73b3] flex items-center shadow-sm hover:shadow-md transition-all transform hover:translate-y-[-1px]"
              >
                <span className="material-icons text-lg mr-1">add</span>
                新建档案
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ArchiveModal;