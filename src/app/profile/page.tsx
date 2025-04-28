'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import TopBar from '@/components/TopBar';
import { updateUserProfile } from '@/data';

/**
 * 用户配置文件页面
 */
export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 如果未登录，跳转到登录页面
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // 加载用户信息
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '');
    }
  }, [user]);
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    
    try {
      await updateUserProfile({ name });
      setSuccess('个人信息已更新');
    } catch (error) {
      console.error('更新个人信息失败:', error);
      setError(error instanceof Error ? error.message : '更新个人信息失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };
  
  // 如果正在加载，显示加载中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-color flex flex-col">
        <TopBar title="个人信息" showBackButton={true} />
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
      <TopBar title="个人信息" showBackButton={true} />
      
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-md mx-auto">
          <div className="ghibli-card p-6">
            <div className="tape" style={{ backgroundColor: 'rgba(90,157,107,0.7)' }}>
              <div className="tape-texture"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-6 text-text-dark">个人信息</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-text-medium text-sm font-medium mb-2" htmlFor="email">
                  邮箱
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] transition-all duration-200 text-text-dark"
                  value={user?.email || ''}
                  disabled
                />
                <p className="text-xs text-text-light mt-1">邮箱地址不可修改</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-text-medium text-sm font-medium mb-2" htmlFor="name">
                  昵称
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] transition-all duration-200 text-text-dark"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-primary-green text-white py-2 px-4 rounded-full hover:bg-[#4a8d5b] transition-colors duration-200 flex items-center justify-center"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </span>
                ) : '保存修改'}
              </button>
            </form>
            
            <div className="page-curl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
