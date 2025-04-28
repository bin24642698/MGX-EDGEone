/**
 * 用户认证状态切片
 */
import { create } from 'zustand';
import { User, Session, AuthState } from '@/data/database/types/user';
import { supabase, signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut } from '@/lib/supabase';

interface AuthStore extends AuthState {
  // 初始化用户状态
  initialize: () => Promise<void>;

  // 用户登录
  signIn: (email: string, password: string) => Promise<void>;

  // 用户注册
  signUp: (email: string, password: string, userId: string) => Promise<void>;

  // 用户登出
  signOut: () => Promise<void>;

  // 设置用户
  setUser: (user: User | null) => void;

  // 设置会话
  setSession: (session: Session | null) => void;
}

/**
 * 用户认证状态
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  // 初始化用户状态
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // 获取当前会话
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // 如果有会话，获取用户信息
        const { data: { user } } = await supabase.auth.getUser();
        set({ user, session, isLoading: false });
      } else {
        set({ user: null, session: null, isLoading: false });
      }
    } catch (error) {
      console.error('初始化用户状态失败:', error);
      set({
        user: null,
        session: null,
        isLoading: false,
        error: error instanceof Error ? error.message : '初始化用户状态失败'
      });
    }
  },

  // 用户登录
  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user, session } = await supabaseSignIn(email, password);
      set({ user, session, isLoading: false });
    } catch (error) {
      console.error('登录失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '登录失败'
      });
      throw error;
    }
  },

  // 用户注册
  signUp: async (email: string, password: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { user, session } = await supabaseSignUp(email, password, userId);
      set({ user, session, isLoading: false });
    } catch (error) {
      console.error('注册失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '注册失败'
      });
      throw error;
    }
  },

  // 用户登出
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      await supabaseSignOut();
      set({ user: null, session: null, isLoading: false });
    } catch (error) {
      console.error('登出失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '登出失败'
      });
      throw error;
    }
  },

  // 设置用户
  setUser: (user: User | null) => {
    set({ user });
  },

  // 设置会话
  setSession: (session: Session | null) => {
    set({ session });
  }
}));
