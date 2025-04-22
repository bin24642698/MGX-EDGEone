/**
 * 作品钩子
 */
import { useEffect } from 'react';
import { useWorksStore } from '@/store';
import { Work } from '@/types';

/**
 * 作品钩子
 * @returns 作品相关状态和方法
 */
export const useWorks = () => {
  const {
    works,
    typeWorks,
    selectedWork,
    isLoading,
    error,
    loadWorks,
    loadWorksByType,
    loadWorkById,
    addWork,
    updateWork,
    deleteWork,
    setSelectedWork
  } = useWorksStore();
  
  // 加载所有作品
  useEffect(() => {
    loadWorks();
  }, [loadWorks]);
  
  /**
   * 加载指定类型的作品
   * @param type 作品类型
   */
  const loadWorksByTypeAsync = async (type: string) => {
    await loadWorksByType(type);
  };
  
  /**
   * 加载指定ID的作品
   * @param id 作品ID
   * @returns 作品或null
   */
  const loadWorkByIdAsync = async (id: number) => {
    return await loadWorkById(id);
  };
  
  /**
   * 添加作品
   * @param work 作品
   * @returns 添加后的作品
   */
  const addWorkAsync = async (work: Omit<Work, 'id'>) => {
    return await addWork(work);
  };
  
  /**
   * 更新作品
   * @param work 作品
   * @returns 更新后的作品
   */
  const updateWorkAsync = async (work: Work) => {
    return await updateWork(work);
  };
  
  /**
   * 删除作品
   * @param id 作品ID
   */
  const deleteWorkAsync = async (id: number) => {
    await deleteWork(id);
  };
  
  return {
    works,
    typeWorks,
    selectedWork,
    isLoading,
    error,
    loadWorks,
    loadWorksByType: loadWorksByTypeAsync,
    loadWorkById: loadWorkByIdAsync,
    addWork: addWorkAsync,
    updateWork: updateWorkAsync,
    deleteWork: deleteWorkAsync,
    setSelectedWork
  };
};
