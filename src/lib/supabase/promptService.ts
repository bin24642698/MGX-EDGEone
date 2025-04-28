/**
 * Supabase 提示词服务
 * 提供与 Supabase 提示词表的交互功能
 */
import { supabase } from '../supabase';
import { Prompt } from '@/data/database/types/prompt';
import { getCurrentUser } from '../supabase';
import { encryptText, decryptText, generateEncryptionKey } from '../utils/encryption';

// Supabase提示词类型
interface SupabasePrompt {
  id: string;
  title: string;
  type: string;
  content: string;
  description: string | null;
  examples: string[] | null;
  is_public: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// 转换Supabase提示词到本地提示词格式
const convertToLocalPrompt = (supabasePrompt: SupabasePrompt, decryptContent: boolean = false): Prompt => {
  let content = supabasePrompt.content;

  // 如果需要解密内容
  if (decryptContent) {
    try {
      const user = getCurrentUser();
      if (user) {
        const key = generateEncryptionKey(user.id);
        content = decryptText(content, key);
      }
    } catch (error) {
      console.error('解密提示词内容失败:', error);
      // 解密失败时保持原样
    }
  }

  return {
    id: parseInt(supabasePrompt.id), // 临时使用，后续需要修改本地ID类型为string
    title: supabasePrompt.title,
    type: supabasePrompt.type as Prompt['type'],
    content: content,
    description: supabasePrompt.description || undefined,
    examples: supabasePrompt.examples || undefined,
    isPublic: supabasePrompt.is_public,
    userId: supabasePrompt.user_id,
    createdAt: new Date(supabasePrompt.created_at),
    updatedAt: new Date(supabasePrompt.updated_at)
  };
};

// 转换本地提示词到Supabase提示词格式
const convertToSupabasePrompt = async (prompt: Omit<Prompt, 'id'>, encryptContent: boolean = true): Promise<Omit<SupabasePrompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>> => {
  let content = prompt.content;

  // 如果需要加密内容
  if (encryptContent) {
    const user = await getCurrentUser();
    if (user) {
      const key = generateEncryptionKey(user.id);
      content = encryptText(content, key);
    }
  }

  return {
    title: prompt.title,
    type: prompt.type,
    content: content,
    description: prompt.description || null,
    examples: prompt.examples || null,
    is_public: prompt.isPublic || false
  };
};

/**
 * 获取所有提示词
 * @param decryptContent 是否解密内容
 * @param onlyUserPrompts 是否只获取当前用户的提示词
 * @returns 提示词数组
 */
export const getAllPromptsFromSupabase = async (decryptContent: boolean = false, onlyUserPrompts: boolean = false): Promise<Prompt[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('用户未登录');

    let query = supabase
      .from('prompts')
      .select('*')
      .order('updated_at', { ascending: false });

    // 如果只获取当前用户的提示词
    if (onlyUserPrompts) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data as SupabasePrompt[]).map(prompt => convertToLocalPrompt(prompt, decryptContent));
  } catch (error) {
    console.error('获取提示词失败:', error);
    throw error;
  }
};

/**
 * 根据类型获取提示词
 * @param type 提示词类型
 * @param decryptContent 是否解密内容
 * @param onlyUserPrompts 是否只获取当前用户的提示词
 * @returns 提示词数组
 */
export const getPromptsByTypeFromSupabase = async (type: Prompt['type'], decryptContent: boolean = false, onlyUserPrompts: boolean = false): Promise<Prompt[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('用户未登录');

    let query = supabase
      .from('prompts')
      .select('*')
      .eq('type', type)
      .order('updated_at', { ascending: false });

    // 如果只获取当前用户的提示词
    if (onlyUserPrompts) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data as SupabasePrompt[]).map(prompt => convertToLocalPrompt(prompt, decryptContent));
  } catch (error) {
    console.error(`获取类型为 ${type} 的提示词失败:`, error);
    throw error;
  }
};

