/**
 * 认证状态存储
 */
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // 获取当前用户
  getCurrentUser: () => Promise<User | null>;
  
  // 设置用户
  setUser: (user: User | null) => void;
  
  // 设置加载状态
  setLoading: (isLoading: boolean) => void;
  
  // 设置错误
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  
  getCurrentUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return null;
    }
  },
  
  setUser: (user) => set({ user }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error })
}));
