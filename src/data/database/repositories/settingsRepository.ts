/**
 * 设置仓库
 */
import { dbOperations } from '../core/operations';
import { DB_CONFIG } from '../config';

const { SETTINGS } = DB_CONFIG.NAMES;
const { SETTINGS: SETTINGS_STORE } = DB_CONFIG.STORES.SETTINGS;
const { FIRST_VISIT } = DB_CONFIG.KEYS;



/**
 * 检查是否是首次访问
 * @returns 是否是首次访问
 */
export const isFirstVisit = async (): Promise<boolean> => {
  // 服务端渲染检查
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const visited = await dbOperations.getSetting<string>(FIRST_VISIT, SETTINGS, SETTINGS_STORE);
    return !visited;
  } catch (error) {
    console.error('检查首次访问状态失败:', error);
    return false;
  }
};

/**
 * 标记已访问
 */
export const markVisited = async (): Promise<void> => {
  // 服务端渲染检查
  if (typeof window === 'undefined') {
    return;
  }

  try {
    await dbOperations.saveSetting(FIRST_VISIT, 'visited', SETTINGS, SETTINGS_STORE);
  } catch (error) {
    console.error('标记已访问状态失败:', error);
  }
};

/**
 * 通用设置管理
 */
export const settings = {
  /**
   * 获取设置值
   * @param key 设置键
   * @param defaultValue 默认值
   * @returns 设置值
   */
  get: async <T>(key: string, defaultValue: T): Promise<T> => {
    // 服务端渲染检查
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const value = await dbOperations.getSetting<T>(key, SETTINGS, SETTINGS_STORE);
      return value !== null ? value : defaultValue;
    } catch (error) {
      console.error(`获取设置${key}失败:`, error);
      return defaultValue;
    }
  },

  /**
   * 保存设置值
   * @param key 设置键
   * @param value 设置值
   */
  set: async <T>(key: string, value: T): Promise<void> => {
    // 服务端渲染检查
    if (typeof window === 'undefined') {
      return;
    }

    try {
      await dbOperations.saveSetting(key, value, SETTINGS, SETTINGS_STORE);
    } catch (error) {
      console.error(`保存设置${key}失败:`, error);
    }
  },

  /**
   * 删除设置
   * @param key 设置键
   */
  remove: async (key: string): Promise<void> => {
    // 服务端渲染检查
    if (typeof window === 'undefined') {
      return;
    }

    try {
      await dbOperations.saveSetting(key, null, SETTINGS, SETTINGS_STORE);
    } catch (error) {
      console.error(`删除设置${key}失败:`, error);
    }
  }
};
