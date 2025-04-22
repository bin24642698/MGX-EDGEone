/**
 * 圆形按钮组件
 */
import React from 'react';

interface RoundButtonProps {
  icon: string;
  onClick?: () => void;
  className?: string;
  tooltip?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | string;
}

/**
 * 圆形按钮组件
 * @param props 按钮属性
 * @returns 圆形按钮组件
 */
export const RoundButton: React.FC<RoundButtonProps> = ({
  icon,
  onClick,
  className = '',
  tooltip,
  disabled = false,
  size = 'md',
  color = 'primary'
}) => {
  // 基础样式
  const baseClasses = 'flex items-center justify-center rounded-full transition-all duration-200 shadow-sm hover:shadow';
  
  // 尺寸样式
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  // 图标尺寸
  const iconSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  
  // 颜色样式
  let colorClasses = '';
  if (color === 'primary') {
    colorClasses = 'bg-primary-green text-white hover:bg-[#4a8d5b] active:bg-[#3a7d4b]';
  } else if (color === 'secondary') {
    colorClasses = 'bg-[#7D85CC] text-white hover:bg-[#6970B9] active:bg-[#5960A9]';
  } else if (color === 'accent') {
    colorClasses = 'bg-[#E0976F] text-white hover:bg-[#D0875F] active:bg-[#C0774F]';
  } else {
    // 自定义颜色
    colorClasses = color;
  }
  
  // 禁用样式
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // 组合样式
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${colorClasses} ${disabledClasses} ${className}`;
  
  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
    >
      <span className={`material-icons ${iconSizes[size]}`}>{icon}</span>
    </button>
  );
};
