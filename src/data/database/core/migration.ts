/**
 * 数据库迁移
 */
import { IDBPDatabase } from 'idb';
import { DB_CONFIG } from '../config';

/**
 * 升级主数据库
 * @param db 数据库实例
 * @param oldVersion 旧版本号
 */
export function upgradeMainDatabase(db: IDBPDatabase, oldVersion: number): void {
  // 创建待办事项对象库
  if (oldVersion < 1) {
    if (!db.objectStoreNames.contains(DB_CONFIG.STORES.MAIN.TODOS)) {
      const todoStore = db.createObjectStore(DB_CONFIG.STORES.MAIN.TODOS, { keyPath: 'id' });
      todoStore.createIndex('createdAt', 'createdAt');
    }
  }

  // 创建作品对象库
  if (oldVersion < 2) {
    if (!db.objectStoreNames.contains(DB_CONFIG.STORES.MAIN.WORKS)) {
      const workStore = db.createObjectStore(DB_CONFIG.STORES.MAIN.WORKS, { keyPath: 'id' });
      workStore.createIndex('updatedAt', 'updatedAt');
      workStore.createIndex('type', 'type');
    }
  }

  // 创建提示词对象库
  if (oldVersion < 3) {
    if (!db.objectStoreNames.contains(DB_CONFIG.STORES.MAIN.PROMPTS)) {
      const promptStore = db.createObjectStore(DB_CONFIG.STORES.MAIN.PROMPTS, { keyPath: 'id' });
      promptStore.createIndex('updatedAt', 'updatedAt');
      promptStore.createIndex('type', 'type');
    }
  }

  // 创建档案馆对象库
  if (oldVersion < 4) {
    if (!db.objectStoreNames.contains(DB_CONFIG.STORES.MAIN.ARCHIVES)) {
      const archiveStore = db.createObjectStore(DB_CONFIG.STORES.MAIN.ARCHIVES, { keyPath: 'id' });
      archiveStore.createIndex('updatedAt', 'updatedAt');
      archiveStore.createIndex('category', 'category');
      archiveStore.createIndex('workId', 'workId');
    }
  }

  // 创建用户提示词选择对象库
  if (oldVersion < 8) {
    if (!db.objectStoreNames.contains(DB_CONFIG.STORES.MAIN.USER_PROMPT_SELECTIONS)) {
      const selectionStore = db.createObjectStore(DB_CONFIG.STORES.MAIN.USER_PROMPT_SELECTIONS, { keyPath: 'id' });
      selectionStore.createIndex('userId', 'userId');
      selectionStore.createIndex('promptId', 'promptId');
      selectionStore.createIndex('createdAt', 'createdAt');
    }
  }
}

/**
 * 升级设置数据库
 * @param db 数据库实例
 * @param oldVersion 旧版本号
 */
export function upgradeSettingsDatabase(db: IDBPDatabase, oldVersion: number): void {
  if (oldVersion < 1) {
    if (!db.objectStoreNames.contains(DB_CONFIG.STORES.SETTINGS.SETTINGS)) {
      db.createObjectStore(DB_CONFIG.STORES.SETTINGS.SETTINGS);
    }
  }
}

/**
 * 升级导航数据库
 * @param db 数据库实例
 * @param oldVersion 旧版本号
 */
export function upgradeNavigationDatabase(db: IDBPDatabase, oldVersion: number): void {
  if (oldVersion < 1) {
    if (!db.objectStoreNames.contains(DB_CONFIG.STORES.NAVIGATION.STATE)) {
      db.createObjectStore(DB_CONFIG.STORES.NAVIGATION.STATE);
    }
  }
}

/**
 * 升级创意地图数据库
 * @param db 数据库实例
 * @param oldVersion 旧版本号
 */
export function upgradeCreativeMapDatabase(db: IDBPDatabase, oldVersion: number): void {
  if (oldVersion < 1) {
    if (!db.objectStoreNames.contains(DB_CONFIG.STORES.CREATIVEMAP.ITEMS)) {
      const itemsStore = db.createObjectStore(DB_CONFIG.STORES.CREATIVEMAP.ITEMS, { keyPath: 'id' });
      itemsStore.createIndex('updatedAt', 'updatedAt');
      itemsStore.createIndex('type', 'type');
    }
  }
}
