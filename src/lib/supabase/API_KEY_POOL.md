# API Key池功能说明

烛光写作应用使用API Key池功能来管理和分配API Key给用户，确保API资源的合理使用和分配。

## 功能特点

1. **自动分配**: 系统会自动为用户分配API Key，用户无需手动设置
2. **使用限制**: 每个API Key有每日使用配额，超过配额会自动更换Key
3. **持续分配**: 用户使用过的API Key会持续分配给该用户，不会释放给其他用户
4. **部分重置**: 只有未使用的API Key分配会在每天凌晨重置，已使用的会保持分配
5. **查看权限**: 用户只能查看API Key池，无法修改，确保安全性

## 数据表结构

### api_key_pool 表

存储所有可用的API Key：

- `id`: 主键
- `key`: API Key
- `is_active`: 是否激活
- `daily_quota`: 每日配额
- `created_at`: 创建时间
- `updated_at`: 更新时间

### user_api_key_assignments 表

记录用户与API Key的分配关系：

- `id`: 主键
- `user_id`: 用户ID
- `key_id`: API Key ID
- `usage_count`: 使用次数
- `last_used`: 最后使用时间
- `assigned_at`: 分配时间
- `expires_at`: 过期时间
- `is_used`: 是否已使用（用于决定是否重新分配）

## 管理API Key池

可以使用 `src/scripts/manage-api-key-pool.js` 脚本管理API Key池：

```bash
# 添加新的API Key
node src/scripts/manage-api-key-pool.js add "sk-1234567890" 100

# 列出所有API Key
node src/scripts/manage-api-key-pool.js list

# 激活API Key
node src/scripts/manage-api-key-pool.js activate 1

# 禁用API Key
node src/scripts/manage-api-key-pool.js deactivate 1

# 删除API Key
node src/scripts/manage-api-key-pool.js delete 1

# 重置所有用户的API Key分配
node src/scripts/manage-api-key-pool.js reset
```

## 安全性考虑

1. **行级安全策略**: 使用Supabase的RLS策略确保用户只能查看API Key池，无法修改
2. **密钥掩码**: 在UI中显示API Key时会进行掩码处理，只显示前8位和后8位
3. **服务端函数**: 关键操作通过服务端函数执行，确保安全性

## 使用流程

1. 用户首次使用AI功能时，系统会自动分配一个API Key
2. 每次使用AI功能，系统会记录使用次数并标记该Key为已使用
3. 如果使用次数超过配额，系统会自动分配新的API Key
4. 在每天凌晨：
   - 未使用的API Key分配会被释放
   - 已使用的API Key分配会被保留，继续分配给同一用户
5. 当用户再次使用AI功能时：
   - 优先使用之前已分配且使用过的API Key
   - 如果没有可用的已使用Key，则分配使用量最少的Key

## 查看当前分配

用户可以在 `/api-keys` 页面查看当前的API Key分配情况，包括：

- 当前分配的API Key
- 使用情况和配额
- 过期时间和剩余时间
- API Key使用历史记录
- API Key池中的所有Key（掩码显示）
