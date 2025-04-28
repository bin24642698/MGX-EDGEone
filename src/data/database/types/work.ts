/**
 * 作品类型定义
 */

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

// 作品类型常量
export const WORK_TYPES = {
  NOVEL: 'novel',
  CHARACTER: 'character',
  WORLDBUILDING: 'worldbuilding',
  PLOT: 'plot'
} as const;

// 作品类型标签
export const WORK_TYPE_LABELS = {
  [WORK_TYPES.NOVEL]: '小说',
  [WORK_TYPES.CHARACTER]: '角色',
  [WORK_TYPES.WORLDBUILDING]: '世界观',
  [WORK_TYPES.PLOT]: '情节'
} as const;
