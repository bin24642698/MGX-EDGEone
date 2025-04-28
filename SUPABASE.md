# Supabase 集成指南

本文档提供了如何在烛光写作项目中配置和使用 Supabase 的指南。

## 配置步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com/) 并注册/登录
2. 创建一个新项目
3. 记下项目的 URL 和 API Key（anon key）

### 2. 配置环境变量

1. 在项目根目录创建 `.env.local` 文件（或复制 `.env.example` 并重命名）
2. 填入 Supabase 的 URL 和 API Key：

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. 启用身份验证

1. 在 Supabase 控制台中，进入 "Authentication" 部分
2. 在 "Providers" 选项卡中，确保 "Email" 提供商已启用
3. 根据需要配置其他身份验证提供商（如 Google、GitHub 等）

## 使用方法

### 用户认证

项目已集成 Supabase 的身份验证功能，可以通过以下方式使用：

```typescript
import { useAuth } from '@/hooks/useAuth';

// 在组件中使用
const { user, isAuthenticated, signIn, signUp, signOut } = useAuth();

// 登录
await signIn(email, password);

// 注册
await signUp(email, password);

// 登出
await signOut();
```

### 保护路由

使用 `ProtectedRoute` 组件保护需要登录才能访问的页面：

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>这是一个受保护的页面，只有登录用户才能访问</div>
    </ProtectedRoute>
  );
}
```

## 数据模型

### 用户表

Supabase 自动创建和管理用户表（`auth.users`），包含以下字段：

- `id`: 用户唯一标识符
- `email`: 用户邮箱
- `created_at`: 创建时间
- `last_sign_in_at`: 最后登录时间
- `user_metadata`: 用户元数据，可以存储自定义信息

### 自定义表

可以根据需要创建自定义表，并与用户关联：

```sql
CREATE TABLE public.works (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加行级安全策略
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;

-- 只允许用户访问自己的数据
CREATE POLICY "Users can only access their own works"
ON public.works
FOR ALL
USING (auth.uid() = user_id);
```

## 数据迁移

从 IndexedDB 迁移到 Supabase 的步骤：

1. 导出 IndexedDB 中的数据
2. 创建 Supabase 表结构
3. 导入数据到 Supabase
4. 更新应用程序代码，使用 Supabase 客户端

## 故障排除

- **认证失败**：检查 API Key 是否正确
- **跨域问题**：确保 Supabase 项目的 CORS 设置允许你的应用域名
- **数据访问权限**：检查行级安全策略（RLS）配置
