/**
 * 数据库配置
 */

// 数据库配置类型
export interface DBConfig {
  NAMES: {
    MAIN: string;
    SETTINGS: string;
    NAVIGATION: string;
    CREATIVEMAP: string;
  };
  VERSIONS: {
    MAIN: number;
    SETTINGS: number;
    NAVIGATION: number;
    CREATIVEMAP: number;
  };
  STORES: {
    MAIN: {
      TODOS: string;
      WORKS: string;
      PROMPTS: string;
      ARCHIVES: string;
      USER_PROMPT_SELECTIONS: string;
    };
    SETTINGS: {
      SETTINGS: string;
    };
    NAVIGATION: {
      STATE: string;
    };
    CREATIVEMAP: {
      ITEMS: string;
    };
  };
  KEYS: {
    FIRST_VISIT: string;
  };
}

// 数据库配置常量
export const DB_CONFIG: DBConfig = {
  // 数据库名称
  NAMES: {
    MAIN: 'zhuguang_writing_app',
    SETTINGS: 'zhuguang_settings',
    NAVIGATION: 'zhuguang_navigation',
    CREATIVEMAP: 'zhuguang_creativemap'
  },
  // 数据库版本
  VERSIONS: {
    MAIN: 8,
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
      PROMPTS: 'prompts',
      ARCHIVES: 'archives',
      USER_PROMPT_SELECTIONS: 'user_prompt_selections'
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
    FIRST_VISIT: 'zhuguang_first_visit'
  }
};
