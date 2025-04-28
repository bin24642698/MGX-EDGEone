/**
 * 更新导入路径脚本
 *
 * 本脚本用于将项目中的导入路径从旧的数据库路径更新为新的数据路径
 * 例如：将 import { addWork } from '@/database/repositories'; 更新为 import { addWork } from '@/data';
 *
 * 使用方法：
 * 1. 安装依赖：npm install glob fs-extra
 * 2. 运行脚本：node scripts/update-imports.js
 */

const { glob } = require('glob');
const fs = require('fs-extra');
const path = require('path');

// 要搜索的文件模式
const filePattern = 'src/**/*.{ts,tsx}';

// 要替换的导入路径模式
const importPatterns = [
  {
    from: /@\/database\/repositories/g,
    to: '@/data'
  },
  {
    from: /@\/database\/core/g,
    to: '@/data/database/core'
  },
  {
    from: /@\/database\/types/g,
    to: '@/data/database/types'
  },
  {
    from: /@\/database/g,
    to: '@/data/database'
  }
];

// 获取所有匹配的文件
async function updateImports() {
  try {
    const files = await glob(filePattern);
    console.log(`Found ${files.length} files to process`);

    // 处理每个文件
    for (const file of files) {
      try {
        // 读取文件内容
        const content = fs.readFileSync(file, 'utf8');

        // 应用所有替换模式
        let newContent = content;
        let hasChanges = false;

        importPatterns.forEach(pattern => {
          const updatedContent = newContent.replace(pattern.from, pattern.to);
          if (updatedContent !== newContent) {
            hasChanges = true;
            newContent = updatedContent;
          }
        });

        // 如果有变更，写入文件
        if (hasChanges) {
          fs.writeFileSync(file, newContent, 'utf8');
          console.log(`Updated imports in ${file}`);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }

    console.log('Import paths update completed');
  } catch (err) {
    console.error('Error finding files:', err);
  }
}

updateImports();
