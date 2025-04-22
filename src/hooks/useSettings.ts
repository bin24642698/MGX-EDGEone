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
    apiKey,
    isFirstVisit,
    isResetting,
    showSettings,
    isLoading,
    error,
    loadApiKey,
    saveApiKey,
    removeApiKey,
    checkFirstVisit,
    markVisited,
    resetDatabases,
    setShowSettings,
    getSetting,
    saveSetting
  } = useSettingsStore();
  
  // 加载API密钥和检查首次访问
  useEffect(() => {
    loadApiKey();
    checkFirstVisit();
  }, [loadApiKey, checkFirstVisit]);
  
  /**
   * 保存API密钥
   * @param key API密钥
   */
  const saveApiKeyAsync = async (key: string) => {
    await saveApiKey(key);
  };
  
  /**
   * 删除API密钥
   */
  const removeApiKeyAsync = async () => {
    await removeApiKey();
  };
  
  /**
   * 标记已访问
   */
  const markVisitedAsync = async () => {
    await markVisited();
  };
  
  /**
   * 重置数据库
   */
  const resetDatabasesAsync = async () => {
    await resetDatabases();
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
    apiKey,
    isFirstVisit,
    isResetting,
    showSettings,
    isLoading,
    error,
    loadApiKey,
    saveApiKey: saveApiKeyAsync,
    removeApiKey: removeApiKeyAsync,
    markVisited: markVisitedAsync,
    resetDatabases: resetDatabasesAsync,
    setShowSettings,
    getSetting: getSettingAsync,
    saveSetting: saveSettingAsync
  };
};
