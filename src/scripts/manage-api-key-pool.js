/**
 * API Key池管理脚本
 *
 * 使用方法：
 * 1. 在终端中运行 `node src/scripts/manage-api-key-pool.js <command> [options]`
 * 2. 可用命令:
 *    - add <key> <quota>: 添加新的API Key到池中
 *    - list: 列出所有API Key
 *    - activate <id>: 激活API Key
 *    - deactivate <id>: 禁用API Key
 *    - delete <id>: 删除API Key
 *    - reset: 重置所有用户的API Key分配
 *    - assignments: 列出所有用户的API Key分配
 *    - user-assignments <user_id>: 列出指定用户的API Key分配
 *
 * 示例:
 *    node src/scripts/manage-api-key-pool.js add "sk-1234567890" 100
 *    node src/scripts/manage-api-key-pool.js list
 *    node src/scripts/manage-api-key-pool.js activate 1
 *    node src/scripts/manage-api-key-pool.js deactivate 1
 *    node src/scripts/manage-api-key-pool.js delete 1
 *    node src/scripts/manage-api-key-pool.js reset
 *    node src/scripts/manage-api-key-pool.js assignments
 *    node src/scripts/manage-api-key-pool.js user-assignments "user-uuid"
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

// 获取命令行参数
const args = process.argv.slice(2);
const command = args[0];

// 执行命令
async function executeCommand() {
  try {
    switch (command) {
      case 'add':
        await addApiKey(args[1], parseInt(args[2]));
        break;
      case 'list':
        await listApiKeys();
        break;
      case 'activate':
        await activateApiKey(parseInt(args[1]));
        break;
      case 'deactivate':
        await deactivateApiKey(parseInt(args[1]));
        break;
      case 'delete':
        await deleteApiKey(parseInt(args[1]));
        break;
      case 'reset':
        await resetAssignments();
        break;
      case 'assignments':
        await listAssignments();
        break;
      case 'user-assignments':
        await listUserAssignments(args[1]);
        break;
      default:
        console.log('Unknown command. Available commands: add, list, activate, deactivate, delete, reset, assignments, user-assignments');
    }
  } catch (error) {
    console.error('Error executing command:', error.message);
  }
}

// 添加API Key
async function addApiKey(key, quota) {
  if (!key) {
    console.error('API Key is required');
    return;
  }

  if (!quota || isNaN(quota)) {
    quota = 100; // 默认配额
  }

  const { data, error } = await supabase
    .from('api_key_pool')
    .insert([
      { key, daily_quota: quota }
    ])
    .select();

  if (error) {
    console.error('Error adding API Key:', error);
    return;
  }

  console.log('API Key added successfully:', data[0]);
}

// 列出所有API Key
async function listApiKeys() {
  const { data, error } = await supabase
    .from('api_key_pool')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error listing API Keys:', error);
    return;
  }

  if (data.length === 0) {
    console.log('No API Keys found');
    return;
  }

  console.log('API Keys:');
  data.forEach(key => {
    const maskedKey = `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 8)}`;
    console.log(`ID: ${key.id}, Key: ${maskedKey}, Active: ${key.is_active}, Quota: ${key.daily_quota}, Created: ${key.created_at}`);
  });
}

// 激活API Key
async function activateApiKey(id) {
  if (!id || isNaN(id)) {
    console.error('Valid API Key ID is required');
    return;
  }

  const { data, error } = await supabase
    .from('api_key_pool')
    .update({ is_active: true })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error activating API Key:', error);
    return;
  }

  if (data.length === 0) {
    console.log(`No API Key found with ID ${id}`);
    return;
  }

  console.log(`API Key ${id} activated successfully`);
}

// 禁用API Key
async function deactivateApiKey(id) {
  if (!id || isNaN(id)) {
    console.error('Valid API Key ID is required');
    return;
  }

  const { data, error } = await supabase
    .from('api_key_pool')
    .update({ is_active: false })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error deactivating API Key:', error);
    return;
  }

  if (data.length === 0) {
    console.log(`No API Key found with ID ${id}`);
    return;
  }

  console.log(`API Key ${id} deactivated successfully`);
}

// 删除API Key
async function deleteApiKey(id) {
  if (!id || isNaN(id)) {
    console.error('Valid API Key ID is required');
    return;
  }

  const { error } = await supabase
    .from('api_key_pool')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting API Key:', error);
    return;
  }

  console.log(`API Key ${id} deleted successfully`);
}

// 重置所有用户的API Key分配
async function resetAssignments() {
  const { error } = await supabase.rpc('reset_daily_assignments');

  if (error) {
    console.error('Error resetting assignments:', error);
    return;
  }

  console.log('All user API Key assignments have been reset');
}

// 列出所有用户的API Key分配
async function listAssignments() {
  const { data, error } = await supabase
    .from('user_api_key_assignments')
    .select(`
      id,
      user_id,
      key_id,
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
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error listing assignments:', error);
    return;
  }

  if (data.length === 0) {
    console.log('No assignments found');
    return;
  }

  console.log(`Found ${data.length} assignments:`);
  data.forEach(assignment => {
    const maskedKey = assignment.api_key_pool.key ?
      `${assignment.api_key_pool.key.substring(0, 8)}...${assignment.api_key_pool.key.substring(assignment.api_key_pool.key.length - 8)}` :
      'N/A';

    console.log(`
Assignment ID: ${assignment.id}
User ID: ${assignment.user_id}
Key ID: ${assignment.key_id} (${maskedKey})
Usage: ${assignment.usage_count}/${assignment.api_key_pool.daily_quota}
Is Used: ${assignment.is_used}
Last Used: ${assignment.last_used || 'Never'}
Assigned At: ${assignment.assigned_at}
Expires At: ${assignment.expires_at}
------------------------------------`);
  });
}

// 列出指定用户的API Key分配
async function listUserAssignments(userId) {
  if (!userId) {
    console.error('User ID is required');
    return;
  }

  const { data, error } = await supabase
    .from('user_api_key_assignments')
    .select(`
      id,
      user_id,
      key_id,
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
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error listing user assignments:', error);
    return;
  }

  if (data.length === 0) {
    console.log(`No assignments found for user ${userId}`);
    return;
  }

  console.log(`Found ${data.length} assignments for user ${userId}:`);
  data.forEach(assignment => {
    const maskedKey = assignment.api_key_pool.key ?
      `${assignment.api_key_pool.key.substring(0, 8)}...${assignment.api_key_pool.key.substring(assignment.api_key_pool.key.length - 8)}` :
      'N/A';

    console.log(`
Assignment ID: ${assignment.id}
Key ID: ${assignment.key_id} (${maskedKey})
Usage: ${assignment.usage_count}/${assignment.api_key_pool.daily_quota}
Is Used: ${assignment.is_used}
Last Used: ${assignment.last_used || 'Never'}
Assigned At: ${assignment.assigned_at}
Expires At: ${assignment.expires_at}
Status: ${new Date(assignment.expires_at) > new Date() ? 'Active' : 'Expired'}
------------------------------------`);
  });
}

// 执行命令
executeCommand();
