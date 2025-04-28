'use client';

import React from 'react';
import { Prompt } from '@/data';
import { promptTypeMap } from './PromptDetailContent';

// 将类型颜色转换为胶带颜色
const getTypeColor = (type: string): string => {
  // 检查类型是否存在于映射中
  if (!promptTypeMap[type as keyof typeof promptTypeMap]) {
    return 'rgba(125, 133, 204, 0.7)'; // 默认颜色
  }

  const colorClass = promptTypeMap[type as keyof typeof promptTypeMap].color.split(' ')[1] || 'text-[#7D85CC]';
  // 从 text-[#7D85CC] 提取 #7D85CC
  const colorHex = colorClass.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#7D85CC';
  return colorHex.replace('#', 'rgba(') + ', 0.7)';
};

interface PromptDescriptionViewProps {
  prompt: Prompt;
  isOwner: boolean;
  onEdit?: () => void;
}

/**
 * 提示词描述视图组件 - 所有用户可见
 */
export function PromptDescriptionView({
  prompt,
  isOwner,
  onEdit
}: PromptDescriptionViewProps) {
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

      {/* 提示词描述区 */}
      <div className="mb-6 flex-grow">
        {prompt.description ? (
          <div className="h-full">
            <div className="p-5 bg-white bg-opacity-50 rounded-xl border border-[rgba(120,180,140,0.2)] min-h-[320px]">
              <p className="whitespace-pre-wrap text-text-medium">{prompt.description}</p>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <div className="p-5 bg-white bg-opacity-50 rounded-xl border border-[rgba(120,180,140,0.2)] text-center min-h-[320px] flex items-center justify-center">
              <p className="text-text-light italic">暂无描述信息</p>
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
        {isOwner && onEdit && (
          <button
            onClick={onEdit}
            className="btn-outline flex items-center text-sm px-4 py-2"
          >
            <span className="material-icons mr-1 text-sm">edit</span>
            编辑
          </button>
        )}
      </div>
    </div>
  );
}
