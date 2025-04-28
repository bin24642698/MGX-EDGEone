/**
 * Supabase 配置
 */

// Supabase URL 和 API Key 应该存储在环境变量中
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
