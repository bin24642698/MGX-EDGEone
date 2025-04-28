/**
 * 用户提示词选择类型定义
 */

// 用户提示词选择类型
export interface UserPromptSelection {
  id?: number;
  userId: string;
  promptId: number;
  createdAt: Date;
}
