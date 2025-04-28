/**
 * 作品卡片组件
 */
import React from 'react';
import { Work } from '@/types';
import { Card } from '@/components/common';
import { formatRelativeTime, formatWordCount } from '@/lib/utils';

interface WorkTypeInfo {
  label: string;
  color: string;
  icon: string;
  gradient: string;
}

// 作品类型映射
const workTypeMap: Record<string, WorkTypeInfo> = {
  'novel': {
    label: '小说',
    color: 'bg-[#7D85CC20] text-[#7D85CC]',
    icon: 'auto_stories',
    gradient: 'from-[#7D85CC] to-[#6F9CE0]'
  },
  'character': {
    label: '角色',
    color: 'bg-[#9C6FE020] text-[#9C6FE0]',
    icon: 'person',
    gradient: 'from-[#9C6FE0] to-[#7D85CC]'
  },
  'worldbuilding': {
    label: '世界观',
    color: 'bg-[#E06F9C20] text-[#E06F9C]',
    icon: 'public',
    gradient: 'from-[#E06F9C] to-[#E0976F]'
  },
  'plot': {
    label: '情节',
    color: 'bg-[#6F9CE020] text-[#6F9CE0]',
    icon: 'timeline',
    gradient: 'from-[#6F9CE0] to-[#9C6FE0]'
  }
};

interface WorkCardProps {
  work: Work;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

/**
 * 作品卡片组件
 * @param props 作品卡片属性
 * @returns 作品卡片组件
 */
export const WorkCard: React.FC<WorkCardProps> = ({
  work,
  onClick,
  onDelete
}) => {
  const typeInfo = workTypeMap[work.type] || workTypeMap.novel;

  // 提取颜色代码用于胶带
  const tapeColor = typeInfo.color.split(' ')[1].replace('text-', 'rgba(').replace(/\]/, ', 0.7)');

  // 计算字数
  const wordCount = work.content.length;

  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-md transition-all duration-300 relative"
      onClick={onClick}
      tapeColor={tapeColor}
      withPageCurl={true}
    >
      <div className="flex items-start">
        <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center mr-4 ${typeInfo.color.split(' ')[0]}`}>
          <span className={`material-icons ${typeInfo.color.split(' ')[1]}`}>{typeInfo.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-text-dark truncate">{work.title}</h3>
            <div className="flex items-center ml-4">
              <span className={`badge ${typeInfo.color} text-xs px-2`}>{typeInfo.label}</span>
            </div>
          </div>
          <p className="text-text-medium text-sm mt-1 line-clamp-2">{work.description}</p>

          <div className="flex items-center justify-between mt-4 text-text-light text-xs">
            <div className="flex items-center">
              <span className="material-icons text-xs mr-1">schedule</span>
              <span>{formatRelativeTime(work.updatedAt)}</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-xs mr-1">text_fields</span>
              <span>{formatWordCount(wordCount)} 字</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2">
        <button
          className="p-1 hover:bg-[rgba(120,180,140,0.1)] rounded-full"
          onClick={onDelete}
        >
          <span className="material-icons text-text-light text-sm">delete</span>
        </button>
      </div>
    </Card>
  );
};
