/**
 * 用户仓库
 */
import { supabase } from '@/lib/supabase';
import { User } from '../types/user';

/**
 * 获取当前用户
 * @returns 当前用户或null
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }
};

/**
 * 更新用户资料
 * @param userData 用户资料
 * @returns 更新后的用户
 */
export const updateUserProfile = async (userData: { name?: string; avatar_url?: string }) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: userData
    });
    
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('更新用户资料失败:', error);
    throw error;
  }
};

/**
 * 更新用户邮箱
 * @param email 新邮箱
 * @returns 更新结果
 */
export const updateUserEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      email
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('更新用户邮箱失败:', error);
    throw error;
  }
};

/**
 * 更新用户密码
 * @param password 新密码
 * @returns 更新结果
 */
export const updateUserPassword = async (password: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('更新用户密码失败:', error);
    throw error;
  }
};
