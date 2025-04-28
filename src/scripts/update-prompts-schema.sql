-- 更新提示词表，添加is_public字段
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- 更新RLS策略
-- 删除旧的策略
DROP POLICY IF EXISTS "用户可以查看自己的提示词" ON prompts;

-- 创建新的策略：用户可以查看自己的提示词或公开的提示词
CREATE POLICY "用户可以查看自己的提示词或公开的提示词" ON prompts
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

-- 其他策略保持不变，用户只能修改自己的提示词
