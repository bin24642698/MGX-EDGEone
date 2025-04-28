/**
 * Supabase 客户端配置
 */
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './supabaseConfig';

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 获取当前登录用户
 * @returns 当前登录用户或null
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }
};

/**
 * 用户登录
 * @param email 邮箱
 * @param password 密码
 * @returns 登录结果
 */
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

/**
 * 用户注册
 * @param email 邮箱
 * @param password 密码
 * @param userId 用户ID（显示名称）
 * @returns 注册结果
 */
export const signUp = async (email: string, password: string, userId: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userId,
        }
      }
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
};

/**
 * 用户登出
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('登出失败:', error);
    throw error;
  }
};
