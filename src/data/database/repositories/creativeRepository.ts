/**
 * 创意地图仓库
 */
import { CreativeMapItem } from '../types/creativemap';
import { dbOperations } from '../core/operations';
import { DB_CONFIG } from '../config';

const { CREATIVEMAP } = DB_CONFIG.NAMES;
const { ITEMS } = DB_CONFIG.STORES.CREATIVEMAP;

/**
 * 添加创意地图项目
 * @param item 创意地图项目
 * @returns 添加后的创意地图项目
 */
export const addCreativeMapItem = async (item: Omit<CreativeMapItem, 'id'>): Promise<CreativeMapItem> => {
  return dbOperations.add<CreativeMapItem>(CREATIVEMAP, ITEMS, item);
};

/**
 * 获取所有创意地图项目
 * @returns 所有创意地图项目
 */
export const getAllCreativeMapItems = async (): Promise<CreativeMapItem[]> => {
  const items = await dbOperations.getAll<CreativeMapItem>(CREATIVEMAP, ITEMS);
  // 按更新日期排序，最新的在前面
  return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

/**
 * 根据类型获取创意地图项目
 * @param type 创意地图项目类型
 * @returns 指定类型的创意地图项目
 */
export const getCreativeMapItemsByType = async (type: string): Promise<CreativeMapItem[]> => {
  const items = await dbOperations.getAll<CreativeMapItem>(CREATIVEMAP, ITEMS);
  return items.filter(item => item.type === type);
};

/**
 * 根据ID获取创意地图项目
 * @param id 创意地图项目ID
 * @returns 创意地图项目或null
 */
export const getCreativeMapItemById = async (id: number): Promise<CreativeMapItem | null> => {
  const item = await dbOperations.getById<CreativeMapItem>(CREATIVEMAP, ITEMS, id);
  return item || null;
};

/**
 * 更新创意地图项目
 * @param item 创意地图项目
 * @returns 更新后的创意地图项目
 */
export const updateCreativeMapItem = async (item: CreativeMapItem): Promise<CreativeMapItem> => {
  if (!item.id) throw new Error('CreativeMapItem ID is required');
  return dbOperations.update<CreativeMapItem & { id: number }>(CREATIVEMAP, ITEMS, item as CreativeMapItem & { id: number });
};

/**
 * 删除创意地图项目
 * @param id 创意地图项目ID
 */
export const deleteCreativeMapItem = async (id: number): Promise<void> => {
  return dbOperations.remove(CREATIVEMAP, ITEMS, id);
};

/**
 * 清空所有创意地图项目
 */
export const clearAllCreativeMapItems = async (): Promise<void> => {
  return dbOperations.clear(CREATIVEMAP, ITEMS);
};
