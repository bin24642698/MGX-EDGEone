/**
 * 数据模块测试
 * 本文件用于测试数据模块是否正常工作
 *
 * 使用方法：
 * 1. 在浏览器控制台中导入本文件：import * as dataTest from '@/data/test';
 * 2. 调用测试函数：dataTest.testWorks();
 */

// 导入数据库操作
import {
  // 作品相关
  addWork, getAllWorks, getWorkById, updateWork, deleteWork,

  // 提示词相关
  addPrompt, getAllPrompts, getPromptsByType, getPromptById, updatePrompt, deletePrompt,

  // 档案馆相关
  addArchive, getAllArchives, getArchivesByCategory, getArchivesByWorkId, getArchiveById, updateArchive, deleteArchive,

  // 设置相关
  isFirstVisit, markVisited, settings,

  // 创意地图相关
  addCreativeMapItem, getAllCreativeMapItems, getCreativeMapItemsByType, getCreativeMapItemById, updateCreativeMapItem, deleteCreativeMapItem
} from './database/repositories';

// 测试作品操作
export async function testWorks() {
  console.log('测试作品操作...');

  // 获取所有作品
  const works = await getAllWorks();
  console.log('所有作品:', works);

  // 添加作品
  const newWork = await addWork({
    title: '测试作品',
    description: '这是一个测试作品',
    type: 'novel',
    content: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log('新添加的作品:', newWork);

  // 获取作品详情
  const work = await getWorkById(newWork.id!);
  console.log('作品详情:', work);

  // 更新作品
  if (work) {
    const updatedWork = await updateWork({
      ...work,
      title: '更新后的测试作品',
      updatedAt: new Date()
    });
    console.log('更新后的作品:', updatedWork);
  }

  // 删除作品
  await deleteWork(newWork.id!);
  console.log('作品已删除');

  // 再次获取所有作品
  const worksAfterDelete = await getAllWorks();
  console.log('删除后的所有作品:', worksAfterDelete);

  console.log('作品操作测试完成');
}

// 测试提示词操作
export async function testPrompts() {
  console.log('测试提示词操作...');

  // 获取所有提示词
  const prompts = await getAllPrompts();
  console.log('所有提示词:', prompts);

  // 添加提示词
  const newPrompt = await addPrompt({
    title: '测试提示词',
    type: 'ai_writing',
    content: '这是一个测试提示词',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log('新添加的提示词:', newPrompt);

  // 获取提示词详情
  const prompt = await getPromptById(newPrompt.id!);
  console.log('提示词详情:', prompt);

  // 更新提示词
  if (prompt) {
    const updatedPrompt = await updatePrompt({
      ...prompt,
      title: '更新后的测试提示词',
      updatedAt: new Date()
    });
    console.log('更新后的提示词:', updatedPrompt);
  }

  // 删除提示词
  await deletePrompt(newPrompt.id!);
  console.log('提示词已删除');

  console.log('提示词操作测试完成');
}

// 测试设置操作
export async function testSettings() {
  console.log('测试设置操作...');

  // 保存设置
  await settings.set('testKey', 'testValue');
  console.log('设置已保存');

  // 获取设置
  const value = await settings.get('testKey', '');
  console.log('设置值:', value);

  // 删除设置
  await settings.remove('testKey');
  console.log('设置已删除');

  console.log('设置操作测试完成');
}

// 运行所有测试
export async function runAllTests() {
  console.log('开始测试数据模块...');

  await testWorks();
  await testPrompts();
  await testSettings();

  console.log('数据模块测试完成');
}
