-- API Key池表
CREATE TABLE api_key_pool (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  daily_quota INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户API Key分配表
CREATE TABLE user_api_key_assignments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_id INTEGER REFERENCES api_key_pool(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 day'),
  is_used BOOLEAN DEFAULT FALSE
);

-- 创建索引
CREATE INDEX idx_user_api_key_assignments_user_id ON user_api_key_assignments(user_id);
CREATE INDEX idx_user_api_key_assignments_key_id ON user_api_key_assignments(key_id);
CREATE INDEX idx_user_api_key_assignments_expires_at ON user_api_key_assignments(expires_at);

-- 创建RLS策略
-- API Key池表的RLS策略
ALTER TABLE api_key_pool ENABLE ROW LEVEL SECURITY;

-- 所有用户只能查看API Key池
CREATE POLICY "Users can view api_key_pool"
  ON api_key_pool FOR SELECT
  USING (auth.role() = 'authenticated');

-- 只有管理员可以修改API Key池
CREATE POLICY "Only admins can insert api_key_pool"
  ON api_key_pool FOR INSERT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Only admins can update api_key_pool"
  ON api_key_pool FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Only admins can delete api_key_pool"
  ON api_key_pool FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- 用户API Key分配表的RLS策略
ALTER TABLE user_api_key_assignments ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的API Key分配
CREATE POLICY "Users can view their own api_key_assignments"
  ON user_api_key_assignments FOR SELECT
  USING (auth.uid() = user_id);

-- 服务函数可以管理所有用户的API Key分配
CREATE POLICY "Service can manage all api_key_assignments"
  ON user_api_key_assignments
  USING (auth.uid() IN (SELECT user_id FROM service_roles));

-- 创建函数：获取用户API Key
CREATE OR REPLACE FUNCTION get_user_api_key(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key TEXT;
  v_key_id INTEGER;
  v_assignment_id INTEGER;
  v_usage_count INTEGER;
  v_daily_quota INTEGER;
BEGIN
  -- 检查用户是否已分配key且未过期
  SELECT a.id, a.key_id, a.usage_count, p.daily_quota, p.key
  INTO v_assignment_id, v_key_id, v_usage_count, v_daily_quota, v_key
  FROM user_api_key_assignments a
  JOIN api_key_pool p ON a.key_id = p.id
  WHERE a.user_id = p_user_id
    AND a.expires_at > NOW()
    AND p.is_active = TRUE;

  -- 如果已分配key且未超额
  IF v_assignment_id IS NOT NULL AND v_usage_count < v_daily_quota THEN
    RETURN v_key;
  END IF;

  -- 如果未分配key或已超额，分配新key
  -- 首先查找该用户之前使用过的key
  SELECT p.id, p.key
  INTO v_key_id, v_key
  FROM api_key_pool p
  JOIN user_api_key_assignments a ON p.id = a.key_id
  WHERE p.is_active = TRUE
    AND a.user_id = p_user_id
    AND a.is_used = TRUE
    AND a.expires_at > NOW()
  ORDER BY a.last_used DESC
  LIMIT 1;

  -- 如果没有找到之前使用过的key，则查找从未被任何用户使用过的key
  IF v_key_id IS NULL THEN
    SELECT p.id, p.key
    INTO v_key_id, v_key
    FROM api_key_pool p
    WHERE p.is_active = TRUE
      AND NOT EXISTS (
        SELECT 1
        FROM user_api_key_assignments a
        WHERE a.key_id = p.id
      )
    LIMIT 1;
  END IF;

  -- 如果仍然没有找到key，则查找前一天没有被使用而被释放重置的key
  IF v_key_id IS NULL THEN
    SELECT p.id, p.key
    INTO v_key_id, v_key
    FROM api_key_pool p
    WHERE p.is_active = TRUE
      AND NOT EXISTS (
        SELECT 1
        FROM user_api_key_assignments a
        WHERE a.key_id = p.id
          AND a.expires_at > NOW()
      )
    LIMIT 1;
  END IF;

  -- 如果没有找到未使用的key，则不分配新key（返回NULL）
  IF v_key_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- 如果已有分配但超额，删除旧分配
  IF v_assignment_id IS NOT NULL THEN
    DELETE FROM user_api_key_assignments WHERE id = v_assignment_id;
  END IF;

  -- 创建新分配
  INSERT INTO user_api_key_assignments (user_id, key_id, usage_count, last_used, assigned_at, expires_at)
  VALUES (p_user_id, v_key_id, 0, NULL, NOW(), NOW() + INTERVAL '1 day');

  RETURN v_key;
END;
$$;

-- 创建函数：增加key使用次数
CREATE OR REPLACE FUNCTION increment_key_usage(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assignment_id INTEGER;
  v_usage_count INTEGER;
  v_daily_quota INTEGER;
BEGIN
  -- 获取用户当前的key分配
  SELECT a.id, a.usage_count, p.daily_quota
  INTO v_assignment_id, v_usage_count, v_daily_quota
  FROM user_api_key_assignments a
  JOIN api_key_pool p ON a.key_id = p.id
  WHERE a.user_id = p_user_id
    AND a.expires_at > NOW()
    AND p.is_active = TRUE;

  -- 如果没有分配，返回失败
  IF v_assignment_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 增加使用次数并标记为已使用
  UPDATE user_api_key_assignments
  SET usage_count = usage_count + 1,
      last_used = NOW(),
      is_used = TRUE
  WHERE id = v_assignment_id;

  -- 检查是否超额
  RETURN (v_usage_count + 1) < v_daily_quota;
END;
$$;

-- 创建函数：重置每日分配
CREATE OR REPLACE FUNCTION reset_daily_assignments()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 只删除未使用且已过期的分配
  DELETE FROM user_api_key_assignments
  WHERE expires_at <= NOW() AND is_used = FALSE;

  -- 更新已使用的分配的过期时间，延长一天
  UPDATE user_api_key_assignments
  SET expires_at = NOW() + INTERVAL '1 day'
  WHERE expires_at <= NOW() AND is_used = TRUE;
END;
$$;

-- 创建定时任务：每天凌晨重置分配
SELECT cron.schedule(
  'reset-api-key-assignments',
  '0 0 * * *',  -- 每天凌晨执行
  $$
    SELECT reset_daily_assignments();
  $$
);
