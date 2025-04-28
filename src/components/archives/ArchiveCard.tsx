/**
 * 档案卡片组件
 */
import React from 'react';
import { Archive } from '@/data';

interface ArchiveCardProps {
  archive: Archive;
  onClick: (archive: Archive) => void;
  isSelected?: boolean;
}

/**
 * 档案卡片组件 - 显示单个档案项
 */
export const ArchiveCard: React.FC<ArchiveCardProps> = ({
  archive,
  onClick,
  isSelected = false
}) => {
  // 计算截断的内容预览
  const contentPreview = archive.content.length > 100
    ? `${archive.content.substring(0, 100)}...`
    : archive.content;

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-[rgba(125,133,204,0.7)] bg-[rgba(125,133,204,0.1)] shadow-sm'
          : 'border-[rgba(125,133,204,0.3)] bg-card-color'
      }`}
      onClick={() => onClick(archive)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-[#7D85CC] font-ma-shan truncate">{archive.title}</h3>
        <span className="text-xs text-text-light px-2 py-1 rounded-full bg-[rgba(125,133,204,0.1)]">
          {archive.category}
        </span>
      </div>

      <p className="text-text-dark text-sm line-clamp-3 min-h-[3em]">{contentPreview}</p>

      <div className="flex justify-between items-center mt-2 text-xs text-text-light">
        <div className="flex gap-1">
          {archive.tags && archive.tags.map((tag, index) => (
            <span key={index} className="px-1.5 py-0.5 bg-[rgba(125,133,204,0.1)] rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <span>{new Date(archive.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default ArchiveCard;