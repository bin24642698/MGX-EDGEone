# 数据统一迁移指南

本文档提供了从旧的数据库结构迁移到新的统一数据结构的指南。

## 迁移概述

我们将数据库和数据统一存放在 `src/data` 文件夹中，以便于数据统一管理。主要变更包括：

1. 将 `src/database` 移动到 `src/data/database`
2. 更新导入路径
3. 统一数据访问接口

## 迁移步骤

### 1. 复制数据库文件

已完成：将 `src/database` 目录下的所有文件复制到 `src/data/database` 目录下，保持原有的目录结构。

### 2. 更新导入路径

需要将项目中所有导入旧数据库路径的地方更新为新的数据路径。可以使用提供的脚本自动完成：

```bash
node scripts/update-imports.js
```

或者手动更新以下导入路径：

- 将 `@/database/repositories` 更新为 `@/data`
- 将 `@/database/core` 更新为 `@/data/database/core`
- 将 `@/database/types` 更新为 `@/data/database/types`
- 将 `@/database` 更新为 `@/data/database`

### 3. 测试应用

完成导入路径更新后，需要测试应用的各项功能，确保数据访问正常工作：

- 作品管理
- 提示词管理
- 档案馆
- 设置
- 创意地图

### 4. 清理旧文件

确认应用正常工作后，可以删除旧的 `src/database` 目录。

## 新的数据访问方式

迁移完成后，可以通过以下方式访问数据：

```typescript
// 旧的导入方式
import { addWork, getAllWorks } from '@/database/repositories';

// 新的导入方式
import { addWork, getAllWorks } from '@/data';
```

## 注意事项

- 迁移过程不会影响用户的数据，所有数据仍然存储在浏览器的IndexedDB中
- 迁移只是改变了代码组织方式，不会改变数据库的结构和内容
- 如果遇到问题，可以随时回滚到旧的数据库结构
