/**
 * 数据库连接管理
 */
import { openDB, IDBPDatabase, deleteDB } from 'idb';
import { DB_CONFIG } from '../config';
import { upgradeMainDatabase, upgradeSettingsDatabase, upgradeNavigationDatabase, upgradeCreativeMapDatabase } from './migration';

// 数据库连接缓存
interface DBCache {
  [key: string]: Promise<IDBPDatabase> | null;
}

const dbCache: DBCache = {
  [DB_CONFIG.NAMES.MAIN]: null,
  [DB_CONFIG.NAMES.SETTINGS]: null,
  [DB_CONFIG.NAMES.NAVIGATION]: null,
  [DB_CONFIG.NAMES.CREATIVEMAP]: null
};

/**
 * 获取数据库连接
 * @param dbName 数据库名称
 * @returns 数据库连接Promise
 */
export const getDatabase = (dbName: string): Promise<IDBPDatabase> => {
  // 服务端渲染检查
  if (typeof window === 'undefined') {
    // 创建一个虚拟的数据库对象，但实际上不会被使用
    // 这样可以避免在服务端渲染时报错
    return Promise.resolve({} as IDBPDatabase);
  }

  // 检查缓存中是否已有连接
  if (!dbCache[dbName]) {
    console.log(`Opening database ${dbName}`);

    // 根据数据库名称获取对应的版本
    const version = DB_CONFIG.VERSIONS[dbName as keyof typeof DB_CONFIG.VERSIONS];

    // 创建数据库连接
    dbCache[dbName] = openDB(dbName, version, {
      upgrade(db, oldVersion, newVersion) {
        // 根据数据库名称执行不同的升级逻辑
        if (dbName === DB_CONFIG.NAMES.MAIN) {
          upgradeMainDatabase(db, oldVersion);
        } else if (dbName === DB_CONFIG.NAMES.SETTINGS) {
          upgradeSettingsDatabase(db, oldVersion);
        } else if (dbName === DB_CONFIG.NAMES.NAVIGATION) {
          upgradeNavigationDatabase(db, oldVersion);
        } else if (dbName === DB_CONFIG.NAMES.CREATIVEMAP) {
          upgradeCreativeMapDatabase(db, oldVersion);
        }
      }
    });
  }

  return dbCache[dbName];
};

/**
 * 关闭数据库连接
 * @param dbName 数据库名称
 */
export const closeDatabase = async (dbName: string): Promise<void> => {
  if (dbCache[dbName]) {
    const db = await dbCache[dbName];
    if (db) {
      db.close();
      dbCache[dbName] = null;
    }
  }
};

/**
 * 重置所有数据库
 */
export const resetAllDatabases = async (): Promise<void> => {
  // 服务端渲染检查
  if (typeof window === 'undefined') {
    return Promise.resolve(); // 在服务端什么也不做，但不报错
  }

  try {
    // 关闭所有数据库连接
    for (const dbName of Object.values(DB_CONFIG.NAMES)) {
      await closeDatabase(dbName);
    }

    // 删除所有数据库
    for (const dbName of Object.values(DB_CONFIG.NAMES)) {
      await deleteDB(dbName);
      console.log(`数据库 ${dbName} 已删除`);
    }

    console.log('所有数据库已重置，请刷新页面');
    return Promise.resolve();
  } catch (error) {
    console.error('重置数据库失败:', error);
    return Promise.reject(error);
  }
};
