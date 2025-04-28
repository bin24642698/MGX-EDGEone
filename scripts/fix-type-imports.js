/**
 * 修复类型导入路径脚本
 * 
 * 本脚本用于将项目中的类型导入路径从旧的数据库路径更新为新的数据路径
 * 例如：将 import { Archive } from '@/data/database/types'; 更新为 import { Archive } from '@/data';
 * 
 * 使用方法：
 * 1. 安装依赖：npm install glob fs-extra
 * 2. 运行脚本：node scripts/fix-type-imports.js
 */

const { glob } = require('glob');
const fs = require('fs-extra');
const path = require('path');

// 要搜索的文件模式
const filePattern = 'src/**/*.{ts,tsx}';

// 要替换的导入路径模式
const importPattern = /@\/data\/database\/types/g;
const newImportPath = '@/data';

// 获取所有匹配的文件
async function fixTypeImports() {
  try {
    const files = await glob(filePattern);
    console.log(`Found ${files.length} files to process`);

    let fixedCount = 0;

    // 处理每个文件
    for (const file of files) {
      try {
        // 读取文件内容
        const content = fs.readFileSync(file, 'utf8');
        
        // 应用替换模式
        const newContent = content.replace(importPattern, newImportPath);
        
        // 如果有变更，写入文件
        if (newContent !== content) {
          fs.writeFileSync(file, newContent, 'utf8');
          console.log(`Updated imports in ${file}`);
          fixedCount++;
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }

    console.log(`Fixed imports in ${fixedCount} files`);
    console.log('Import paths update completed');
  } catch (err) {
    console.error('Error finding files:', err);
  }
}

fixTypeImports();
