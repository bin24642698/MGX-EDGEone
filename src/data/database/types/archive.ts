/**
 * 档案馆类型定义
 */

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
