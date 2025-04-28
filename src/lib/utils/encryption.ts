/**
 * 加密工具模块
 * 使用 crypto-js 实现 AES 加密和解密
 */
import CryptoJS from 'crypto-js';

/**
 * 生成加密密钥
 * 使用用户ID和固定的盐值生成密钥
 * @param userId 用户ID
 * @returns 加密密钥
 */
export const generateEncryptionKey = (userId: string): string => {
  // 固定的盐值，可以存储在环境变量中
  const salt = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || 'zhuguang_encryption_salt';
  // 使用用户ID和盐值生成密钥
  return CryptoJS.PBKDF2(userId, salt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
};

/**
 * 加密文本
 * @param text 要加密的文本
 * @param key 加密密钥
 * @returns 加密后的文本
 */
export const encryptText = (text: string, key: string): string => {
  try {
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch (error) {
    console.error('加密失败:', error);
    throw new Error('加密失败');
  }
};

/**
 * 解密文本
 * @param encryptedText 加密的文本
 * @param key 解密密钥
 * @returns 解密后的文本
 */
export const decryptText = (encryptedText: string, key: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('解密失败:', error);
    throw new Error('解密失败');
  }
};

/**
 * 检查文本是否已加密
 * 通过尝试解密来判断
 * @param text 要检查的文本
 * @param key 解密密钥
 * @returns 是否已加密
 */
export const isEncrypted = (text: string, key: string): boolean => {
  try {
    const decrypted = decryptText(text, key);
    // 如果能成功解密，说明是加密文本
    return decrypted.length > 0;
  } catch (error) {
    // 解密失败，说明不是加密文本
    return false;
  }
};
