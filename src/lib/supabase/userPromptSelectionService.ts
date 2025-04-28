/**
 * Supabase 用户提示词选择服务
 * 提供与 Supabase 用户提示词选择表的交互功能
 */
import { supabase } from '../supabase';
import { UserPromptSelection } from '@/data/database/types/userPromptSelection';
import { getCurrentUser } from '../supabase';

// Supabase用户提示词选择类型
interface SupabaseUserPromptSelection {
  id: string;
  user_id: string;
  prompt_id: string;
  created_at: string;
}

/**
 * 将Supabase用户提示词选择转换为本地用户提示词选择
 * @param supabaseSelection Supabase用户提示词选择
 * @returns 本地用户提示词选择
 */
const convertToLocalSelection = (supabaseSelection: SupabaseUserPromptSelection): UserPromptSelection => {
  return {
    id: parseInt(supabaseSelection.id),
    userId: supabaseSelection.user_id,
    promptId: parseInt(supabaseSelection.prompt_id),
    createdAt: new Date(supabaseSelection.created_at)
  };
};

/**
 * 获取用户选择的提示词ID列表
 * @returns 提示词ID数组
 */
export const getUserPromptSelectionsFromSupabase = async (): Promise<number[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('用户未登录');
    
    const { data, error } = await supabase
      .from('user_prompt_selections')
      .select('prompt_id')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    return (data as { prompt_id: string }[]).map(item => parseInt(item.prompt_id));
  } catch (error) {
    console.error('获取用户提示词选择失败:', error);
    throw error;
  }
};

/**
 * 添加提示词到用户选择
 * @param promptId 提示词ID
 * @returns 添加的用户提示词选择
 */
export const addUserPromptSelectionToSupabase = async (promptId: number): Promise<UserPromptSelection> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('用户未登录');
    
    // 检查是否已经添加过
    const { data: existingData, error: existingError } = await supabase
      .from('user_prompt_selections')
      .select('*')
      .eq('user_id', user.id)
      .eq('prompt_id', promptId)
      .maybeSingle();
    
    if (existingError) throw existingError;
    
    // 如果已经添加过，直接返回
    if (existingData) {
      return convertToLocalSelection(existingData as SupabaseUserPromptSelection);
    }
    
    // 添加新的选择
    const { data, error } = await supabase
      .from('user_prompt_selections')
      .insert([{
        user_id: user.id,
        prompt_id: promptId
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return convertToLocalSelection(data as SupabaseUserPromptSelection);
  } catch (error) {
    console.error('添加用户提示词选择失败:', error);
    throw error;
  }
};

/**
 * 删除用户提示词选择
 * @param promptId 提示词ID
 */
export const removeUserPromptSelectionFromSupabase = async (promptId: number): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('用户未登录');
    
    const { error } = await supabase
      .from('user_prompt_selections')
      .delete()
      .eq('user_id', user.id)
      .eq('prompt_id', promptId);
    
    if (error) throw error;
  } catch (error) {
    console.error('删除用户提示词选择失败:', error);
    throw error;
  }
};

/**
 * 检查提示词是否已被用户选择
 * @param promptId 提示词ID
 * @returns 是否已被选择
 */
export const isPromptSelectedByUserInSupabase = async (promptId: number): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('用户未登录');
    
    const { data, error } = await supabase
      .from('user_prompt_selections')
      .select('*')
      .eq('user_id', user.id)
      .eq('prompt_id', promptId)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('检查提示词是否已被选择失败:', error);
    throw error;
  }
};
