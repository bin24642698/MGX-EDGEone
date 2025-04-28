'use client';

import React from 'react';

interface PromptContentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
}

/**
 * 提示词内容编辑弹窗组件
 */
export function PromptContentEditModal({
  isOpen,
  onClose,
  content,
  onChange,
  onSave
}: PromptContentEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-card-color rounded-2xl w-full max-w-4xl h-[80vh] shadow-xl relative flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-[rgba(120,180,140,0.3)]">
          <h2 className="text-2xl font-bold text-text-dark font-ma-shan">编辑提示词内容</h2>
          <button
            className="text-gray-500 hover:text-gray-700 w-6 flex justify-center"
            onClick={onClose}
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="flex-grow p-6 overflow-hidden">
          <textarea
            className="w-full h-full px-4 py-3 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] text-text-dark overflow-y-auto break-words whitespace-pre-wrap resize-none"
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="输入提示词内容..."
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-[rgba(120,180,140,0.3)]">
          <button
            onClick={() => {
              onSave();
              onClose();
            }}
            className="ghibli-button text-sm py-2"
          >
            保存
          </button>
          <button
            onClick={onClose}
            className="ghibli-button outline text-sm py-2"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