/**
 * 根据ID获取提示词
 * @param id 提示词ID
 * @param decryptContent 是否解密内容
 * @returns 提示词或null
 */
export const getPromptByIdFromSupabase = async (id: string, decryptContent: boolean = false): Promise<Prompt | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // 记录不存在
      throw error;
    }

    return data ? convertToLocalPrompt(data as SupabasePrompt, decryptContent) : null;
  } catch (error) {
    console.error(`获取ID为 ${id} 的提示词失败:`, error);
    throw error;
  }
};

/**
 * 添加提示词
 * @param prompt 提示词
 * @param encryptContent 是否加密内容
 * @returns 添加后的提示词
 */
export const addPromptToSupabase = async (prompt: Omit<Prompt, 'id'>, encryptContent: boolean = true): Promise<Prompt> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('用户未登录');

    const supabasePrompt = await convertToSupabasePrompt(prompt, encryptContent);

    const { data, error } = await supabase
      .from('prompts')
      .insert([{ ...supabasePrompt, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;

    return convertToLocalPrompt(data as SupabasePrompt, false);
  } catch (error) {
    console.error('添加提示词失败:', error);
    throw error;
  }
};

/**
 * 更新提示词
 * @param prompt 提示词
 * @param encryptContent 是否加密内容
 * @returns 更新后的提示词
 */
export const updatePromptInSupabase = async (prompt: Prompt, encryptContent: boolean = true): Promise<Prompt> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('用户未登录');

    const supabasePrompt = await convertToSupabasePrompt(prompt, encryptContent);

    const { data, error } = await supabase
      .from('prompts')
      .update({ ...supabasePrompt, updated_at: new Date().toISOString() })
      .eq('id', prompt.id)
      .select()
      .single();

    if (error) throw error;

    return convertToLocalPrompt(data as SupabasePrompt, false);
  } catch (error) {
    console.error('更新提示词失败:', error);
    throw error;
  }
};

/**
 * 删除提示词
 * @param id 提示词ID
 */
export const deletePromptFromSupabase = async (id: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('用户未登录');

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('删除提示词失败:', error);
    throw error;
  }
};

/**
 * 获取所有公开提示词
 * @param type 提示词类型（可选）
 * @param decryptContent 是否解密内容
 * @returns 提示词数组
 */
export const getPublicPromptsFromSupabase = async (type?: Prompt['type'], decryptContent: boolean = false): Promise<Prompt[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('用户未登录');

    let query = supabase
      .from('prompts')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    // 如果指定了类型，则按类型过滤
    if (type) {
      query = query.eq('type', type);
    }

    // 不再排除用户自己的提示词，允许用户在推荐页面看到自己的公开提示词

    const { data, error } = await query;

    if (error) throw error;

    console.log('获取到的公开提示词:', data);
    return (data as SupabasePrompt[]).map(prompt => convertToLocalPrompt(prompt, decryptContent));
  } catch (error) {
    console.error('获取公开提示词失败:', error);
    throw error;
  }
};

/**
 * 复制提示词到自己的账户
 * @param promptId 要复制的提示词ID
 * @returns 复制后的提示词
 */
export const copyPromptToMyAccount = async (promptId: string): Promise<Prompt> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('用户未登录');

    // 获取原始提示词
    const originalPrompt = await getPromptByIdFromSupabase(promptId, true);
    if (!originalPrompt) throw new Error('提示词不存在');

    // 检查提示词是否公开
    if (!originalPrompt.isPublic) throw new Error('此提示词不允许复制');

    // 创建新的提示词
    const newPrompt: Omit<Prompt, 'id'> = {
      title: `${originalPrompt.title} (复制)`,
      type: originalPrompt.type,
      content: originalPrompt.content,
      description: originalPrompt.description,
      examples: originalPrompt.examples,
      isPublic: false, // 默认设为私有
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 添加到自己的账户
    return await addPromptToSupabase(newPrompt);
  } catch (error) {
    console.error(`复制ID为 ${promptId} 的提示词失败:`, error);
    throw error;
  }
};
