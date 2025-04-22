/**
 * 待办事项仓库
 */
import { Todo } from '@/types';
import { dbOperations } from '../operations';
import { DB_CONFIG } from '../config';

const { MAIN } = DB_CONFIG.NAMES;
const { TODOS } = DB_CONFIG.STORES.MAIN;

/**
 * 添加待办事项
 * @param todo 待办事项
 * @returns 添加后的待办事项
 */
export const addTodo = async (todo: Omit<Todo, 'id'>): Promise<Todo> => {
  return dbOperations.add<Todo>(MAIN, TODOS, todo);
};

/**
 * 获取所有待办事项
 * @returns 所有待办事项
 */
export const getAllTodos = async (): Promise<Todo[]> => {
  const todos = await dbOperations.getAll<Todo>(MAIN, TODOS);
  // 按创建日期排序，最新的在前面
  return todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * 根据ID获取待办事项
 * @param id 待办事项ID
 * @returns 待办事项或null
 */
export const getTodoById = async (id: number): Promise<Todo | null> => {
  const todo = await dbOperations.getById<Todo>(MAIN, TODOS, id);
  return todo || null;
};

/**
 * 更新待办事项
 * @param todo 待办事项
 * @returns 更新后的待办事项
 */
export const updateTodo = async (todo: Todo): Promise<Todo> => {
  if (!todo.id) throw new Error('Todo ID is required');
  return dbOperations.update<Todo & { id: number }>(MAIN, TODOS, todo as Todo & { id: number });
};

/**
 * 删除待办事项
 * @param id 待办事项ID
 */
export const deleteTodo = async (id: number): Promise<void> => {
  return dbOperations.remove(MAIN, TODOS, id);
};

/**
 * 清空所有待办事项
 */
export const clearAllTodos = async (): Promise<void> => {
  return dbOperations.clear(MAIN, TODOS);
};
