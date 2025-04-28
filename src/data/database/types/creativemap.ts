/**
 * 创意地图类型定义
 */

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

// 创意地图类型常量
export const CREATIVEMAP_TYPES = {
  INTRODUCTION: 'introduction',
  OUTLINE: 'outline',
  DETAILED_OUTLINE: 'detailed_outline',
  WORLDBUILDING: 'worldbuilding',
  CHARACTER: 'character',
  PLOT: 'plot'
} as const;

// 创意地图类型标签
export const CREATIVEMAP_TYPE_LABELS = {
  [CREATIVEMAP_TYPES.INTRODUCTION]: '导语',
  [CREATIVEMAP_TYPES.OUTLINE]: '大纲',
  [CREATIVEMAP_TYPES.DETAILED_OUTLINE]: '细纲',
  [CREATIVEMAP_TYPES.WORLDBUILDING]: '世界观',
  [CREATIVEMAP_TYPES.CHARACTER]: '角色',
  [CREATIVEMAP_TYPES.PLOT]: '情节'
} as const;
