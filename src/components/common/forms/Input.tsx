/**
 * 输入框组件
 */
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

/**
 * 输入框组件
 * @param props 输入框属性
 * @returns 输入框组件
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...rest
}) => {
  // 基础样式
  const baseClasses = 'w-full px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] transition-all duration-200 text-text-dark';
  
  // 错误样式
  const errorClasses = error ? 'border-red-300 focus:ring-red-200' : '';
  
  // 图标样式
  const iconClasses = icon ? 'pl-10' : '';
  
  // 组合样式
  const inputClasses = `${baseClasses} ${errorClasses} ${iconClasses} ${className}`;
  
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-text-dark text-sm font-medium mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light">
            {icon}
          </span>
        )}
        
        <input className={inputClasses} {...rest} />
      </div>
      
      {error && (
        <p className="mt-1 text-red-500 text-xs">{error}</p>
      )}
    </div>
  );
};
