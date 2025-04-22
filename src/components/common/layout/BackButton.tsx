/**
 * 返回按钮组件
 */
import React from 'react';
import { useRouter } from 'next/navigation';

/**
 * 返回按钮组件
 * @returns 返回按钮组件
 */
export const BackButton: React.FC = () => {
  const router = useRouter();
  
  const handleBack = () => {
    router.back();
  };
  
  return (
    <button
      className="mr-3 p-2 rounded-full hover:bg-[rgba(120,180,140,0.1)] transition-colors duration-200"
      onClick={handleBack}
      aria-label="返回"
    >
      <span className="material-icons text-text-medium">arrow_back</span>
    </button>
  );
};
