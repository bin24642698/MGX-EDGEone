/**
 * 档案馆仓库
 */
import { Archive } from '../types/archive';
import { dbOperations } from '../core/operations';
import { DB_CONFIG } from '../config';

const { MAIN } = DB_CONFIG.NAMES;
const { ARCHIVES } = DB_CONFIG.STORES.MAIN;

/**
 * 添加档案
 * @param archive 档案
 * @returns 添加后的档案
 */
export const addArchive = async (archive: Omit<Archive, 'id'>): Promise<Archive> => {
  return dbOperations.add<Archive>(MAIN, ARCHIVES, archive);
};

/**
 * 获取所有档案
 * @returns 所有档案
 */
export const getAllArchives = async (): Promise<Archive[]> => {
  return dbOperations.getAll<Archive>(MAIN, ARCHIVES);
};

/**
 * 根据分类获取档案
 * @param category 分类
 * @returns 指定分类的档案
 */
export const getArchivesByCategory = async (category: string): Promise<Archive[]> => {
  try {
    const archives = await dbOperations.getAll<Archive>(MAIN, ARCHIVES);
    return archives.filter(archive => archive.category === category);
  } catch (error) {
    console.error(`获取分类为${category}的档案失败:`, error);
    return [];
  }
};

/**
 * 根据作品ID获取档案
 * @param workId 作品ID
 * @returns 指定作品的档案
 */
export const getArchivesByWorkId = async (workId: number): Promise<Archive[]> => {
  try {
    const archives = await dbOperations.getAll<Archive>(MAIN, ARCHIVES);
    return archives.filter(archive => archive.workId === workId);
  } catch (error) {
    console.error(`获取作品ID为${workId}的档案失败:`, error);
    return [];
  }
};

/**
 * 根据ID获取档案
 * @param id 档案ID
 * @returns 档案或null
 */
export const getArchiveById = async (id: number): Promise<Archive | null> => {
  const archive = await dbOperations.getById<Archive>(MAIN, ARCHIVES, id);
  return archive || null;
};

/**
 * 更新档案
 * @param archive 档案
 * @returns 更新后的档案
 */
export const updateArchive = async (archive: Archive): Promise<Archive> => {
  if (!archive.id) throw new Error('Archive ID is required');
  return dbOperations.update<Archive & { id: number }>(MAIN, ARCHIVES, archive as Archive & { id: number });
};

/**
 * 删除档案
 * @param id 档案ID
 */
export const deleteArchive = async (id: number): Promise<void> => {
  return dbOperations.remove(MAIN, ARCHIVES, id);
};
