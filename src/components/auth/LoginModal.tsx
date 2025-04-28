'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ResetPasswordModal from './ResetPasswordModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 登录弹窗组件
 */
export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<{ id: string; name: string } | null>(null);

  const { signIn, signUp } = useAuth();

  // 如果弹窗未打开，不渲染内容
  if (!isOpen) return null;

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setRegistrationSuccess(false);
    setRegisteredUser(null);

    try {
      if (isLogin) {
        // 登录
        await signIn(email, password);
        // 登录成功，关闭弹窗
        onClose();
      } else {
        // 注册
        if (!userId.trim()) {
          throw new Error('请输入用户ID');
        }
        const { user } = await signUp(email, password, userId);

        // 注册成功，显示成功信息
        if (user) {
          setRegistrationSuccess(true);
          setRegisteredUser({
            id: user.id,
            name: user.user_metadata?.name || userId
          });
          // 清空表单
          setEmail('');
          setPassword('');
          setUserId('');
        } else {
          // 注册成功但没有返回用户信息，关闭弹窗
          onClose();
        }
      }
    } catch (error) {
      console.error('认证失败:', error);
      setError(error instanceof Error ? error.message : '认证失败，请重试');
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
            {isLogin ? '登录' : (registrationSuccess ? '注册成功' : '注册')}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {registrationSuccess && registeredUser && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">注册成功！</h3>
              <p className="text-sm mb-1">您的用户信息如下：</p>
              <div className="bg-white bg-opacity-70 p-3 rounded-md text-text-dark text-sm">
                <p className="mb-1"><span className="font-medium">用户ID（显示名称）：</span>{registeredUser.name}</p>
                <p><span className="font-medium">UID：</span>{registeredUser.id}</p>
              </div>
              <p className="text-xs mt-3">请记住您的UID，这是您在系统中的唯一标识。</p>
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationSuccess(false);
                    setIsLogin(true);
                  }}
                  className="bg-primary-green text-white py-2 px-6 rounded-full hover:bg-[#4a8d5b] transition-colors duration-200"
                >
                  前往登录
                </button>
              </div>
            </div>
          )}

          {!registrationSuccess && <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-text-medium text-sm font-medium mb-2" htmlFor="email">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] transition-all duration-200 text-text-dark"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="mb-4">
                <label className="block text-text-medium text-sm font-medium mb-2" htmlFor="userId">
                  用户ID（显示名称）
                </label>
                <input
                  id="userId"
                  type="text"
                  className="w-full px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] transition-all duration-200 text-text-dark"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="设置您的显示名称"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-text-medium text-sm font-medium" htmlFor="password">
                  密码
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-primary-green hover:underline text-xs"
                    onClick={() => setShowResetPassword(true)}
                  >
                    忘记密码？
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 bg-white bg-opacity-70 border border-[rgba(120,180,140,0.3)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgba(120,180,140,0.5)] transition-all duration-200 text-text-dark"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-primary-green hover:underline text-sm"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? '没有账号？点击注册' : '已有账号？点击登录'}
              </button>
            </div>
          </form>}

          <div className="page-curl"></div>
        </div>
      </div>

      {/* 重置密码弹窗 */}
      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
        onBackToLogin={() => setShowResetPassword(false)}
      />
    </div>
  );
}
