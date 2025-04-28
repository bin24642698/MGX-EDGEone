/**
 * 数据迁移脚本
 * 将 IndexedDB 数据迁移到 Supabase
 * 
 * 使用方法：
 * 1. 确保已配置 Supabase 环境变量
 * 2. 在浏览器控制台中导入本文件：import * as migration from '@/scripts/migrateToSupabase';
 * 3. 调用迁移函数：migration.migrateAll();
 */

import { supabase } from '@/lib/supabase';
import { 
  getAllWorks, 
  getAllPrompts, 
  getAllArchives,
  getApiKey
} from '@/data';
import { User } from '@/data/database/types/user';

/**
 * 迁移作品数据
 * @param userId 用户ID
 */
export const migrateWorks = async (userId: string) => {
  try {
    console.log('开始迁移作品数据...');
    
    // 获取所有作品
    const works = await getAllWorks();
    
    // 迁移每个作品
    for (const work of works) {
      const { error } = await supabase
        .from('works')
        .insert({
          id: work.id?.toString(),
          title: work.title,
          description: work.description,
          type: work.type,
          content: work.content,
          user_id: userId,
          created_at: work.createdAt,
          updated_at: work.updatedAt
        });
      
      if (error) {
        console.error(`迁移作品 ${work.title} 失败:`, error);
      } else {
        console.log(`作品 ${work.title} 迁移成功`);
      }
    }
    
    console.log(`共迁移 ${works.length} 个作品`);
  } catch (error) {
    console.error('迁移作品数据失败:', error);
  }
};

/**
 * 迁移提示词数据
 * @param userId 用户ID
 */
export const migratePrompts = async (userId: string) => {
  try {
    console.log('开始迁移提示词数据...');
    
    // 获取所有提示词
    const prompts = await getAllPrompts();
    
    // 迁移每个提示词
    for (const prompt of prompts) {
      const { error } = await supabase
        .from('prompts')
        .insert({
          id: prompt.id?.toString(),
          title: prompt.title,
          type: prompt.type,
          content: prompt.content,
          description: prompt.description || '',
          examples: prompt.examples || [],
          user_id: userId,
          created_at: prompt.createdAt,
          updated_at: prompt.updatedAt
        });
      
      if (error) {
        console.error(`迁移提示词 ${prompt.title} 失败:`, error);
      } else {
        console.log(`提示词 ${prompt.title} 迁移成功`);
      }
    }
    
    console.log(`共迁移 ${prompts.length} 个提示词`);
  } catch (error) {
    console.error('迁移提示词数据失败:', error);
  }
};

/**
 * 迁移档案馆数据
 * @param userId 用户ID
 */
export const migrateArchives = async (userId: string) => {
  try {
    console.log('开始迁移档案馆数据...');
    
    // 获取所有档案
    const archives = await getAllArchives();
    
    // 迁移每个档案
    for (const archive of archives) {
      const { error } = await supabase
        .from('archives')
        .insert({
          id: archive.id?.toString(),
          title: archive.title,
          content: archive.content,
          category: archive.category,
          work_id: archive.workId.toString(),
          tags: archive.tags || [],
          user_id: userId,
          created_at: archive.createdAt,
          updated_at: archive.updatedAt
        });
      
      if (error) {
        console.error(`迁移档案 ${archive.title} 失败:`, error);
      } else {
        console.log(`档案 ${archive.title} 迁移成功`);
      }
    }
    
    console.log(`共迁移 ${archives.length} 个档案`);
  } catch (error) {
    console.error('迁移档案馆数据失败:', error);
  }
};

/**
 * 迁移API密钥
 * @param userId 用户ID
 */
export const migrateApiKey = async (userId: string) => {
  try {
    console.log('开始迁移API密钥...');
    
    // 获取API密钥
    const apiKey = await getApiKey();
    
    if (apiKey) {
      const { error } = await supabase
        .from('settings')
        .insert({
          key: 'api_key',
          value: apiKey,
          user_id: userId
        });
      
      if (error) {
        console.error('迁移API密钥失败:', error);
      } else {
        console.log('API密钥迁移成功');
      }
    } else {
      console.log('没有找到API密钥，跳过迁移');
    }
  } catch (error) {
    console.error('迁移API密钥失败:', error);
  }
};

/**
 * 迁移所有数据
 */
export const migrateAll = async () => {
  try {
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('未登录，请先登录再迁移数据');
      return;
    }
    
    console.log('开始迁移所有数据...');
    
    // 迁移各类数据
    await migrateWorks(user.id);
    await migratePrompts(user.id);
    await migrateArchives(user.id);
    await migrateApiKey(user.id);
    
    console.log('所有数据迁移完成');
  } catch (error) {
    console.error('迁移数据失败:', error);
  }
};
