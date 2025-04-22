/**
 * 顶部导航栏组件
 */
import React from 'react';
import BackButton from '@/components/BackButton';

interface TopBarProps {
  title: string;
  showBackButton?: boolean;
  isHomePage?: boolean;
  actions?: React.ReactNode;
}

/**
 * 顶部导航栏组件
 * @param props 顶部导航栏属性
 * @returns 顶部导航栏组件
 */
export const TopBar: React.FC<TopBarProps> = ({
  title,
  showBackButton = false,
  isHomePage = false,
  actions
}) => {
  return (
    <div className="sticky top-0 z-10 bg-bg-color bg-opacity-95 backdrop-blur-sm border-b border-[rgba(120,180,140,0.2)] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        {showBackButton && <BackButton />}
        <h1 
          className={`${isHomePage ? 'text-lg md:text-xl lg:text-2xl' : 'text-base md:text-lg'} font-medium text-text-dark`}
          style={{fontFamily: "'Ma Shan Zheng', cursive"}}
        >
          {title}
        </h1>
      </div>
      
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
};
