/**
 * 卡片组件
 */
import React from 'react';
import { CardProps } from '@/types';

/**
 * 吉卜力风格卡片组件
 * @param props 卡片属性
 * @returns 卡片组件
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  tapeColor = 'rgba(90,157,107,0.7)',
  withPageCurl = true,
  withTape = true,
  ...rest
}) => {
  // 基础样式
  const baseClasses = 'ghibli-card relative bg-card-color rounded-[22px] border border-[rgba(120,180,140,0.3)] shadow-md overflow-hidden';

  // 点击样式
  const clickableClasses = onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1' : '';

  // 组合样式
  const cardClasses = `${baseClasses} ${clickableClasses} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick} {...rest}>
      {/* 胶带装饰 */}
      {withTape && (
        <div className="tape" style={{ backgroundColor: tapeColor }}>
          <div className="tape-texture"></div>
        </div>
      )}

      {/* 内容 */}
      {children}

      {/* 翻页效果 */}
      {withPageCurl && <div className="page-curl"></div>}
    </div>
  );
};
