/**
 * 作品状态切片
 */
import { create } from 'zustand';
import { Work } from '@/types';
import {
  getAllWorks,
  getWorksByType,
  getWorkById,
  addWork as addWorkToDb,
  updateWork as updateWorkInDb,
  deleteWork as deleteWorkFromDb
} from '@/data';

interface WorksState {
  works: Work[];
  typeWorks: { [key: string]: Work[] };
  selectedWork: Work | null;
  isLoading: boolean;
  error: string | null;

  // 加载所有作品
  loadWorks: () => Promise<void>;

  // 加载指定类型的作品
  loadWorksByType: (type: string) => Promise<void>;

  // 加载指定ID的作品
  loadWorkById: (id: number) => Promise<Work | null>;

  // 添加作品
  addWork: (work: Omit<Work, 'id'>) => Promise<Work>;

  // 更新作品
  updateWork: (work: Work) => Promise<Work>;

  // 删除作品
  deleteWork: (id: number) => Promise<void>;

  // 设置选中的作品
  setSelectedWork: (work: Work | null) => void;
}

/**
 * 作品状态
 */
export const useWorksStore = create<WorksState>((set, get) => ({
  works: [],
  typeWorks: {},
  selectedWork: null,
  isLoading: false,
  error: null,

  // 加载所有作品
  loadWorks: async () => {
    try {
      set({ isLoading: true, error: null });
      const loadedWorks = await getAllWorks();
      set({ works: loadedWorks, isLoading: false });
    } catch (error) {
      console.error('加载作品失败:', error);
      set({
        works: [],
        isLoading: false,
        error: error instanceof Error ? error.message : '加载作品失败'
      });
    }
  },

  // 加载指定类型的作品
  loadWorksByType: async (type: string) => {
    try {
      set({ isLoading: true, error: null });
      const typeWorks = await getWorksByType(type as Work['type']);
      set(state => ({
        typeWorks: {
          ...state.typeWorks,
          [type]: typeWorks
        },
        isLoading: false
      }));
    } catch (error) {
      console.error(`加载${type}类型作品失败:`, error);
      set(state => ({
        typeWorks: {
          ...state.typeWorks,
          [type]: []
        },
        isLoading: false,
        error: error instanceof Error ? error.message : `加载${type}类型作品失败`
      }));
    }
  },

  // 加载指定ID的作品
  loadWorkById: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      const work = await getWorkById(id);
      if (work) {
        set({ selectedWork: work, isLoading: false });
      } else {
        set({ isLoading: false, error: '作品不存在' });
      }
      return work;
    } catch (error) {
      console.error(`加载ID为${id}的作品失败:`, error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : `加载ID为${id}的作品失败`
      });
      return null;
    }
  },

  // 添加作品
  addWork: async (work: Omit<Work, 'id'>) => {
    try {
      set({ isLoading: true, error: null });
      const newWork = await addWorkToDb(work);

      // 更新状态
      set(state => ({
        works: [newWork, ...state.works],
        typeWorks: {
          ...state.typeWorks,
          [work.type]: state.typeWorks[work.type]
            ? [newWork, ...state.typeWorks[work.type]]
            : [newWork]
        },
        isLoading: false
      }));

      return newWork;
    } catch (error) {
      console.error('添加作品失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '添加作品失败'
      });
      throw error;
    }
  },

  // 更新作品
  updateWork: async (work: Work) => {
    try {
      set({ isLoading: true, error: null });
      const updatedWork = await updateWorkInDb(work);

      // 更新状态
      set(state => ({
        works: state.works.map(w => w.id === updatedWork.id ? updatedWork : w),
        typeWorks: {
          ...state.typeWorks,
          [work.type]: state.typeWorks[work.type]
            ? state.typeWorks[work.type].map(w => w.id === updatedWork.id ? updatedWork : w)
            : []
        },
        selectedWork: state.selectedWork?.id === updatedWork.id ? updatedWork : state.selectedWork,
        isLoading: false
      }));

      return updatedWork;
    } catch (error) {
      console.error('更新作品失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '更新作品失败'
      });
      throw error;
    }
  },

  // 删除作品
  deleteWork: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await deleteWorkFromDb(id);

      // 获取要删除的作品类型
      const workToDelete = get().works.find(w => w.id === id);
      const workType = workToDelete?.type;

      // 更新状态
      set(state => ({
        works: state.works.filter(w => w.id !== id),
        typeWorks: workType
          ? {
              ...state.typeWorks,
              [workType]: state.typeWorks[workType]
                ? state.typeWorks[workType].filter(w => w.id !== id)
                : []
            }
          : state.typeWorks,
        selectedWork: state.selectedWork?.id === id ? null : state.selectedWork,
        isLoading: false
      }));
    } catch (error) {
      console.error('删除作品失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '删除作品失败'
      });
      throw error;
    }
  },

  // 设置选中的作品
  setSelectedWork: (work: Work | null) => {
    set({ selectedWork: work });
  }
}));
