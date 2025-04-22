/**
 * 加载状态组件
 */
import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 加载状态组件
 * @param props 加载状态属性
 * @returns 加载状态组件
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = '加载中...',
  className = '',
  size = 'md'
}) => {
  // 尺寸样式
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  // 文本尺寸
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  return (
    <div className={`flex flex-col items-center justify-center py-6 ${className}`}>
      <div className="flex space-x-2 mb-3">
        <div className={`${sizeClasses[size]} bg-[#7D85CC] rounded-full animate-pulse`}></div>
        <div className={`${sizeClasses[size]} bg-[#E0976F] rounded-full animate-pulse delay-150`}></div>
        <div className={`${sizeClasses[size]} bg-[#9C6FE0] rounded-full animate-pulse delay-300`}></div>
      </div>
      <p className={`text-text-medium ${textSizes[size]}`}>{message}</p>
    </div>
  );
};
