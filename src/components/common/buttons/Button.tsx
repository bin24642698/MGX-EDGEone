/**
 * 通用按钮组件
 */
import React from 'react';
import { ButtonProps } from '@/types';

/**
 * 通用按钮组件
 * @param props 按钮属性
 * @returns 按钮组件
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled = false,
  ...rest
}) => {
  // 基础样式
  const baseClasses = 'flex items-center justify-center transition-all duration-200 font-medium rounded-full';
  
  // 变体样式
  const variantClasses = {
    primary: 'bg-primary-green text-white hover:bg-[#4a8d5b] active:bg-[#3a7d4b]',
    outline: 'border border-primary-green text-primary-green hover:bg-[rgba(90,157,107,0.1)] active:bg-[rgba(90,157,107,0.2)]',
    text: 'text-primary-green hover:bg-[rgba(90,157,107,0.1)] active:bg-[rgba(90,157,107,0.2)]'
  };
  
  // 尺寸样式
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-2.5'
  };
  
  // 禁用样式
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // 组合样式
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  
  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {icon && <span className="material-icons mr-1.5 text-current">{icon}</span>}
      {children}
    </button>
  );
};
