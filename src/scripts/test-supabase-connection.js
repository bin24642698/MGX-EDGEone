/**
 * 测试Supabase连接
 * 
 * 使用方法：
 * 1. 在终端中运行 `node src/scripts/test-supabase-connection.js`
 * 2. 查看输出结果
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // 测试连接
    const { data, error } = await supabase.from('prompts').select('count(*)');
    
    if (error) throw error;
    
    console.log('Connection successful!');
    console.log('Prompts count:', data[0].count);
    
    // 测试认证
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('Not authenticated. This is expected if you are not logged in.');
    } else if (authData.session) {
      console.log('Authenticated as:', authData.session.user.email);
    } else {
      console.log('No active session found.');
    }
    
  } catch (error) {
    console.error('Connection failed:', error.message);
    if (error.code === 'PGRST301') {
      console.error('Unauthorized: Make sure your Supabase key has the correct permissions.');
    } else if (error.code === '42P01') {
      console.error('Table "prompts" does not exist. You need to run the SQL script to create it.');
    }
  }
}

testConnection();
