/**
 * 提示词状态切片
 */
import { create } from 'zustand';
import { Prompt } from '@/types';
import {
  getAllPrompts,
  getPromptsByType,
  getPromptById,
  addPrompt as addPromptToDb,
  updatePrompt as updatePromptInDb,
  deletePrompt as deletePromptFromDb
} from '@/data';
import { decryptPromptOnDemand } from '@/lib/promptEncryptionManager';

interface PromptsState {
  prompts: Prompt[];
  typePrompts: { [key: string]: Prompt[] };
  selectedPrompt: Prompt | null;
  isLoading: boolean;
  error: string | null;

  // 加载所有提示词
  loadPrompts: () => Promise<void>;

  // 加载指定类型的提示词
  loadPromptsByType: (type: string) => Promise<void>;

  // 加载所有类型的提示词
  loadAllTypePrompts: () => Promise<void>;

  // 添加提示词
  addPrompt: (prompt: Omit<Prompt, 'id'>) => Promise<Prompt>;

  // 更新提示词
  updatePrompt: (prompt: Prompt) => Promise<Prompt>;

  // 删除提示词
  deletePrompt: (id: number | string) => Promise<void>;

  // 设置选中的提示词
  setSelectedPrompt: (prompt: Prompt | null) => void;

  // 获取解密的提示词内容
  getDecryptedPromptContent: (promptId: number | string) => Promise<string>;
}

/**
 * 提示词状态
 */
export const usePromptsStore = create<PromptsState>((set, get) => ({
  prompts: [],
  typePrompts: {},
  selectedPrompt: null,
  isLoading: false,
  error: null,

  // 加载所有提示词
  loadPrompts: async () => {
    try {
      set({ isLoading: true, error: null });
      const loadedPrompts = await getAllPrompts();
      set({ prompts: loadedPrompts, isLoading: false });
    } catch (error) {
      console.error('加载提示词失败:', error);
      set({
        prompts: [],
        isLoading: false,
        error: error instanceof Error ? error.message : '加载提示词失败'
      });
    }
  },

  // 加载指定类型的提示词
  loadPromptsByType: async (type: string) => {
    try {
      set({ isLoading: true, error: null });
      const typePrompts = await getPromptsByType(type as Prompt['type']);
      set(state => ({
        typePrompts: {
          ...state.typePrompts,
          [type]: typePrompts
        },
        isLoading: false
      }));
    } catch (error) {
      console.error(`加载${type}类型提示词失败:`, error);
      set(state => ({
        typePrompts: {
          ...state.typePrompts,
          [type]: []
        },
        isLoading: false,
        error: error instanceof Error ? error.message : `加载${type}类型提示词失败`
      }));
    }
  },

  // 加载所有类型的提示词
  loadAllTypePrompts: async () => {
    try {
      set({ isLoading: true, error: null });
      const types = [
        'ai_writing', 'ai_polishing', 'ai_analysis', 'worldbuilding', 'character',
        'plot', 'introduction', 'outline', 'detailed_outline'
      ];
      const typePromptsObj: { [key: string]: Prompt[] } = {};

      for (const type of types) {
        try {
          const typePrompts = await getPromptsByType(type as Prompt['type']);
          typePromptsObj[type] = typePrompts;
        } catch (error) {
          console.error(`加载${type}类型提示词失败:`, error);
          typePromptsObj[type] = [];
        }
      }

      set({ typePrompts: typePromptsObj, isLoading: false });
    } catch (error) {
      console.error('加载所有类型提示词失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '加载所有类型提示词失败'
      });
    }
  },

  // 添加提示词
  addPrompt: async (prompt: Omit<Prompt, 'id'>) => {
    try {
      set({ isLoading: true, error: null });
      const newPrompt = await addPromptToDb(prompt);

      // 更新状态
      set(state => ({
        prompts: [newPrompt, ...state.prompts],
        typePrompts: {
          ...state.typePrompts,
          [prompt.type]: state.typePrompts[prompt.type]
            ? [newPrompt, ...state.typePrompts[prompt.type]]
            : [newPrompt]
        },
        isLoading: false
      }));

      return newPrompt;
    } catch (error) {
      console.error('添加提示词失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '添加提示词失败'
      });
      throw error;
    }
  },

  // 更新提示词
  updatePrompt: async (prompt: Prompt) => {
    try {
      set({ isLoading: true, error: null });
      const updatedPrompt = await updatePromptInDb(prompt);

      // 更新状态
      set(state => ({
        prompts: state.prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p),
        typePrompts: {
          ...state.typePrompts,
          [prompt.type]: state.typePrompts[prompt.type]
            ? state.typePrompts[prompt.type].map(p => p.id === updatedPrompt.id ? updatedPrompt : p)
            : []
        },
        selectedPrompt: state.selectedPrompt?.id === updatedPrompt.id ? updatedPrompt : state.selectedPrompt,
        isLoading: false
      }));

      return updatedPrompt;
    } catch (error) {
      console.error('更新提示词失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '更新提示词失败'
      });
      throw error;
    }
  },

  // 删除提示词
  deletePrompt: async (id: number | string) => {
    try {
      set({ isLoading: true, error: null });
      await deletePromptFromDb(id);

      // 获取要删除的提示词类型
      const promptToDelete = get().prompts.find(p => p.id === id);
      const promptType = promptToDelete?.type;

      // 更新状态
      set(state => ({
        prompts: state.prompts.filter(p => p.id !== id),
        typePrompts: promptType
          ? {
              ...state.typePrompts,
              [promptType]: state.typePrompts[promptType]
                ? state.typePrompts[promptType].filter(p => p.id !== id)
                : []
            }
          : state.typePrompts,
        selectedPrompt: state.selectedPrompt?.id === id ? null : state.selectedPrompt,
        isLoading: false
      }));
    } catch (error) {
      console.error('删除提示词失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '删除提示词失败'
      });
      throw error;
    }
  },

  // 设置选中的提示词
  setSelectedPrompt: (prompt: Prompt | null) => {
    set({ selectedPrompt: prompt });
  },

  // 获取解密的提示词内容
  getDecryptedPromptContent: async (promptId: number | string) => {
    try {
      // 先从状态中查找提示词
      const prompt = get().prompts.find(p => p.id === promptId);

      // 如果状态中没有，则从数据库获取
      const targetPrompt = prompt || await getPromptById(promptId);

      if (!targetPrompt) {
        throw new Error(`提示词 ID ${promptId} 不存在`);
      }

      // 解密提示词内容
      return await decryptPromptOnDemand(targetPrompt);
    } catch (error) {
      console.error('获取解密的提示词内容失败:', error);
      throw error;
    }
  }
}));
