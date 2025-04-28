'use client';

import React, { useState } from 'react';
import { Prompt } from '@/data';
import { promptTypeMap } from './PromptDetailContent';
import { PromptContentEditModal } from './PromptContentEditModal';

// 将类型颜色转换为胶带颜色
const getTypeColor = (type: string): string => {
  const colorClass = promptTypeMap[type as keyof typeof promptTypeMap]?.color.split(' ')[1] || 'text-[#7D85CC]';
  // 从 text-[#7D85CC] 提取 #7D85CC
  const colorHex = colorClass.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#7D85CC';
  return colorHex.replace('#', 'rgba(') + ', 0.7)';
};

interface PromptDetailViewProps {
  prompt: Prompt;
  isEditing: boolean;
  editedPrompt?: Prompt;
  handleInputChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleExampleChange?: (index: number, value: string) => void;
  addExample?: () => void;
  removeExample?: (index: number) => void;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

/**
 * 提示词详情视图组件 - 仅提示词作者可见
 */
export function PromptDetailView({
  prompt,
  isEditing,
  editedPrompt,
  handleInputChange,
  handleExampleChange,
  addExample,
  removeExample,
  onSave,
  onCancel,
  onDelete,
  onEdit
}: PromptDetailViewProps) {
  // 状态
  const [isContentEditModalOpen, setIsContentEditModalOpen] = useState(false);

  // 提示词类型的信息
  const typeInfo = promptTypeMap[prompt.type as keyof typeof promptTypeMap];
  const typeColor = getTypeColor(prompt.type);

  // 格式化日期显示
  const formatDate = (date: Date | string | number) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 处理内容变更
  const handleContentChange = (newContent: string) => {
    if (handleInputChange) {
      handleInputChange({
        target: {
          name: 'content',
          value: newContent
        }
      } as React.ChangeEvent<HTMLTextAreaElement>);
    }
  };

  if (isEditing) {
    // 编辑模式
    return (
      <div className="ghibli-card p-6 animate-fadeIn relative min-h-[500px] flex flex-col">
        {/* 顶部胶带 */}
        <div className="tape" style={{ backgroundColor: typeColor }}>
          <div className="tape-texture"></div>
        </div>

        <div className="mt-6 flex-grow">
          <form className="space-y-6 h-full flex flex-col">
            {/* 提示词标题 */}
            <div>
              <label className="block text-text-dark font-medium mb-2">标题</label>
              <input
                type="text"
                name="title"
                className="w-full px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] text-text-dark"
                placeholder="输入提示词标题..."
                value={editedPrompt?.title || ''}
                onChange={handleInputChange}
              />
            </div>

            {/* 提示词内容 */}
            <div>
              <label className="block text-text-dark font-medium mb-2">内容</label>
              <div
                className="w-full px-4 py-3 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] text-text-dark min-h-[120px] overflow-y-auto break-words whitespace-pre-wrap cursor-pointer hover:bg-white hover:bg-opacity-90 transition-colors"
                onClick={() => setIsContentEditModalOpen(true)}
              >
                {editedPrompt?.content || '点击此处编辑提示词内容...'}
              </div>

              {/* 内容编辑弹窗 */}
              <PromptContentEditModal
                isOpen={isContentEditModalOpen}
                onClose={() => setIsContentEditModalOpen(false)}
                content={editedPrompt?.content || ''}
                onChange={handleContentChange}
                onSave={() => {}}
              />
            </div>

            {/* 提示词描述 */}
            <div className="flex-grow flex flex-col">
              <label className="block text-text-dark font-medium mb-2">描述 <span className="text-text-light text-sm">(可选)</span></label>
              <textarea
                name="description"
                className="w-full px-4 py-3 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] text-text-dark flex-grow min-h-[160px]"
                placeholder="简短描述提示词的用途..."
                value={editedPrompt?.description || ''}
                onChange={handleInputChange}
              ></textarea>
            </div>

            {/* 公开设置 */}
            <div>
              <label className="block text-text-dark font-medium mb-2">提示词权限</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={editedPrompt?.isPublic || false}
                    onChange={(e) => handleInputChange && handleInputChange({
                      target: {
                        name: 'isPublic',
                        value: e.target.checked
                      }
                    } as React.ChangeEvent<HTMLInputElement>)}
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

            {/* 示例管理 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-text-dark font-medium">示例 <span className="text-text-light text-sm">(可选)</span></label>
                {addExample && (
                  <button
                    type="button"
                    onClick={addExample}
                    className="flex items-center text-sm text-[#5a9d6b] hover:underline"
                  >
                    <span className="material-icons mr-1 text-sm">add</span>
                    添加示例
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {editedPrompt?.examples && editedPrompt.examples.map((example, index) => (
                  <div key={index} className="flex items-start">
                    <textarea
                      className="flex-grow px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] text-text-dark"
                      placeholder={`示例 ${index + 1}...`}
                      value={example}
                      onChange={(e) => handleExampleChange && handleExampleChange(index, e.target.value)}
                      rows={2}
                    ></textarea>
                    {removeExample && (
                      <button
                        type="button"
                        onClick={() => removeExample(index)}
                        className="ml-2 text-[#E06F6F] hover:text-[#d85050]"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end mt-6 space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="btn-outline flex items-center text-sm px-4 py-2"
            >
              <span className="material-icons mr-1 text-sm">cancel</span>
              取消
            </button>
          )}

          {onSave && (
            <button
              onClick={onSave}
              className="btn-fill flex items-center text-sm px-4 py-2"
            >
              <span className="material-icons mr-1 text-sm">save</span>
              保存
            </button>
          )}
        </div>

        {/* 翻页效果 */}
        <div className="page-curl"></div>
      </div>
    );
  } else {
    // 查看模式
    return (
      <div className="ghibli-card p-6 animate-fadeIn relative min-h-[500px] flex flex-col">
        {/* 顶部胶带 */}
        <div className="tape" style={{ backgroundColor: typeColor }}>
          <div className="tape-texture"></div>
        </div>

        {/* 标题和类型栏 */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <h2 className="text-xl font-medium text-text-dark">{prompt.title}</h2>
          <div className="flex items-center">
            <span className={`flex items-center px-3 py-1 rounded-full text-sm ${typeInfo.color}`}>
              <span className="material-icons mr-1 text-sm">{typeInfo.icon}</span>
              {typeInfo.label}
            </span>
          </div>
        </div>

        {/* 提示词内容区 */}
        <div className="mb-6 flex-grow">
          {/* 提示词描述 */}
          <div className="mb-4">
            <h4 className="text-text-dark font-medium mb-2">提示词描述</h4>
            {prompt.description ? (
              <div className="p-5 bg-white bg-opacity-50 rounded-xl border border-[rgba(120,180,140,0.2)]">
                <p className="whitespace-pre-wrap text-text-medium">{prompt.description}</p>
              </div>
            ) : (
              <div className="p-5 bg-white bg-opacity-50 rounded-xl border border-[rgba(120,180,140,0.2)] text-center flex items-center justify-center h-24">
                <p className="text-text-light italic">暂无描述信息</p>
              </div>
            )}
          </div>

          {/* 提示词内容 - 已删除 */}

          {/* 示例 */}
          {prompt.examples && prompt.examples.length > 0 && (
            <div className="mt-4">
              <h4 className="text-text-dark font-medium mb-2">示例</h4>
              <div className="space-y-3">
                {prompt.examples.map((example, index) => (
                  <div key={index} className="p-4 bg-white bg-opacity-50 rounded-xl border border-[rgba(120,180,140,0.2)]">
                    <p className="whitespace-pre-wrap text-text-medium">{example}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部元信息 */}
        <div className="flex items-center justify-between text-text-light text-sm mt-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="material-icons text-xs mr-1">event</span>
              创建于: {formatDate(prompt.createdAt)}
            </div>
            {prompt.isPublic && (
              <div className="flex items-center text-green-600">
                <span className="material-icons text-xs mr-1">public</span>
                公开提示词
              </div>
            )}
          </div>
          <div className="flex items-center">
            <span className="material-icons text-xs mr-1">update</span>
            更新于: {formatDate(prompt.updatedAt)}
          </div>
        </div>

        {/* 翻页效果 */}
        <div className="page-curl"></div>

        {/* 操作按钮区 */}
        <div className="flex justify-end mt-6 space-x-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="btn-outline flex items-center text-sm px-4 py-2"
            >
              <span className="material-icons mr-1 text-sm">edit</span>
              编辑
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="btn-outline flex items-center text-sm px-4 py-2 text-[#E06F6F] border-[#E06F6F]"
            >
              <span className="material-icons mr-1 text-sm">delete</span>
              删除
            </button>
          )}
        </div>
      </div>
    );
  }
}
