/**
 * 设置状态切片
 */
import { create } from 'zustand';
import {
  getApiKey as getApiKeyFromDb,
  saveApiKey as saveApiKeyToDb,
  removeApiKey as removeApiKeyFromDb,
  isFirstVisit as checkFirstVisit,
  markVisited as markVisitedInDb,
  settings
} from '@/lib/settingsManager';
import { resetAllDatabases } from '@/lib/dbManager';

interface SettingsState {
  apiKey: string;
  isFirstVisit: boolean;
  isResetting: boolean;
  showSettings: boolean;
  isLoading: boolean;
  error: string | null;

  // 加载API密钥
  loadApiKey: () => Promise<void>;

  // 保存API密钥
  saveApiKey: (apiKey: string) => Promise<void>;

  // 删除API密钥
  removeApiKey: () => Promise<void>;

  // 检查是否是首次访问
  checkFirstVisit: () => Promise<void>;

  // 标记已访问
  markVisited: () => Promise<void>;

  // 重置数据库
  resetDatabases: () => Promise<void>;

  // 设置显示设置弹窗
  setShowSettings: (show: boolean) => void;

  // 获取设置值
  getSetting: <T>(key: string, defaultValue: T) => Promise<T>;

  // 保存设置值
  saveSetting: <T>(key: string, value: T) => Promise<void>;
}

/**
 * 设置状态
 */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiKey: '',
  isFirstVisit: true,
  isResetting: false,
  showSettings: false,
  isLoading: false,
  error: null,

  // 加载API密钥
  loadApiKey: async () => {
    try {
      set({ isLoading: true, error: null });
      const apiKey = await getApiKeyFromDb();
      set({ apiKey: apiKey || '', isLoading: false });
    } catch (error) {
      console.error('加载API密钥失败:', error);
      set({
        apiKey: '',
        isLoading: false,
        error: error instanceof Error ? error.message : '加载API密钥失败'
      });
    }
  },

  // 保存API密钥
  saveApiKey: async (apiKey: string) => {
    try {
      set({ isLoading: true, error: null });
      await saveApiKeyToDb(apiKey);
      set({ apiKey, isLoading: false });
    } catch (error) {
      console.error('保存API密钥失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '保存API密钥失败'
      });
      throw error;
    }
  },

  // 删除API密钥
  removeApiKey: async () => {
    try {
      set({ isLoading: true, error: null });
      await removeApiKeyFromDb();
      set({ apiKey: '', isLoading: false });
    } catch (error) {
      console.error('删除API密钥失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '删除API密钥失败'
      });
      throw error;
    }
  },

  // 检查是否是首次访问
  checkFirstVisit: async () => {
    try {
      set({ isLoading: true, error: null });
      const isFirst = await checkFirstVisit();
      set({ isFirstVisit: isFirst, isLoading: false });
    } catch (error) {
      console.error('检查首次访问失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '检查首次访问失败'
      });
    }
  },

  // 标记已访问
  markVisited: async () => {
    try {
      set({ isLoading: true, error: null });
      await markVisitedInDb();
      set({ isFirstVisit: false, isLoading: false });
    } catch (error) {
      console.error('标记已访问失败:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '标记已访问失败'
      });
    }
  },

  // 重置数据库
  resetDatabases: async () => {
    try {
      set({ isResetting: true, error: null });
      await resetAllDatabases();
      set({ isResetting: false });
      return Promise.resolve();
    } catch (error) {
      console.error('重置数据库失败:', error);
      set({
        isResetting: false,
        error: error instanceof Error ? error.message : '重置数据库失败'
      });
      return Promise.reject(error);
    }
  },

  // 设置显示设置弹窗
  setShowSettings: (show: boolean) => {
    set({ showSettings: show });
  },

  // 获取设置值
  getSetting: async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
      return await settings.get(key, defaultValue);
    } catch (error) {
      console.error(`获取设置${key}失败:`, error);
      return defaultValue;
    }
  },

  // 保存设置值
  saveSetting: async <T>(key: string, value: T): Promise<void> => {
    try {
      await settings.set(key, value);
    } catch (error) {
      console.error(`保存设置${key}失败:`, error);
      throw error;
    }
  }
}));
