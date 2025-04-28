/**
 * 测试提示词CRUD操作
 * 
 * 使用方法：
 * 1. 在终端中运行 `node src/scripts/test-prompts-crud.js`
 * 2. 查看输出结果
 * 
 * 注意：需要先登录Supabase账户才能运行此脚本
 */

const { createClient } = require('@supabase/supabase-js');
const CryptoJS = require('crypto-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const encryptionSalt = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || 'zhuguang_encryption_salt_2024';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 加密函数
const encryptText = (text, userId) => {
  const key = CryptoJS.PBKDF2(userId, encryptionSalt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
  
  return CryptoJS.AES.encrypt(text, key).toString();
};

// 解密函数
const decryptText = (encryptedText, userId) => {
  const key = CryptoJS.PBKDF2(userId, encryptionSalt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
  
  const bytes = CryptoJS.AES.decrypt(encryptedText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

async function testPromptsCRUD() {
  console.log('Testing prompts CRUD operations...');
  
  try {
    // 获取当前用户
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    
    if (!session) {
      console.error('No active session. Please login first.');
      console.log('You can login using the Supabase CLI or through the application.');
      process.exit(1);
    }
    
    const userId = session.user.id;
    console.log('Logged in as user:', session.user.email);
    
    // 创建提示词
    const promptContent = '这是一个测试提示词，包含一些指令和说明。AI应该按照这些指令行动。';
    const encryptedContent = encryptText(promptContent, userId);
    
    console.log('Original content:', promptContent);
    console.log('Encrypted content:', encryptedContent);
    
    const { data: createData, error: createError } = await supabase
      .from('prompts')
      .insert([{
        title: '测试提示词',
        type: 'ai_writing',
        content: encryptedContent,
        description: '这是一个用于测试的提示词',
        user_id: userId
      }])
      .select();
    
    if (createError) throw createError;
    
    console.log('Created prompt:', createData[0].id);
    
    // 读取提示词
    const { data: readData, error: readError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', createData[0].id)
      .single();
    
    if (readError) throw readError;
    
    console.log('Read prompt:', readData.title);
    
    // 解密内容
    const decryptedContent = decryptText(readData.content, userId);
    console.log('Decrypted content:', decryptedContent);
    console.log('Content matches:', decryptedContent === promptContent);
    
    // 更新提示词
    const { data: updateData, error: updateError } = await supabase
      .from('prompts')
      .update({ title: '更新后的测试提示词' })
      .eq('id', createData[0].id)
      .select();
    
    if (updateError) throw updateError;
    
    console.log('Updated prompt:', updateData[0].title);
    
    // 删除提示词
    const { error: deleteError } = await supabase
      .from('prompts')
      .delete()
      .eq('id', createData[0].id);
    
    if (deleteError) throw deleteError;
    
    console.log('Deleted prompt successfully');
    
    console.log('All CRUD operations completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.code === 'PGRST301') {
      console.error('Unauthorized: Make sure your Supabase key has the correct permissions.');
    } else if (error.code === '42P01') {
      console.error('Table "prompts" does not exist. You need to run the SQL script to create it.');
    }
  }
}

testPromptsCRUD();
