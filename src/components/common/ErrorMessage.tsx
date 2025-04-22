/**
 * 错误消息组件
 */
import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

/**
 * 错误消息组件
 * @param props 错误消息属性
 * @returns 错误消息组件
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  className = ''
}) => {
  if (!message) return null;
  
  return (
    <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4 ${className}`}>
      <div className="flex items-start">
        <span className="material-icons text-red-500 mr-2 mt-0.5">error_outline</span>
        <div>
          <p className="font-medium">出错了</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};
