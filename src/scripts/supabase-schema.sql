-- 作品表
CREATE TABLE public.works (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  content TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 提示词表
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  examples JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 档案馆表
CREATE TABLE public.archives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  work_id TEXT,
  tags JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设置表
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  value TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(key, user_id)
);

-- 创意地图表
CREATE TABLE public.creative_map_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_map_items ENABLE ROW LEVEL SECURITY;

-- 创建行级安全策略
-- 作品表策略
CREATE POLICY "Users can only access their own works" 
ON public.works 
FOR ALL 
USING (auth.uid() = user_id);

-- 提示词表策略
CREATE POLICY "Users can only access their own prompts" 
ON public.prompts 
FOR ALL 
USING (auth.uid() = user_id);

-- 档案馆表策略
CREATE POLICY "Users can only access their own archives" 
ON public.archives 
FOR ALL 
USING (auth.uid() = user_id);

-- 设置表策略
CREATE POLICY "Users can only access their own settings" 
ON public.settings 
FOR ALL 
USING (auth.uid() = user_id);

-- 创意地图表策略
CREATE POLICY "Users can only access their own creative map items" 
ON public.creative_map_items 
FOR ALL 
USING (auth.uid() = user_id);
