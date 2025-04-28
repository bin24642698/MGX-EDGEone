/**
 * 档案编辑器组件
 */
import React, { useState, useEffect } from 'react';
import { Archive } from '@/data';

interface ArchiveEditorProps {
  archive?: Archive;
  workId?: number;
  onSave: (archive: Omit<Archive, 'id'>) => Promise<void>;
  onCancel: () => void;
}

// 定义创意地图类型常量
const creativeMapTypes = {
  'introduction': '导语',
  'outline': '大纲',
  'detailed_outline': '细纲',
  'worldbuilding': '世界观',
  'character': '角色',
  'plot': '情节'
} as const;

type CreativeMapTypeId = keyof typeof creativeMapTypes;

/**
 * 档案编辑器组件 - 创建和编辑档案
 */
export const ArchiveEditor: React.FC<ArchiveEditorProps> = ({
  archive,
  workId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<Archive, 'id'> & { category: CreativeMapTypeId }>({
    title: '',
    content: '',
    category: 'worldbuilding', // 默认世界观
    tags: [],
    workId: workId || 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 如果传入了档案，则初始化表单数据
  useEffect(() => {
    if (archive) {
      // 检查分类是否有效，否则设为默认的 'worldbuilding'
      const categoryIsValid = Object.keys(creativeMapTypes).includes(archive.category);
      setFormData({
        title: archive.title,
        content: archive.content,
        category: categoryIsValid ? archive.category as CreativeMapTypeId : 'worldbuilding', // 无效时设为默认值
        tags: archive.tags || [],
        workId: archive.workId || workId || 0,
        createdAt: archive.createdAt,
        updatedAt: new Date()
      });
    } else if (workId) {
      // 如果没有档案但有 workId，更新表单中的 workId
      setFormData(prev => ({
        ...prev,
        workId
      }));
    }
  }, [archive, workId]);

  // 处理输入变更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 添加标签
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  // 处理标签输入按键
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 确保提交的数据格式正确
      const dataToSave: Omit<Archive, 'id'> = {
        ...formData,
        category: formData.category, // 类型已在 state 中保证
        workId: formData.workId // 确保包含 workId
      };
      await onSave(dataToSave);
    } catch (error) {
      console.error('保存档案失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-text-dark text-sm font-medium mb-1">
          标题
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-[rgba(125,133,204,0.3)] px-3 py-2 focus:outline-none focus:border-[#7D85CC]"
          placeholder="输入档案标题"
          required
        />
      </div>

      <div>
        <label className="block text-text-dark text-sm font-medium mb-1">
          分类
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-[rgba(125,133,204,0.3)] px-3 py-2 focus:outline-none focus:border-[#7D85CC]"
        >
          {Object.entries(creativeMapTypes).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-text-dark text-sm font-medium mb-1">
          标签
        </label>
        <div className="flex gap-2 flex-wrap mb-2">
          {formData.tags && formData.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-[rgba(125,133,204,0.1)] rounded-full text-sm flex items-center"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-text-light hover:text-[#7D85CC]"
              >
                <span className="material-icons text-sm">close</span>
              </button>
            </span>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className="flex-1 rounded-l-lg border border-[rgba(125,133,204,0.3)] px-3 py-2 focus:outline-none focus:border-[#7D85CC]"
            placeholder="添加标签"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="bg-[#7D85CC] text-white px-3 py-2 rounded-r-lg"
          >
            添加
          </button>
        </div>
      </div>

      <div>
        <label className="block text-text-dark text-sm font-medium mb-1">
          内容
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-[rgba(125,133,204,0.3)] px-3 py-2 focus:outline-none focus:border-[#7D85CC] min-h-[200px]"
          placeholder="输入档案内容"
        ></textarea>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-[rgba(125,133,204,0.3)] rounded-lg text-text-dark hover:bg-[rgba(125,133,204,0.1)]"
          disabled={isSubmitting}
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#7D85CC] text-white rounded-lg hover:bg-[#6b73b3]"
          disabled={isSubmitting}
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
};

export default ArchiveEditor;