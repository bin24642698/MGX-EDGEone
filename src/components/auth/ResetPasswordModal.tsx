'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

/**
 * 重置密码弹窗组件
 */
export default function ResetPasswordModal({ isOpen, onClose, onBackToLogin }: ResetPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // 如果弹窗未打开，不渲染内容
  if (!isOpen) return null;
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // 调用 Supabase 发送重置密码邮件
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      // 发送成功
      setIsSuccess(true);
    } catch (error) {
      console.error('重置密码请求失败:', error);
      setError(error instanceof Error ? error.message : '重置密码请求失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <div className="ghibli-card p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-text-medium hover:text-text-dark"
            aria-label="关闭"
          >
            <span className="material-icons">close</span>
          </button>
          
          <div className="tape" style={{ backgroundColor: 'rgba(90,157,107,0.7)' }}>
            <div className="tape-texture"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6 text-text-dark">
            重置密码
          </h2>
          
          {!isSuccess ? (
            <>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <p className="text-text-medium text-sm mb-6">
                请输入您的注册邮箱，我们将向您发送重置密码的链接。
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-text-medium text-sm font-medium mb-2" htmlFor="reset-email">
                    邮箱
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    className="w-full px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] transition-all duration-200 text-text-dark"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                      发送中...
                    </span>
                  ) : '发送重置链接'}
                </button>
                
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    className="text-primary-green hover:underline text-sm"
                    onClick={onBackToLogin}
                  >
                    返回登录
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-green-600 text-2xl">check</span>
              </div>
              <h3 className="text-lg font-medium text-text-dark mb-2">重置链接已发送</h3>
              <p className="text-text-medium text-sm mb-6">
                我们已向 {email} 发送了一封包含重置密码链接的邮件。请检查您的邮箱并点击链接重置密码。
              </p>
              <button
                className="text-primary-green hover:underline text-sm"
                onClick={onClose}
              >
                关闭
              </button>
            </div>
          )}
          
          <div className="page-curl"></div>
        </div>
      </div>
    </div>
  );
}
