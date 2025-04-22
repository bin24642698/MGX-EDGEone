/**
 * 设置仓库
 */
import { dbOperations } from '../operations';
import { DB_CONFIG } from '../config';

const { SETTINGS } = DB_CONFIG.NAMES;
const { SETTINGS: SETTINGS_STORE } = DB_CONFIG.STORES.SETTINGS;
const { API_KEY, FIRST_VISIT } = DB_CONFIG.KEYS;

/**
 * 获取API密钥
 * @returns API密钥或null
 */
export const getApiKey = async (): Promise<string | null> => {
  return dbOperations.getSetting<string>(API_KEY, SETTINGS, SETTINGS_STORE);
};

/**
 * 保存API密钥
 * @param apiKey API密钥
 */
export const saveApiKey = async (apiKey: string): Promise<void> => {
  return dbOperations.saveSetting(API_KEY, apiKey, SETTINGS, SETTINGS_STORE);
};

/**
 * 删除API密钥
 */
export const removeApiKey = async (): Promise<void> => {
  return dbOperations.saveSetting(API_KEY, null, SETTINGS, SETTINGS_STORE);
};

/**
 * 检查是否是首次访问
 * @returns 是否是首次访问
 */
export const isFirstVisit = async (): Promise<boolean> => {
  const visited = await dbOperations.getSetting<string>(FIRST_VISIT, SETTINGS, SETTINGS_STORE);
  return !visited;
};

/**
 * 标记已访问
 */
export const markVisited = async (): Promise<void> => {
  return dbOperations.saveSetting(FIRST_VISIT, 'visited', SETTINGS, SETTINGS_STORE);
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
    const value = await dbOperations.getSetting<T>(key, SETTINGS, SETTINGS_STORE);
    return value !== null ? value : defaultValue;
  },

  /**
   * 保存设置值
   * @param key 设置键
   * @param value 设置值
   */
  set: async <T>(key: string, value: T): Promise<void> => {
    return dbOperations.saveSetting(key, value, SETTINGS, SETTINGS_STORE);
  },

  /**
   * 删除设置
   * @param key 设置键
   */
  remove: async (key: string): Promise<void> => {
    return dbOperations.saveSetting(key, null, SETTINGS, SETTINGS_STORE);
  }
};
