/**
 * 用户提示词选择仓库
 */
import { UserPromptSelection } from '../types/userPromptSelection';
import { dbOperations } from '../core/operations';
import { DB_CONFIG } from '../config';
import {
  getUserPromptSelectionsFromSupabase,
  addUserPromptSelectionToSupabase,
  removeUserPromptSelectionFromSupabase,
  isPromptSelectedByUserInSupabase
} from '@/lib/supabase/userPromptSelectionService';
import { useAuthStore } from '@/store/slices/authStore';

const { MAIN } = DB_CONFIG.NAMES;
const { USER_PROMPT_SELECTIONS } = DB_CONFIG.STORES.MAIN;

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
 * 获取用户选择的提示词ID列表
 * @returns 提示词ID数组
 */
export const getUserPromptSelections = async (): Promise<number[]> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      return await getUserPromptSelectionsFromSupabase();
    } catch (error) {
      console.error('Supabase获取用户提示词选择失败，回退到本地存储:', error);
    }
  }

  // 使用本地存储
  try {
    const user = await useAuthStore.getState().getCurrentUser();
    if (!user) return [];

    const selections = await dbOperations.getAll<UserPromptSelection>(MAIN, USER_PROMPT_SELECTIONS);
    return selections
      .filter(selection => selection.userId === user.id)
      .map(selection => selection.promptId);
  } catch (error) {
    console.error('获取用户提示词选择失败:', error);
    return [];
  }
};

/**
 * 添加提示词到用户选择
 * @param promptId 提示词ID
 * @returns 添加的用户提示词选择
 */
export const addUserPromptSelection = async (promptId: number): Promise<UserPromptSelection> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      return await addUserPromptSelectionToSupabase(promptId);
    } catch (error) {
      console.error('Supabase添加用户提示词选择失败，回退到本地存储:', error);
    }
  }

  // 使用本地存储
  try {
    const user = await useAuthStore.getState().getCurrentUser();
    if (!user) throw new Error('用户未登录');

    // 检查是否已经添加过
    const selections = await dbOperations.getAll<UserPromptSelection>(MAIN, USER_PROMPT_SELECTIONS);
    const existingSelection = selections.find(
      selection => selection.userId === user.id && selection.promptId === promptId
    );

    // 如果已经添加过，直接返回
    if (existingSelection) {
      return existingSelection;
    }

    // 添加新的选择
    const newSelection: Omit<UserPromptSelection, 'id'> = {
      userId: user.id,
      promptId,
      createdAt: new Date()
    };

    return await dbOperations.add<UserPromptSelection>(MAIN, USER_PROMPT_SELECTIONS, newSelection);
  } catch (error) {
    console.error('添加用户提示词选择失败:', error);
    throw error;
  }
};

/**
 * 删除用户提示词选择
 * @param promptId 提示词ID
 */
export const removeUserPromptSelection = async (promptId: number): Promise<void> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      await removeUserPromptSelectionFromSupabase(promptId);
      return;
    } catch (error) {
      console.error('Supabase删除用户提示词选择失败，回退到本地存储:', error);
    }
  }

  // 使用本地存储
  try {
    const user = await useAuthStore.getState().getCurrentUser();
    if (!user) throw new Error('用户未登录');

    // 查找要删除的选择
    const selections = await dbOperations.getAll<UserPromptSelection>(MAIN, USER_PROMPT_SELECTIONS);
    const selectionToRemove = selections.find(
      selection => selection.userId === user.id && selection.promptId === promptId
    );

    // 如果找到了选择，删除它
    if (selectionToRemove && selectionToRemove.id) {
      await dbOperations.remove(MAIN, USER_PROMPT_SELECTIONS, selectionToRemove.id);
    }
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
export const isPromptSelectedByUser = async (promptId: number): Promise<boolean> => {
  // 如果使用Supabase
  if (await useSupabase()) {
    try {
      return await isPromptSelectedByUserInSupabase(promptId);
    } catch (error) {
      console.error('Supabase检查提示词是否已被选择失败，回退到本地存储:', error);
    }
  }

  // 使用本地存储
  try {
    const user = await useAuthStore.getState().getCurrentUser();
    if (!user) return false;

    const selections = await dbOperations.getAll<UserPromptSelection>(MAIN, USER_PROMPT_SELECTIONS);
    return selections.some(
      selection => selection.userId === user.id && selection.promptId === promptId
    );
  } catch (error) {
    console.error('检查提示词是否已被选择失败:', error);
    return false;
  }
};
