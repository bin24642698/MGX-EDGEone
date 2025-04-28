/**
 * 用户类型定义
 */

// 用户类型
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

// 用户会话类型
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

// 用户认证状态类型
export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}
