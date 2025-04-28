/**
 * API Key池服务
 * 管理API Key的分配和使用
 */
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase';

/**
 * 获取用户的API Key
 * @returns API Key或null
 */
export const getUserApiKey = async (): Promise<string | null> => {
  try {
    // 获取当前用户
    const user = await getCurrentUser();
    if (!user) {
      console.error('获取API Key失败: 用户未登录');
      return null;
    }

    // 调用Supabase函数获取用户API Key
    const { data, error } = await supabase.rpc('get_user_api_key', {
      p_user_id: user.id
    });

    if (error) {
      console.error('获取API Key失败:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('获取API Key失败:', error);
    return null;
  }
};

/**
 * 增加API Key使用次数
 * @returns 是否成功
 */
export const incrementKeyUsage = async (): Promise<boolean> => {
  try {
    // 获取当前用户
    const user = await getCurrentUser();
    if (!user) {
      console.error('增加API Key使用次数失败: 用户未登录');
      return false;
    }

    // 调用Supabase函数增加API Key使用次数
    const { data, error } = await supabase.rpc('increment_key_usage', {
      p_user_id: user.id
    });

    if (error) {
      console.error('增加API Key使用次数失败:', error);
      return false;
    }

    return data;
  } catch (error) {
    console.error('增加API Key使用次数失败:', error);
    return false;
  }
};

/**
 * 获取API Key池列表
 * @returns API Key池列表
 */
export const getApiKeyPool = async () => {
  try {
    // 获取当前用户
    const user = await getCurrentUser();
    if (!user) {
      console.error('获取API Key池失败: 用户未登录');
      return [];
    }

    // 查询API Key池
    const { data, error } = await supabase
      .from('api_key_pool')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('获取API Key池失败:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('获取API Key池失败:', error);
    return [];
  }
};

/**
 * 获取用户当前的API Key分配
 * @returns 用户当前的API Key分配
 */
export const getUserKeyAssignment = async () => {
  try {
    // 获取当前用户
    const user = await getCurrentUser();
    if (!user) {
      console.error('获取API Key分配失败: 用户未登录');
      return null;
    }

    // 查询用户当前的API Key分配
    const { data, error } = await supabase
      .from('user_api_key_assignments')
      .select(`
        id,
        usage_count,
        last_used,
        assigned_at,
        expires_at,
        is_used,
        api_key_pool (
          id,
          key,
          daily_quota
        )
      `)
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('assigned_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录，返回null
        return null;
      }
      console.error('获取API Key分配失败:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('获取API Key分配失败:', error);
    return null;
  }
};

/**
 * 获取用户的API Key使用历史
 * @returns 用户的API Key使用历史
 */
export const getUserKeyHistory = async () => {
  try {
    // 获取当前用户
    const user = await getCurrentUser();
    if (!user) {
      console.error('获取API Key使用历史失败: 用户未登录');
      return [];
    }

    // 查询用户的API Key使用历史
    const { data, error } = await supabase
      .from('user_api_key_assignments')
      .select(`
        id,
        usage_count,
        last_used,
        assigned_at,
        expires_at,
        is_used,
        api_key_pool (
          id,
          key,
          daily_quota
        )
      `)
      .eq('user_id', user.id)
      .eq('is_used', true)
      .order('last_used', { ascending: false })
      .limit(10);

    if (error) {
      console.error('获取API Key使用历史失败:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('获取API Key使用历史失败:', error);
    return [];
  }
};
