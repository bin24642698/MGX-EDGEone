'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import BackButton from '@/components/BackButton';
import { Prompt, addPrompt, deletePrompt, getAllPrompts, getPromptsByType, updatePrompt } from '@/lib/db';
import { PromptDetailContent, promptTypeMap as promptDetailTypeMap } from '@/components/prompts/PromptDetailContent';

// 提示词类型映射
const promptTypeMap = {
  'ai_writing': { label: 'AI写作', color: 'bg-[#E0976F20] text-[#E0976F]', icon: 'create', group: 'novel', gradient: 'from-[#E0976F] to-[#E0C56F]' },
  'ai_polishing': { label: 'AI润色', color: 'bg-[#6F9CE020] text-[#6F9CE0]', icon: 'auto_fix_high', group: 'novel', gradient: 'from-[#6F9CE0] to-[#9C6FE0]' },
  'ai_analysis': { label: 'AI分析', color: 'bg-[#7D85CC20] text-[#7D85CC]', icon: 'analytics', group: 'novel', gradient: 'from-[#7D85CC] to-[#6F9CE0]' },
  'worldbuilding': { label: '世界观', color: 'bg-[#E06F9C20] text-[#E06F9C]', icon: 'public', group: 'creative', gradient: 'from-[#E06F9C] to-[#E0976F]' },
  'character': { label: '角色', color: 'bg-[#9C6FE020] text-[#9C6FE0]', icon: 'person', group: 'creative', gradient: 'from-[#9C6FE0] to-[#7D85CC]' },
  'plot': { label: '情节', color: 'bg-[#6F9CE020] text-[#6F9CE0]', icon: 'timeline', group: 'creative', gradient: 'from-[#6F9CE0] to-[#9C6FE0]' },
  'introduction': { label: '导语', color: 'bg-[#7D85CC20] text-[#7D85CC]', icon: 'format_quote', group: 'creative', gradient: 'from-[#7D85CC] to-[#6F9CE0]' },
  'outline': { label: '大纲', color: 'bg-[#E0976F20] text-[#E0976F]', icon: 'format_list_bulleted', group: 'creative', gradient: 'from-[#E0976F] to-[#E0C56F]' },
  'detailed_outline': { label: '细纲', color: 'bg-[#E0C56F20] text-[#E0C56F]', icon: 'subject', group: 'creative', gradient: 'from-[#E0C56F] to-[#E0976F]' }
} as const;

// 提示词类型
type PromptType = keyof typeof promptTypeMap;

// 分组定义
const promptGroups = {
  'novel': {
    label: '小说创作',
    color: 'from-[#7D85CC] to-[#E0976F]',
    icon: 'auto_stories',
    types: ['ai_writing', 'ai_polishing', 'ai_analysis'] as PromptType[]
  },
  'creative': {
    label: '创意地图',
    color: 'from-[#9C6FE0] to-[#E06F9C]',
    icon: 'map',
    types: ['introduction', 'outline', 'detailed_outline', 'character', 'worldbuilding', 'plot'] as PromptType[]
  }
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
  'detailed_outline': ''
};

// 定义Modal组件的参数类型
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

// 弹窗组件 - 吉卜力风格
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        {/* 背景遮罩 */}
        <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* 弹窗内容 */}
        <div className={`relative inline-block bg-card-color rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${maxWidth} w-full`}>
          <div className="grid-background absolute inset-0 opacity-30"></div>

          {/* 胶带装饰 */}
          <div className="tape" style={{ backgroundColor: 'rgba(90,157,107,0.7)', width: '120px', height: '40px', top: '-20px', left: '50%', transform: 'translateX(-50%) rotate(-2deg)' }}>
            <div className="tape-texture"></div>
          </div>

          {/* 弹窗标题 */}
          <div className="px-6 pt-8 pb-4 flex items-center justify-between border-b border-[rgba(120,180,140,0.2)]">
            <h3 className="text-xl font-medium text-text-dark" style={{fontFamily: "'Ma Shan Zheng', cursive"}}>
              {title}
            </h3>
            <button
              className="p-2 rounded-full hover:bg-[rgba(120,180,140,0.1)]"
              onClick={onClose}
            >
              <span className="material-icons text-text-medium">close</span>
            </button>
          </div>

          {/* 弹窗内容 */}
          <div className="px-6 py-4 h-[500px] overflow-y-auto">
            {children}
          </div>

          {/* 翻页装饰 */}
          <div className="page-curl"></div>

          {/* 装饰元素 */}
          <div className="dot hidden md:block" style={{ bottom: "15px", right: "40%" }}></div>
        </div>
      </div>
    </div>
  );
};

