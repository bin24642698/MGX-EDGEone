/**
 * 提示词卡片组件
 */
import React from 'react';
import { Prompt } from '@/types';
import { Card } from '@/components/common';

interface PromptTypeInfo {
  label: string;
  color: string;
  icon: string;
  group: string;
  gradient: string;
}

interface PromptCardProps {
  prompt: Prompt;
  typeInfo: PromptTypeInfo;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

/**
 * 提示词卡片组件
 * @param props 提示词卡片属性
 * @returns 提示词卡片组件
 */
export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  typeInfo,
  onClick,
  onDelete
}) => {
  // 提取颜色代码用于胶带
  const tapeColor = typeInfo.color.split(' ')[1].replace('text-', 'rgba(').replace(/\]/, ', 0.7)');
  
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-all duration-300 relative"
      onClick={onClick}
      tapeColor={tapeColor}
      withPageCurl={true}
    >
      <div className="flex items-start">
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mr-3 ${typeInfo.color.split(' ')[0]}`}>
          <span className={`material-icons ${typeInfo.color.split(' ')[1]}`}>{typeInfo.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-text-dark font-medium truncate">{prompt.title}</h3>
            <div className="flex items-center ml-4">
              <span className={`badge ${typeInfo.color} text-xs px-2`}>{typeInfo.label}</span>
              <button
                className="p-1 ml-2 hover:bg-[rgba(120,180,140,0.1)] rounded-full"
                onClick={onDelete}
              >
                <span className="material-icons text-text-light text-sm">delete</span>
              </button>
            </div>
          </div>
          <p className="text-text-medium text-sm mt-1 line-clamp-2">{prompt.content}</p>
        </div>
      </div>
    </Card>
  );
};
