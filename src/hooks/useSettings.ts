/**
 * 设置钩子
 */
import { useEffect } from 'react';
import { useSettingsStore } from '@/store';

/**
 * 设置钩子
 * @returns 设置相关状态和方法
 */
export const useSettings = () => {
  const {
    isFirstVisit,
    isResetting,
    showSettings,
    isLoading,
    error,
    checkFirstVisit,
    markVisited,
    setShowSettings,
    getSetting,
    saveSetting
  } = useSettingsStore();

  // 检查首次访问
  useEffect(() => {
    checkFirstVisit();
  }, [checkFirstVisit]);

  /**
   * 标记已访问
   */
  const markVisitedAsync = async () => {
    await markVisited();
  };

  /**
   * 获取设置值
   * @param key 设置键
   * @param defaultValue 默认值
   * @returns 设置值
   */
  const getSettingAsync = async <T>(key: string, defaultValue: T): Promise<T> => {
    return await getSetting(key, defaultValue);
  };

  /**
   * 保存设置值
   * @param key 设置键
   * @param value 设置值
   */
  const saveSettingAsync = async <T>(key: string, value: T): Promise<void> => {
    await saveSetting(key, value);
  };

  return {
    isFirstVisit,
    isResetting,
    showSettings,
    isLoading,
    error,
    markVisited: markVisitedAsync,
    setShowSettings,
    getSetting: getSettingAsync,
    saveSetting: saveSettingAsync
  };
};
