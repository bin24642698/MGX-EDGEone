/**
 * 数据库类型定义
 */

// 待办事项类型
export interface Todo {
  id?: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// 作品类型
export interface Work {
  id?: number;
  title: string;
  description: string;
  type: 'novel' | 'character' | 'worldbuilding' | 'plot';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// 提示词类型
export interface Prompt {
  id?: number;
  title: string;
  type: 'ai_writing' | 'ai_polishing' | 'ai_analysis' | 'worldbuilding' | 'character' | 'plot' | 'introduction' | 'outline' | 'detailed_outline';
  content: string;
  description?: string;
  examples?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 档案馆类型
export interface Archive {
  id?: number;
  title: string;
  content: string;
  category: string;
  workId: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 创意地图项目类型
export interface CreativeMapItem {
  id?: number;
  title: string;
  type: string;
  content: string;
  position: { x: number; y: number };
  connections: number[];
  createdAt: Date;
  updatedAt: Date;
}

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
    API_KEY: string;
    FIRST_VISIT: string;
  };
}
