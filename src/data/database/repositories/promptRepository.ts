/**
 * 提示词仓库
 */
import { Prompt } from '../types/prompt';
import { dbOperations } from '../core/operations';
import { DB_CONFIG } from '../config';
import {
  getAllPromptsFromSupabase,
  getPromptsByTypeFromSupabase,
  getPromptByIdFromSupabase,
  addPromptToSupabase,
  updatePromptInSupabase,
  deletePromptFromSupabase
} from '@/lib/supabase/promptService';
import { encryptPrompt, decryptPrompt, decryptPrompts } from '@/lib/promptEncryptionManager';
import { useAuthStore } from '@/store/slices/authStore';
import { getUserPromptSelectionsFromSupabase } from '@/lib/supabase/userPromptSelectionService';

const { MAIN } = DB_CONFIG.NAMES;
const { PROMPTS } = DB_CONFIG.STORES.MAIN;

// 是否使用Supabase
const useSupabase = async () => {
  // 检查是否启用Supabase提示词功能
  const isSupabaseEnabled = process.env.NEXT_PUBLIC_USE_SUPABASE_PROMPTS === 'true';

  // 如果未启用，直接返回false
  if (!isSupabaseEnabled) return false;

  try {
    // 尝试获取当前用户
    const user = await useAuthStore.getState().getCurrentUser();
    return !!user; // 如果用户存在，返回true
  } catch (error) {
    console.error('检查用户登录状态失败:', error);
    return false;
  }
};

/**
 * 添加提示词
 * @param prompt 提示词
 * @returns 添加后的提示词
 */
export const addPrompt = async (prompt: Omit<Prompt, 'id'>): Promise<Prompt> => {
  // 加密提示词内容
  const encryptedPrompt = await encryptPrompt(prompt) as Omit<Prompt, 'id'>;

  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      return await addPromptToSupabase(encryptedPrompt);
    } catch (error) {
      console.error('Supabase添加提示词失败，回退到本地存储:', error);
    }
  }

  // 使用本地存储
  return dbOperations.add<Prompt>(MAIN, PROMPTS, encryptedPrompt);
};

/**
 * 获取所有提示词
 * @param decryptContents 是否解密内容
 * @param onlyUserPrompts 是否只获取当前用户的提示词
 * @returns 所有提示词
 */
export const getAllPrompts = async (decryptContents: boolean = false, onlyUserPrompts: boolean = false): Promise<Prompt[]> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      // 从Supabase获取提示词，不解密内容
      const prompts = await getAllPromptsFromSupabase(false, onlyUserPrompts);

      // 如果需要解密内容
      if (decryptContents) {
        return await decryptPrompts(prompts);
      }

      return prompts;
    } catch (error) {
      console.error('Supabase获取提示词失败，回退到本地存储:', error);
    }
  }

  // 使用本地存储
  const prompts = await dbOperations.getAll<Prompt>(MAIN, PROMPTS);

  // 按更新日期排序，最新的在前面
  const sortedPrompts = prompts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // 如果需要解密内容
  if (decryptContents) {
    return await decryptPrompts(sortedPrompts);
  }

  return sortedPrompts;
};

/**
 * 获取用户可用的提示词（包括用户自己的提示词和用户选择的公开提示词）
 * @param type 提示词类型
 * @param decryptContents 是否解密内容
 * @returns 用户可用的提示词
 */
export const getUserAvailablePromptsByType = async (type: Prompt['type'], decryptContents: boolean = false): Promise<Prompt[]> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      // 获取用户自己的提示词
      const userPrompts = await getPromptsByTypeFromSupabase(type, false, true);

      // 获取用户选择的提示词ID
      const selectedPromptIds = await getUserPromptSelectionsFromSupabase();

      // 如果没有选择的提示词，直接返回用户自己的提示词
      if (selectedPromptIds.length === 0) {
        // 如果需要解密内容
        if (decryptContents) {
          return await decryptPrompts(userPrompts);
        }
        return userPrompts;
      }

      // 获取用户选择的提示词
      const selectedPrompts: Prompt[] = [];
      for (const promptId of selectedPromptIds) {
        const prompt = await getPromptByIdFromSupabase(promptId.toString(), false);
        if (prompt && prompt.type === type) {
          // 只添加与当前用户不同的提示词（公开提示词）
          const user = await useAuthStore.getState().getCurrentUser();
          if (!user || prompt.userId !== user.id) {
            selectedPrompts.push(prompt);
          }
        }
      }

      // 合并用户自己的提示词和用户选择的提示词
      const allPrompts = [...userPrompts, ...selectedPrompts];

      // 去重
      const uniquePrompts = allPrompts.filter((prompt, index, self) =>
        index === self.findIndex(p => p.id === prompt.id)
      );

      // 按更新日期排序，最新的在前面
      const sortedPrompts = uniquePrompts.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      // 如果需要解密内容
      if (decryptContents) {
        return await decryptPrompts(sortedPrompts);
      }

      return sortedPrompts;
    } catch (error) {
      console.error(`Supabase获取用户可用的类型为 ${type} 的提示词失败，回退到本地存储:`, error);
    }
  }

  // 使用本地存储
  const prompts = await dbOperations.getAll<Prompt>(MAIN, PROMPTS);
  const filteredPrompts = prompts.filter(prompt => prompt.type === type);

  // 如果需要解密内容
  if (decryptContents) {
    return await decryptPrompts(filteredPrompts);
  }

  return filteredPrompts;
};

