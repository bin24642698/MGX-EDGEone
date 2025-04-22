/**
 * 数据库配置
 */
import { DBConfig } from '@/types';

// 数据库配置常量
export const DB_CONFIG: DBConfig = {
  // 数据库名称
  NAMES: {
    MAIN: 'zhixia_writing_app',
    SETTINGS: 'zhixia_settings',
    NAVIGATION: 'zhixia_navigation',
    CREATIVEMAP: 'zhixia_creativemap'
  },
  // 数据库版本
  VERSIONS: {
    MAIN: 7,
    SETTINGS: 7,
    NAVIGATION: 7,
    CREATIVEMAP: 1
  },
  // 存储对象名称
  STORES: {
    // 主数据库存储
    MAIN: {
      TODOS: 'todos',
      WORKS: 'works',
      PROMPTS: 'prompts'
    },
    // 设置数据库存储
    SETTINGS: {
      SETTINGS: 'settings'
    },
    // 导航数据库存储
    NAVIGATION: {
      STATE: 'state'
    },
    // 创意地图数据库存储
    CREATIVEMAP: {
      ITEMS: 'items'
    }
  },
  // 存储键
  KEYS: {
    API_KEY: 'zhixia_api_key',
    FIRST_VISIT: 'zhixia_first_visit'
  }
};
