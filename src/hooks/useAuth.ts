/**
 * 用户认证钩子
 */
import { useEffect } from 'react';
import { useAuthStore } from '@/store/slices/authSlice';
import { supabase } from '@/lib/supabase';

/**
 * 用户认证钩子
 * @returns 用户认证状态和方法
 */
export const useAuth = () => {
  const {
    user,
    session,
    isLoading,
    error,
    initialize,
    signIn,
    signUp,
    signOut,
    setUser,
    setSession
  } = useAuthStore();

  // 初始化用户状态
  useEffect(() => {
    initialize();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setSession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    );

    // 清理订阅
    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, setUser, setSession]);

  return {
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  };
};
