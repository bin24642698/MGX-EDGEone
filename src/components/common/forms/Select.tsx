/**
 * 选择框组件
 */
import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * 选择框组件
 * @param props 选择框属性
 * @returns 选择框组件
 */
export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  onChange,
  ...rest
}) => {
  // 基础样式
  const baseClasses = 'w-full px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] transition-all duration-200 text-text-dark appearance-none';
  
  // 错误样式
  const errorClasses = error ? 'border-red-300 focus:ring-red-200' : '';
  
  // 组合样式
  const selectClasses = `${baseClasses} ${errorClasses} ${className}`;
  
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-text-dark text-sm font-medium mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          className={selectClasses}
          onChange={onChange}
          {...rest}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-light">
          <span className="material-icons">expand_more</span>
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-red-500 text-xs">{error}</p>
      )}
    </div>
  );
};
