/**
 * 作品仓库
 */
import { Work } from '@/types';
import { dbOperations } from '../operations';
import { DB_CONFIG } from '../config';

const { MAIN } = DB_CONFIG.NAMES;
const { WORKS } = DB_CONFIG.STORES.MAIN;

/**
 * 添加作品
 * @param work 作品
 * @returns 添加后的作品
 */
export const addWork = async (work: Omit<Work, 'id'>): Promise<Work> => {
  return dbOperations.add<Work>(MAIN, WORKS, work);
};

/**
 * 获取所有作品
 * @returns 所有作品
 */
export const getAllWorks = async (): Promise<Work[]> => {
  const works = await dbOperations.getAll<Work>(MAIN, WORKS);
  // 按更新日期排序，最新的在前面
  return works.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

/**
 * 根据类型获取作品
 * @param type 作品类型
 * @returns 指定类型的作品
 */
export const getWorksByType = async (type: Work['type']): Promise<Work[]> => {
  // 获取所有作品并过滤
  const works = await dbOperations.getAll<Work>(MAIN, WORKS);
  return works.filter(work => work.type === type);
};

/**
 * 根据ID获取作品
 * @param id 作品ID
 * @returns 作品或null
 */
export const getWorkById = async (id: number): Promise<Work | null> => {
  const work = await dbOperations.getById<Work>(MAIN, WORKS, id);
  return work || null;
};

/**
 * 更新作品
 * @param work 作品
 * @returns 更新后的作品
 */
export const updateWork = async (work: Work): Promise<Work> => {
  if (!work.id) throw new Error('Work ID is required');
  return dbOperations.update<Work & { id: number }>(MAIN, WORKS, work as Work & { id: number });
};

/**
 * 删除作品
 * @param id 作品ID
 */
export const deleteWork = async (id: number): Promise<void> => {
  return dbOperations.remove(MAIN, WORKS, id);
};
