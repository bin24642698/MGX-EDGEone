/**
 * 待办事项类型定义
 */

// 待办事项类型
export interface Todo {
  id?: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}
