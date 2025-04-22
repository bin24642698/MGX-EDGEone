/**
 * 作品编辑器组件
 */
import React, { useState, useEffect } from 'react';
import { Work } from '@/types';
import { Button, Input, TextArea, Select } from '@/components/common';

interface WorkEditorProps {
  work?: Work;
  onSave: (work: Omit<Work, 'id'>) => Promise<void>;
  onCancel: () => void;
}

/**
 * 作品编辑器组件
 * @param props 作品编辑器属性
 * @returns 作品编辑器组件
 */
export const WorkEditor: React.FC<WorkEditorProps> = ({
  work,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<Work, 'id'>>({
    title: '',
    description: '',
    type: 'novel',
    content: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    content: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 如果传入了作品，则初始化表单数据
  useEffect(() => {
    if (work) {
      setFormData({
        title: work.title,
        description: work.description,
        type: work.type,
        content: work.content,
        createdAt: work.createdAt,
        updatedAt: new Date()
      });
    }
  }, [work]);
  
  // 处理输入变更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除错误
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // 验证表单
  const validateForm = (): boolean => {
    const newErrors = {
      title: '',
      description: '',
      content: ''
    };
    
    let isValid = true;
    
    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空';
      isValid = false;
    }
    
    if (formData.title.length > 100) {
      newErrors.title = '标题不能超过100个字符';
      isValid = false;
    }
    
    if (formData.description.length > 500) {
      newErrors.description = '描述不能超过500个字符';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('保存作品失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="标题"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        placeholder="输入作品标题"
        error={errors.title}
        required
      />
      
      <Select
        label="类型"
        name="type"
        value={formData.type}
        onChange={handleInputChange}
        options={[
          { value: 'novel', label: '小说' },
          { value: 'character', label: '角色' },
          { value: 'worldbuilding', label: '世界观' },
          { value: 'plot', label: '情节' }
        ]}
      />
      
      <TextArea
        label="描述"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        placeholder="输入作品描述（可选）"
        error={errors.description}
        rows={3}
      />
      
      <TextArea
        label="内容"
        name="content"
        value={formData.content}
        onChange={handleInputChange}
        placeholder="输入作品内容"
        error={errors.content}
        rows={10}
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          取消
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  );
};