/**
 * 根据类型获取提示词
 * @param type 提示词类型
 * @param decryptContents 是否解密内容
 * @param onlyUserPrompts 是否只获取当前用户的提示词
 * @returns 指定类型的提示词
 */
export const getPromptsByType = async (type: Prompt['type'], decryptContents: boolean = false, onlyUserPrompts: boolean = false): Promise<Prompt[]> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      // 如果不是只获取用户自己的提示词，则获取用户可用的提示词
      if (!onlyUserPrompts) {
        return await getUserAvailablePromptsByType(type, decryptContents);
      }

      // 从Supabase获取提示词，不解密内容
      const prompts = await getPromptsByTypeFromSupabase(type, false, onlyUserPrompts);

      // 如果需要解密内容
      if (decryptContents) {
        return await decryptPrompts(prompts);
      }

      return prompts;
    } catch (error) {
      console.error(`Supabase获取类型为 ${type} 的提示词失败，回退到本地存储:`, error);
    }
  }

  // 使用本地存储
  const prompts = await dbOperations.getAll<Prompt>(MAIN, PROMPTS);
  const filteredPrompts = prompts.filter(prompt => prompt.type === type);

  // 如果需要解密内容
  if (decryptContents) {
    return await decryptPrompts(filteredPrompts);
  }

  return filteredPrompts;
};

/**
 * 根据ID获取提示词
 * @param id 提示词ID
 * @param decryptContent 是否解密内容
 * @returns 提示词或null
 */
export const getPromptById = async (id: number | string, decryptContent: boolean = false): Promise<Prompt | null> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      // 从Supabase获取提示词，不解密内容
      const prompt = await getPromptByIdFromSupabase(id.toString(), false);

      // 如果找不到提示词
      if (!prompt) return null;

      // 如果需要解密内容
      if (decryptContent) {
        return await decryptPrompt(prompt);
      }

      return prompt;
    } catch (error) {
      console.error(`Supabase获取ID为 ${id} 的提示词失败，回退到本地存储:`, error);
    }
  }

  // 使用本地存储
  const prompt = await dbOperations.getById<Prompt>(MAIN, PROMPTS, id);

  // 如果找不到提示词
  if (!prompt) return null;

  // 如果需要解密内容
  if (decryptContent) {
    return await decryptPrompt(prompt);
  }

  return prompt;
};

/**
 * 更新提示词
 * @param prompt 提示词
 * @returns 更新后的提示词
 */
export const updatePrompt = async (prompt: Prompt): Promise<Prompt> => {
  if (!prompt.id) throw new Error('Prompt ID is required');

  // 加密提示词内容
  const encryptedPrompt = await encryptPrompt(prompt) as Prompt;

  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      return await updatePromptInSupabase(encryptedPrompt);
    } catch (error) {
      console.error('Supabase更新提示词失败，回退到本地存储:', error);
    }
  }

  // 使用本地存储
  return dbOperations.update<Prompt & { id: number }>(MAIN, PROMPTS, encryptedPrompt as Prompt & { id: number });
};

/**
 * 删除提示词
 * @param id 提示词ID
 */
export const deletePrompt = async (id: number | string): Promise<void> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      await deletePromptFromSupabase(id.toString());
      return;
    } catch (error) {
      console.error(`Supabase删除ID为 ${id} 的提示词失败，回退到本地存储:`, error);
    }
  }

  // 使用本地存储
  return dbOperations.remove(MAIN, PROMPTS, id);
};

/**
 * 获取当前用户的提示词
 * @param decryptContents 是否解密内容
 * @returns 当前用户的提示词
 */
export const getUserPrompts = async (decryptContents: boolean = false): Promise<Prompt[]> => {
  return getAllPrompts(decryptContents, true);
};

/**
 * 获取当前用户指定类型的提示词
 * @param type 提示词类型
 * @param decryptContents 是否解密内容
 * @returns 当前用户指定类型的提示词
 */
export const getUserPromptsByType = async (type: Prompt['type'], decryptContents: boolean = false): Promise<Prompt[]> => {
  return getPromptsByType(type, decryptContents, true);
};

/**
 * 检查提示词是否属于当前用户
 * @param promptId 提示词ID
 * @returns 是否属于当前用户
 */
export const isUserPrompt = async (promptId: number | string): Promise<boolean> => {
  const prompt = await getPromptById(promptId);
  if (!prompt) return false;

  const user = await useAuthStore.getState().getCurrentUser();
  if (!user) return false;

  return prompt.userId === user.id;
};

