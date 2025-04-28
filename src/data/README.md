# 烛光写作数据模块

本目录包含烛光写作应用的所有数据相关的操作和存储。

## 目录结构

- `/database`: 数据库相关的操作和存储
  - `/core`: 数据库核心功能
  - `/repositories`: 数据仓库
  - `/types`: 数据类型定义

## 使用方法

通过统一的入口文件导入所需的功能：

```typescript
import { addWork, getAllWorks, getWorkById } from '@/data';
```

## 数据库模块

数据库模块使用IndexedDB作为本地存储方案，通过idb库实现。主要的数据库包括：

- `zhixia_writing_app`（主数据库）：存储作品、提示词、档案等
- `zhixia_settings`（设置数据库）：存储用户设置
- `zhixia_navigation`（导航数据库）：存储导航状态
- `zhixia_creativemap`（创意地图数据库）：存储创意地图数据

## 数据仓库

数据仓库提供了对各种数据类型的增删改查操作：

- `workRepository`: 作品相关操作
- `promptRepository`: 提示词相关操作
- `archiveRepository`: 档案馆相关操作
- `todoRepository`: 待办事项相关操作
- `settingsRepository`: 设置相关操作
- `creativeRepository`: 创意地图相关操作