export default function PromptsPage() {
  const router = useRouter();
  // 删除了搜索状态
  // 删除了创建提示词弹窗状态
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typePrompts, setTypePrompts] = useState<{[key in PromptType]?: Prompt[]}>({});
  // 获取当前选择的类型，默认为ai_writing
  const [selectedType, setSelectedType] = useState<PromptType>('ai_writing');

  const [formData, setFormData] = useState({
    title: '',
    type: selectedType,
    content: promptTemplates[selectedType],
    description: '',
    examples: ['']
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState<Prompt | null>(null);

  // 加载提示词数据
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        setIsLoading(true);
        const loadedPrompts = await getAllPrompts();
        setPrompts(loadedPrompts);
      } catch (error) {
        console.error('加载提示词失败:', error);
        // 如果没有数据，设置为空数组
        setPrompts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrompts();
  }, []);

  // 加载所有类型的提示词数量
  useEffect(() => {
    const loadAllTypePrompts = async () => {
      const types = Object.keys(promptTypeMap) as PromptType[];
      const typePromptsObj: {[key in PromptType]?: Prompt[]} = {};

      for (const type of types) {
        try {
          const typePrompts = await getPromptsByType(type);
          typePromptsObj[type] = typePrompts;
        } catch (error) {
          console.error(`加载${type}类型提示词失败:`, error);
          typePromptsObj[type] = [];
        }
      }

      setTypePrompts(typePromptsObj);
    };

    loadAllTypePrompts();
  }, []);

  // 删除了过滤提示词的代码

  // 处理类型变更 - 从选择器
  const handleTypeChangeFromSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as Prompt['type'];
    handleTypeChange(newType);
  };

  // 处理输入变更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 处理示例变更
  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...formData.examples];
    newExamples[index] = value;
    setFormData({
      ...formData,
      examples: newExamples
    });
  };

  // 添加示例
  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, '']
    });
  };

  // 移除示例
  const removeExample = (index: number) => {
    const newExamples = [...formData.examples];
    newExamples.splice(index, 1);
    setFormData({
      ...formData,
      examples: newExamples
    });
  };

  // 处理类型变更
  const handleTypeChange = (newType: PromptType) => {
    setSelectedType(newType);
    setFormData(prev => ({
      ...prev,
      type: newType,
      content: promptTemplates[newType] || ''
    }));
  };

  // 删除了主页面的创建提示词功能

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
      const promptData: Omit<Prompt, 'id'> = {
        ...formData,
        createdAt: now,
        updatedAt: now
      };

      const newPrompt = await addPrompt(promptData);
      setPrompts(prev => [newPrompt, ...prev]);

      // 刷新列表
      const updatedPrompts = await getAllPrompts();
      setPrompts(updatedPrompts);
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

      // 刷新提示词列表
      const updatedPrompts = await getAllPrompts();
      setPrompts(updatedPrompts);
    } catch (error) {
      console.error('删除提示词失败:', error);
      alert('删除提示词失败，请重试');
    }
  };

  // 打开提示词详情弹窗
  const openDetailModal = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setEditedPrompt(prompt);
    setIsEditing(false);
    setShowDetailModal(true);
  };

  // 处理卡片点击
  const handleCardClick = async (type: PromptType) => {
    router.push(`/prompts/type/${type}`);
  };

  return (
    <div className="flex h-screen bg-bg-color animate-fadeIn">
      <Sidebar activeMenu="prompts" />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar
          title="提示词管理"
          showBackButton={true}
        />

        <div className="flex-1 overflow-auto p-6">

          {Object.entries(promptGroups).map(([groupId, group]) => (
            <div key={groupId} className="mb-12">
              <div className="flex items-center mb-6">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${group.color} flex items-center justify-center mr-3 text-white`}>
                  <span className="material-icons">{group.icon}</span>
                </div>
                <h2 className="text-2xl font-medium text-text-dark font-ma-shan">{group.label}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.types.map(type => {
                  const typeInfo = promptTypeMap[type];
                  const typePromptsCount = typePrompts[type]?.length || 0;

                  return (
                    <div
                      key={type}
                      className="ghibli-card p-6 cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                      onClick={() => handleCardClick(type)}
                      style={{
                        borderColor: typeInfo.color.split(' ')[1].replace('text-', 'rgba(').replace(/\]/, ', 0.4)')
                      }}
                    >
                      <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${typeInfo.color.split(' ')[0]}`}>
                          <span className={`material-icons ${typeInfo.color.split(' ')[1]}`}>{typeInfo.icon}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-text-dark font-ma-shan">{typeInfo.label}</h3>
                          <p className="text-text-medium text-sm">{typePromptsCount} 个提示词</p>
                        </div>
                      </div>

                      <p className="text-text-medium text-sm mb-4">
                        {type === 'ai_writing' && '用于AI辅助创作小说内容，生成高质量文学作品的提示词'}
                        {type === 'ai_polishing' && '用于AI润色和优化已有文本，提升文学性和可读性的提示词'}
                        {type === 'ai_analysis' && '用于AI分析文学作品的结构、人物、情节和主题的提示词'}
                        {type === 'worldbuilding' && '用于设计和描述故事世界设定的提示词'}
                        {type === 'character' && '用于塑造和深化角色形象的提示词'}
                        {type === 'plot' && '用于构思和完善故事情节的提示词'}
                        {type === 'introduction' && '用于创作引人入胜的开篇导语的提示词'}
                        {type === 'outline' && '用于规划故事主线和章节的提示词'}
                        {type === 'detailed_outline' && '用于设计细节丰富的章节内容的提示词'}
                      </p>

                      <div className="mt-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${typeInfo.color}`}>
                          <span className="material-icons mr-1 text-sm">visibility</span>
                          查看全部
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 删除了搜索结果部分 */}
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#E06F6F] to-[#E0976F] flex items-center justify-center mr-3 text-white">
              <span className="material-icons text-sm">delete_forever</span>
            </div>
            <span>删除提示词</span>
          </div>
        }
        maxWidth="max-w-md"
      >
        <div className="p-4">
          <div className="flex items-center mb-6">
            <span className="material-icons text-[#E06F6F] text-3xl mr-4">warning</span>
            <p className="text-text-dark">确定要删除提示词 <span className="font-semibold">{selectedPrompt?.title}</span> 吗？</p>
          </div>
          <p className="mb-6 text-text-medium text-sm bg-[rgba(224,111,111,0.1)] p-3 rounded-lg">此操作无法撤销，删除后将无法恢复此提示词。</p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-outline"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 rounded-xl flex items-center justify-center text-sm font-medium transition-colors duration-200 bg-[#E06F6F] text-white hover:bg-[#c95f5f]"
            >
              <span className="material-icons mr-1 text-sm">delete</span>
              确认删除
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedPrompt?.title || '提示词详情'}
      >
        <div>
          {selectedPrompt && (
            <>
              <PromptDetailContent
                prompt={selectedPrompt}
                isEditing={isEditing}
                editedPrompt={editedPrompt || undefined}
                handleInputChange={(e) => {
                  const { name, value } = e.target;
                  // 忽略对type字段的修改
                  if (name === 'type') return;
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
                onEdit={() => {
                  setIsEditing(true);
                  setEditedPrompt(selectedPrompt);
                }}
                onSave={async () => {
                  if (!editedPrompt || !editedPrompt.id || !selectedPrompt) return;
                  try {
                    const updatedPrompt = {
                      ...editedPrompt,
                      type: selectedPrompt.type,
                      updatedAt: new Date()
                    };
                    await updatePrompt(updatedPrompt);
                    // 更新本地数据
                    setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
                    setSelectedPrompt(updatedPrompt);
                    setIsEditing(false);
                    setShowDetailModal(true); // 重新打开详情模式
                  } catch (error) {
                    console.error('更新提示词失败:', error);
                  }
                }}
                onCancel={() => {
                  setIsEditing(false);
                  setEditedPrompt(null);
                }}
                onDelete={() => {
                  if (selectedPrompt) {
                    openDeleteModal(selectedPrompt);
                  }
                }}
                onCopy={() => {
                  if (selectedPrompt) {
                    navigator.clipboard.writeText(selectedPrompt.content);
                    alert('提示词已复制到剪贴板');
                  }
                }}
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}