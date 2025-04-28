/**
 * 日志控制工具
 * 用于控制应用中的日志输出
 */

import { settings } from '@/data/database/repositories/settingsRepository';

// 设置键名
const LOG_ENABLED_KEY = 'log_enabled';

// 原始控制台方法的备份
let originalConsole: {
  log: typeof console.log;
  info: typeof console.info;
  warn: typeof console.warn;
  error: typeof console.error;
  debug: typeof console.debug;
} | null = null;

/**
 * 禁用控制台日志输出
 */
export const disableConsoleLogs = (): void => {
  // 如果在服务器端，不执行任何操作
  if (typeof window === 'undefined') return;

  // 备份原始方法
  if (!originalConsole) {
    originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };
  }

  // 重写控制台方法
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.debug = () => {};
  console.error = () => {};

  // 保存设置
  settings.set(LOG_ENABLED_KEY, false);
};

/**
 * 启用控制台日志输出
 */
export const enableConsoleLogs = (): void => {
  // 如果在服务器端，不执行任何操作
  if (typeof window === 'undefined') return;

  // 如果有原始方法的备份，恢复它们
  if (originalConsole) {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
    originalConsole = null;
  }

  // 保存设置
  settings.set(LOG_ENABLED_KEY, true);
};

/**
 * 根据保存的设置初始化日志控制
 */
export const initLogControl = async (): Promise<void> => {
  // 如果在服务器端，不执行任何操作
  if (typeof window === 'undefined') return;

  try {
    // 获取保存的设置，默认为启用日志
    const isLogEnabled = await settings.get<boolean>(LOG_ENABLED_KEY, true);

    // 根据设置应用日志控制
    if (!isLogEnabled) {
      disableConsoleLogs();
    }
  } catch (error) {
    // 如果出错，默认启用日志
    console.error('初始化日志控制失败:', error);
  }
};

/**
 * 切换日志输出状态
 */
export const toggleConsoleLogs = async (): Promise<boolean> => {
  // 如果在服务器端，不执行任何操作
  if (typeof window === 'undefined') return true;

  try {
    // 获取当前设置
    const isLogEnabled = await settings.get<boolean>(LOG_ENABLED_KEY, true);

    // 切换设置
    if (isLogEnabled) {
      disableConsoleLogs();
      return false;
    } else {
      enableConsoleLogs();
      return true;
    }
  } catch (error) {
    console.error('切换日志输出状态失败:', error);
    return true;
  }
};

/**
 * 获取当前日志输出状态
 */
export const getLogStatus = async (): Promise<boolean> => {
  // 如果在服务器端，返回默认值
  if (typeof window === 'undefined') return true;

  try {
    // 获取当前设置
    return await settings.get<boolean>(LOG_ENABLED_KEY, true);
  } catch (error) {
    console.error('获取日志状态失败:', error);
    return true;
  }
};
