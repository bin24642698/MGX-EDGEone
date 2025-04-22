/**
 * 提示词仓库
 */
import { Prompt } from '@/types';
import { dbOperations } from '../operations';
import { DB_CONFIG } from '../config';

const { MAIN } = DB_CONFIG.NAMES;
const { PROMPTS } = DB_CONFIG.STORES.MAIN;

/**
 * 添加提示词
 * @param prompt 提示词
 * @returns 添加后的提示词
 */
export const addPrompt = async (prompt: Omit<Prompt, 'id'>): Promise<Prompt> => {
  return dbOperations.add<Prompt>(MAIN, PROMPTS, prompt);
};

/**
 * 获取所有提示词
 * @returns 所有提示词
 */
export const getAllPrompts = async (): Promise<Prompt[]> => {
  const prompts = await dbOperations.getAll<Prompt>(MAIN, PROMPTS);
  // 按更新日期排序，最新的在前面
  return prompts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

/**
 * 根据类型获取提示词
 * @param type 提示词类型
 * @returns 指定类型的提示词
 */
export const getPromptsByType = async (type: Prompt['type']): Promise<Prompt[]> => {
  const prompts = await dbOperations.getAll<Prompt>(MAIN, PROMPTS);
  return prompts.filter(prompt => prompt.type === type);
};

/**
 * 根据ID获取提示词
 * @param id 提示词ID
 * @returns 提示词或null
 */
export const getPromptById = async (id: number): Promise<Prompt | null> => {
  const prompt = await dbOperations.getById<Prompt>(MAIN, PROMPTS, id);
  return prompt || null;
};

/**
 * 更新提示词
 * @param prompt 提示词
 * @returns 更新后的提示词
 */
export const updatePrompt = async (prompt: Prompt): Promise<Prompt> => {
  if (!prompt.id) throw new Error('Prompt ID is required');
  return dbOperations.update<Prompt & { id: number }>(MAIN, PROMPTS, prompt as Prompt & { id: number });
};

/**
 * 删除提示词
 * @param id 提示词ID
 */
export const deletePrompt = async (id: number): Promise<void> => {
  return dbOperations.remove(MAIN, PROMPTS, id);
};
