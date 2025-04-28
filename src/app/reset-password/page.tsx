'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import TopBar from '@/components/TopBar';

/**
 * 设置新密码页面
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  
  const router = useRouter();
  
  // 检查重置令牌是否有效
  useEffect(() => {
    const checkSession = async () => {
      // 获取当前会话
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        setError('重置链接无效或已过期，请重新请求重置密码。');
      }
    };
    
    checkSession();
  }, []);
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // 验证密码
    if (password.length < 6) {
      setError('密码长度至少为6个字符');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 更新密码
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      // 更新成功
      setIsSuccess(true);
    } catch (error) {
      console.error('更新密码失败:', error);
      setError(error instanceof Error ? error.message : '更新密码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 返回首页
  const handleBackToHome = () => {
    router.push('/');
  };
  
  return (
    <div className="min-h-screen bg-bg-color flex flex-col">
      <TopBar title="重置密码" showBackButton={true} onBackClick={handleBackToHome} />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="ghibli-card p-8">
            <div className="tape" style={{ backgroundColor: 'rgba(90,157,107,0.7)' }}>
              <div className="tape-texture"></div>
            </div>
            
            {isTokenValid === null ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-primary-green">
                  <svg className="animate-spin h-10 w-10 text-primary-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            ) : isTokenValid === false ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-red-600 text-2xl">error</span>
                </div>
                <h3 className="text-lg font-medium text-text-dark mb-2">链接无效</h3>
                <p className="text-text-medium text-sm mb-6">
                  {error}
                </p>
                <button
                  className="px-4 py-2 bg-primary-green text-white rounded-full hover:bg-[#4a8d5b] transition-colors duration-200"
                  onClick={handleBackToHome}
                >
                  返回首页
                </button>
              </div>
            ) : !isSuccess ? (
              <>
                <h2 className="text-2xl font-bold text-center mb-6 text-text-dark">
                  设置新密码
                </h2>
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-text-medium text-sm font-medium mb-2" htmlFor="password">
                      新密码
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="w-full px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] transition-all duration-200 text-text-dark"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-text-light mt-1">密码长度至少为6个字符</p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-text-medium text-sm font-medium mb-2" htmlFor="confirm-password">
                      确认密码
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      className="w-full px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] transition-all duration-200 text-text-dark"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-primary-green text-white py-2 px-4 rounded-full hover:bg-[#4a8d5b] transition-colors duration-200 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        处理中...
                      </span>
                    ) : '重置密码'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-green-600 text-2xl">check</span>
                </div>
                <h3 className="text-lg font-medium text-text-dark mb-2">密码已重置</h3>
                <p className="text-text-medium text-sm mb-6">
                  您的密码已成功重置，现在可以使用新密码登录。
                </p>
                <button
                  className="px-4 py-2 bg-primary-green text-white rounded-full hover:bg-[#4a8d5b] transition-colors duration-200"
                  onClick={handleBackToHome}
                >
                  返回首页
                </button>
              </div>
            )}
            
            <div className="page-curl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
