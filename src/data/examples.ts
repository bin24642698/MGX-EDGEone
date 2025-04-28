/**
 * 数据模块使用示例
 * 本文件仅用于演示，不会在实际代码中使用
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
  getApiKey, saveApiKey, removeApiKey, isFirstVisit, markVisited, settings,
  
  // 创意地图相关
  addCreativeMapItem, getAllCreativeMapItems, getCreativeMapItemsByType, getCreativeMapItemById, updateCreativeMapItem, deleteCreativeMapItem
} from '@/data';

// 使用示例

// 作品操作示例
async function workExample() {
  // 获取所有作品
  const works = await getAllWorks();
  console.log('所有作品:', works);
  
  // 添加作品
  const newWork = await addWork({
    title: '新作品',
    description: '作品描述',
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
      title: '更新后的标题',
      updatedAt: new Date()
    });
    console.log('更新后的作品:', updatedWork);
  }
  
  // 删除作品
  await deleteWork(newWork.id!);
  console.log('作品已删除');
}

// 提示词操作示例
async function promptExample() {
  // 获取所有提示词
  const prompts = await getAllPrompts();
  console.log('所有提示词:', prompts);
  
  // 获取指定类型的提示词
  const aiWritingPrompts = await getPromptsByType('ai_writing');
  console.log('AI写作提示词:', aiWritingPrompts);
}

// 设置操作示例
async function settingsExample() {
  // 获取API密钥
  const apiKey = await getApiKey();
  console.log('API密钥:', apiKey);
  
  // 保存设置
  await settings.set('theme', 'dark');
  
  // 获取设置
  const theme = await settings.get('theme', 'light');
  console.log('主题:', theme);
}
