/**
 * 设置状态切片
 */
import { create } from 'zustand';
import {
  isFirstVisit as checkFirstVisit,
  markVisited as markVisitedInDb,
  settings
} from '@/data';

interface SettingsState {
  isFirstVisit: boolean;
  isResetting: boolean;
  showSettings: boolean;
  isLoading: boolean;
  error: string | null;

  // 检查是否是首次访问
  checkFirstVisit: () => Promise<void>;

  // 标记已访问
  markVisited: () => Promise<void>;

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
export const useSettingsStore = create<SettingsState>((set) => ({
  isFirstVisit: true,
  isResetting: false,
  showSettings: false,
  isLoading: false,
  error: null,

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
