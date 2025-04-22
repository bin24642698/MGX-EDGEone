/**
 * 提示词钩子
 */
import { useEffect } from 'react';
import { usePromptsStore } from '@/store';
import { Prompt } from '@/types';

/**
 * 提示词钩子
 * @returns 提示词相关状态和方法
 */
export const usePrompts = () => {
  const {
    prompts,
    typePrompts,
    selectedPrompt,
    isLoading,
    error,
    loadPrompts,
    loadPromptsByType,
    loadAllTypePrompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    setSelectedPrompt
  } = usePromptsStore();
  
  // 加载所有提示词
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);
  
  /**
   * 加载指定类型的提示词
   * @param type 提示词类型
   */
  const loadPromptsByTypeAsync = async (type: string) => {
    await loadPromptsByType(type);
  };
  
  /**
   * 添加提示词
   * @param prompt 提示词
   * @returns 添加后的提示词
   */
  const addPromptAsync = async (prompt: Omit<Prompt, 'id'>) => {
    return await addPrompt(prompt);
  };
  
  /**
   * 更新提示词
   * @param prompt 提示词
   * @returns 更新后的提示词
   */
  const updatePromptAsync = async (prompt: Prompt) => {
    return await updatePrompt(prompt);
  };
  
  /**
   * 删除提示词
   * @param id 提示词ID
   */
  const deletePromptAsync = async (id: number) => {
    await deletePrompt(id);
  };
  
  return {
    prompts,
    typePrompts,
    selectedPrompt,
    isLoading,
    error,
    loadPrompts,
    loadPromptsByType: loadPromptsByTypeAsync,
    loadAllTypePrompts,
    addPrompt: addPromptAsync,
    updatePrompt: updatePromptAsync,
    deletePrompt: deletePromptAsync,
    setSelectedPrompt
  };
};
