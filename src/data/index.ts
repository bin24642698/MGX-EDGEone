/**
 * 数据模块入口
 * 统一管理所有数据相关的操作和存储
 */

// 导出数据库模块
export * from './database';

// 直接导出仓库，方便使用
export * from './database/repositories';

// 导出数据类型
export * from './database/types';

// 导出数据库核心功能
export * from './database/core';
