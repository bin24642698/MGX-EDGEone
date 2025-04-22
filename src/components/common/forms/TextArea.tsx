/**
 * 文本域组件
 */
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

/**
 * 文本域组件
 * @param props 文本域属性
 * @returns 文本域组件
 */
export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  ...rest
}) => {
  // 基础样式
  const baseClasses = 'w-full px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] transition-all duration-200 text-text-dark';
  
  // 错误样式
  const errorClasses = error ? 'border-red-300 focus:ring-red-200' : '';
  
  // 组合样式
  const textareaClasses = `${baseClasses} ${errorClasses} ${className}`;
  
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-text-dark text-sm font-medium mb-2">
          {label}
        </label>
      )}
      
      <textarea className={textareaClasses} {...rest} />
      
      {error && (
        <p className="mt-1 text-red-500 text-xs">{error}</p>
      )}
    </div>
  );
};