/**
 * 从用户提示词选择中获取提示词
 * @param type 提示词类型
 * @param decryptContents 是否解密内容
 * @returns 用户选择的提示词
 */
export const getSelectedPromptsByType = async (type: Prompt['type'], decryptContents: boolean = false): Promise<Prompt[]> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      // 获取用户选择的提示词ID
      const selectedPromptIds = await getUserPromptSelectionsFromSupabase();

      // 如果没有选择的提示词，返回空数组
      if (selectedPromptIds.length === 0) {
        return [];
      }

      // 获取用户选择的提示词
      const selectedPrompts: Prompt[] = [];
      for (const promptId of selectedPromptIds) {
        const prompt = await getPromptByIdFromSupabase(promptId.toString(), false);
        if (prompt && prompt.type === type) {
          selectedPrompts.push(prompt);
        }
      }

      // 如果需要解密内容
      if (decryptContents) {
        return await decryptPrompts(selectedPrompts);
      }

      return selectedPrompts;
    } catch (error) {
      console.error(`Supabase获取用户选择的类型为 ${type} 的提示词失败，回退到本地存储:`, error);
    }
  }

  // 使用本地存储
  return [];
};

/**
 * 获取AI界面下拉菜单中的提示词（包括用户自己的提示词和用户选择的公开提示词）
 * @param type 提示词类型
 * @param decryptContents 是否解密内容
 * @returns 用户可用的提示词
 */
export const getAIInterfacePromptsByType = async (type: Prompt['type'], decryptContents: boolean = false): Promise<Prompt[]> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      // 获取用户自己的提示词
      const userPrompts = await getPromptsByTypeFromSupabase(type, false, true);

      // 获取用户选择的提示词ID
      const selectedPromptIds = await getUserPromptSelectionsFromSupabase();

      // 如果没有选择的提示词，直接返回用户自己的提示词
      if (selectedPromptIds.length === 0) {
        // 如果需要解密内容
        if (decryptContents) {
          return await decryptPrompts(userPrompts);
        }
        return userPrompts;
      }

      // 获取用户选择的提示词
      const selectedPrompts: Prompt[] = [];
      for (const promptId of selectedPromptIds) {
        const prompt = await getPromptByIdFromSupabase(promptId.toString(), false);
        if (prompt && prompt.type === type) {
          // 添加所有选择的提示词，包括用户自己的和公开的
          selectedPrompts.push(prompt);
        }
      }

      // 合并用户自己的提示词和用户选择的提示词
      const allPrompts = [...userPrompts, ...selectedPrompts];

      // 去重
      const uniquePrompts = allPrompts.filter((prompt, index, self) =>
        index === self.findIndex(p => p.id === prompt.id)
      );

      // 按更新日期排序，最新的在前面
      const sortedPrompts = uniquePrompts.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      // 如果需要解密内容
      if (decryptContents) {
        return await decryptPrompts(sortedPrompts);
      }

      return sortedPrompts;
    } catch (error) {
      console.error(`Supabase获取AI界面提示词失败，回退到本地存储:`, error);
    }
  }

  // 使用本地存储
  const prompts = await dbOperations.getAll<Prompt>(MAIN, PROMPTS);
  const filteredPrompts = prompts.filter(prompt => prompt.type === type);

  // 如果需要解密内容
  if (decryptContents) {
    return await decryptPrompts(filteredPrompts);
  }

  return filteredPrompts;
};

/**
 * 获取所有公开提示词
 * @param type 提示词类型（可选）
 * @param decryptContents 是否解密内容
 * @returns 所有公开提示词
 */
export const getPublicPrompts = async (type?: Prompt['type'], decryptContents: boolean = false): Promise<Prompt[]> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      // 导入Supabase的获取公开提示词函数
      const { getPublicPromptsFromSupabase } = await import('@/lib/supabase/promptService');
      const publicPrompts = await getPublicPromptsFromSupabase(type, false);

      // 如果需要解密内容
      if (decryptContents) {
        return await decryptPrompts(publicPrompts);
      }

      return publicPrompts;
    } catch (error) {
      console.error(`Supabase获取公开提示词失败，回退到本地存储:`, error);
    }
  }

  // 使用本地存储 - 本地存储不支持公开提示词
  return [];
};

/**
 * 复制提示词到自己的账户
 * @param promptId 要复制的提示词ID
 * @returns 复制后的提示词
 */
export const copyPromptToMyAccount = async (promptId: number | string): Promise<Prompt> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      // 导入Supabase的复制函数
      const { copyPromptToMyAccount: copyPromptToMyAccountSupabase } = await import('@/lib/supabase/promptService');
      return await copyPromptToMyAccountSupabase(promptId.toString());
    } catch (error) {
      console.error(`Supabase复制ID为 ${promptId} 的提示词失败，回退到本地存储:`, error);
    }
  }

  // 使用本地存储
  const originalPrompt = await getPromptById(promptId);
  if (!originalPrompt) throw new Error('提示词不存在');

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

  // 添加到本地存储
  return await addPrompt(newPrompt);
};
