/**
 * 数据库操作
 */
import { getDatabase, generateId } from './core';

/**
 * 通用数据库操作函数
 */
export const dbOperations = {
  /**
   * 获取所有数据
   */
  getAll: async <T>(dbName: string, storeName: string): Promise<T[]> => {
    try {
      const db = await getDatabase(dbName);
      return db.getAll(storeName);
    } catch (error) {
      console.error(`获取所有${storeName}数据失败:`, error);
      return [];
    }
  },
  
  /**
   * 根据ID获取数据
   */
  getById: async <T>(dbName: string, storeName: string, id: number | string): Promise<T | undefined> => {
    try {
      const db = await getDatabase(dbName);
      return db.get(storeName, id);
    } catch (error) {
      console.error(`获取ID为${id}的${storeName}数据失败:`, error);
      return undefined;
    }
  },
  
  /**
   * 添加数据
   */
  add: async <T extends { id?: number | string }>(
    dbName: string, 
    storeName: string, 
    item: Omit<T, 'id'>, 
    generateIdFn = generateId
  ): Promise<T> => {
    try {
      const db = await getDatabase(dbName);
      const id = generateIdFn();
      const newItem = { ...item, id } as T;
      
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await store.add(newItem);
      await tx.done;
      
      return newItem;
    } catch (error) {
      console.error(`添加${storeName}数据失败:`, error);
      throw error;
    }
  },
  
  /**
   * 更新数据
   */
  update: async <T extends { id: number | string }>(dbName: string, storeName: string, item: T): Promise<T> => {
    try {
      const db = await getDatabase(dbName);
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await store.put(item);
      await tx.done;
      
      return item;
    } catch (error) {
      console.error(`更新${storeName}数据失败:`, error);
      throw error;
    }
  },
  
  /**
   * 删除数据
   */
  remove: async (dbName: string, storeName: string, id: number | string): Promise<void> => {
    try {
      const db = await getDatabase(dbName);
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await store.delete(id);
      await tx.done;
    } catch (error) {
      console.error(`删除ID为${id}的${storeName}数据失败:`, error);
      throw error;
    }
  },
  
  /**
   * 清空存储
   */
  clear: async (dbName: string, storeName: string): Promise<void> => {
    try {
      const db = await getDatabase(dbName);
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await store.clear();
      await tx.done;
    } catch (error) {
      console.error(`清空${storeName}数据失败:`, error);
      throw error;
    }
  },
  
  /**
   * 获取设置值
   */
  getSetting: async <T>(key: string, dbName: string, storeName: string): Promise<T | null> => {
    try {
      const db = await getDatabase(dbName);
      const value = await db.get(storeName, key);
      return value as T || null;
    } catch (error) {
      console.error(`获取设置${key}失败:`, error);
      return null;
    }
  },
  
  /**
   * 保存设置值
   */
  saveSetting: async <T>(key: string, value: T, dbName: string, storeName: string): Promise<void> => {
    try {
      const db = await getDatabase(dbName);
      await db.put(storeName, value, key);
    } catch (error) {
      console.error(`保存设置${key}失败:`, error);
      throw error;
    }
  }
};
