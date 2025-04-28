'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import TopBar from '@/components/TopBar';

/**
 * 登录页面
 */
export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // 如果已登录，跳转到首页
  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // 如果正在加载或已登录，显示加载中
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-color flex flex-col">
        <TopBar title="登录" showBackButton={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-primary-green">
            <svg className="animate-spin h-10 w-10 text-primary-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-bg-color flex flex-col">
      <TopBar title="登录" showBackButton={true} />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </div>
  );
}
