/**
 * 测试加密和解密功能
 * 
 * 使用方法：
 * 1. 在终端中运行 `node src/scripts/test-encryption.js`
 * 2. 查看输出结果
 */

const CryptoJS = require('crypto-js');

// 模拟用户ID
const userId = '123456789';

// 模拟盐值
const salt = 'zhuguang_encryption_salt_2024';

// 生成加密密钥
const generateEncryptionKey = (userId) => {
  return CryptoJS.PBKDF2(userId, salt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
};

// 加密文本
const encryptText = (text, key) => {
  try {
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch (error) {
    console.error('加密失败:', error);
    throw new Error('加密失败');
  }
};

// 解密文本
const decryptText = (encryptedText, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('解密失败:', error);
    throw new Error('解密失败');
  }
};

// 检查文本是否已加密
const isEncrypted = (text, key) => {
  try {
    const decrypted = decryptText(text, key);
    // 如果能成功解密，说明是加密文本
    return decrypted.length > 0;
  } catch (error) {
    // 解密失败，说明不是加密文本
    return false;
  }
};

// 测试加密和解密
const testEncryption = () => {
  console.log('测试加密和解密功能');
  console.log('-------------------');

  // 生成密钥
  const key = generateEncryptionKey(userId);
  console.log('密钥:', key);

  // 测试文本
  const text = '这是一个测试文本，包含中文和English，以及特殊字符!@#$%^&*()';
  console.log('原始文本:', text);

  // 加密
  const encryptedText = encryptText(text, key);
  console.log('加密后:', encryptedText);

  // 检查是否已加密
  const encrypted = isEncrypted(encryptedText, key);
  console.log('是否已加密:', encrypted);

  // 解密
  const decryptedText = decryptText(encryptedText, key);
  console.log('解密后:', decryptedText);

  // 验证
  console.log('验证结果:', text === decryptedText ? '成功' : '失败');
};

// 运行测试
testEncryption();
