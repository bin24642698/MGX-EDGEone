/**
 * 测试解密提示词
 *
 * 使用方法：
 * 1. 在终端中运行 `node decrypt-test.js`
 */

const CryptoJS = require('crypto-js');

// 要解密的文本
const encryptedText = "U2FsdGVkX1/yNmjSkWjs6DhghuCQK8fkMkuZdlbJC+t0RUiL1sGI0meUH6rlb7lpI8VTCi5AqkftdgA29foWhoM8mvNXNuEqX72O/aLl5OwEU/YnI6MNuC5tVccmcGC0";

// 模拟生成加密密钥的函数
const generateEncryptionKey = (userId, salt) => {
  // 使用用户ID和盐值生成密钥
  return CryptoJS.PBKDF2(userId, salt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
};

// 解密函数
const decryptText = (encryptedText, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // 检查解密结果是否有效
    if (decrypted && decrypted.length > 0) {
      return decrypted;
    }
    return null;
  } catch (error) {
    // 解密失败，返回null
    return null;
  }
};

// 尝试使用不同的用户ID和盐值进行解密
const testDecryption = () => {
  // 可能的用户ID
  const testUserIds = [
    '123456789',
    'test_user',
    'admin',
    'user1',
    'default',
    'zhuguang',
    'candlelight',
    '1',
    'bin24642698',
    'bin',
    '24642698',
    'admin123',
    'test123',
    'user123',
    'root',
    'system',
    'mgx',
    'mgx_user',
    'mgx_admin',
    'mgx_system',
    'mgx_default',
    'mgx_root',
    'mgx_test',
    'mgx_1',
    'mgx_123',
    'mgx_admin123',
    'mgx_user123',
    'mgx_test123',
    'mgx_root123',
    'mgx_system123',
    'mgx_default123',
    'mgx_bin',
    'mgx_bin24642698',
    'mgx_24642698',
    'mgx_zhuguang',
    'mgx_candlelight',
    'zhuguang_user',
    'zhuguang_admin',
    'zhuguang_system',
    'zhuguang_default',
    'zhuguang_root',
    'zhuguang_test',
    'zhuguang_1',
    'zhuguang_123',
    'zhuguang_admin123',
    'zhuguang_user123',
    'zhuguang_test123',
    'zhuguang_root123',
    'zhuguang_system123',
    'zhuguang_default123',
    'zhuguang_bin',
    'zhuguang_bin24642698',
    'zhuguang_24642698',
    'candlelight_user',
    'candlelight_admin',
    'candlelight_system',
    'candlelight_default',
    'candlelight_root',
    'candlelight_test',
    'candlelight_1',
    'candlelight_123',
    'candlelight_admin123',
    'candlelight_user123',
    'candlelight_test123',
    'candlelight_root123',
    'candlelight_system123',
    'candlelight_default123',
    'candlelight_bin',
    'candlelight_bin24642698',
    'candlelight_24642698'
  ];

  // 可能的盐值
  const testSalts = [
    'zhuguang_encryption_salt',
    'zhuguang_encryption_salt_2024',
    'candlelight_encryption_salt',
    'encryption_salt',
    'salt',
    'default_salt',
    'zhuguang_salt',
    'candlelight_salt',
    'NEXT_PUBLIC_ENCRYPTION_SALT',
    'ENCRYPTION_SALT',
    'SECRET_KEY',
    'API_SECRET',
    'APP_SECRET',
    'SECURITY_KEY',
    'CRYPTO_KEY',
    'ENCRYPTION_KEY',
    'SALT_KEY',
    'SECURE_SALT',
    'CRYPTO_SALT',
    'APP_SALT',
    'SECURITY_SALT',
    'SECRET_SALT',
    'PRIVATE_SALT',
    'SECURE_KEY',
    'PRIVATE_KEY',
    'MGX_SALT',
    'MGX_KEY',
    'MGX_SECRET',
    'MGX_ENCRYPTION_SALT',
    'MGX_ENCRYPTION_KEY'
  ];

  console.log('尝试解密文本:', encryptedText);
  console.log('-----------------------------------');

  let successCount = 0;
  let attemptCount = 0;

  // 尝试所有用户ID和盐值的组合
  for (const userId of testUserIds) {
    for (const salt of testSalts) {
      attemptCount++;
      const key = generateEncryptionKey(userId, salt);

      try {
        const decrypted = decryptText(encryptedText, key);
        if (decrypted) {
          successCount++;
          console.log(`\n解密成功! [${successCount}]`);
          console.log(`用户ID: "${userId}"`);
          console.log(`盐值: "${salt}"`);
          console.log('解密结果:', decrypted);
          console.log('-----------------------------------');
        }
      } catch (error) {
        // 忽略错误，继续尝试
      }

      // 每10次尝试打印一次进度
      if (attemptCount % 10 === 0) {
        process.stdout.write(`已尝试 ${attemptCount} 种组合...\r`);
      }
    }
  }

  console.log(`\n尝试完成，共尝试了 ${attemptCount} 种组合，成功 ${successCount} 次。`);

  if (successCount === 0) {
    console.log('所有尝试都失败了。请提供正确的用户ID或密钥。');
  }
};

// 尝试直接使用密钥解密
const tryDirectDecryption = () => {
  console.log('尝试直接使用密钥解密...');

  // 一些可能的密钥
  const possibleKeys = [
    'password',
    '123456',
    'admin',
    'zhuguang',
    'candlelight',
    'secret',
    'key',
    'encryption',
    'default'
  ];

  for (const key of possibleKeys) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8);
      if (decrypted && decrypted.length > 0) {
        console.log('直接解密成功!');
        console.log(`密钥: "${key}"`);
        console.log('解密结果:', decrypted);
        return true;
      }
    } catch (error) {
      // 忽略错误，继续尝试
    }
  }

  console.log('直接解密尝试失败。');
  return false;
};

// 尝试使用不同的解密方法
const tryAlternativeDecryption = () => {
  console.log('尝试使用替代解密方法...');

  try {
    // 尝试使用Base64解码
    const base64Decoded = Buffer.from(encryptedText, 'base64').toString('utf-8');
    console.log('Base64解码结果:', base64Decoded);
  } catch (error) {
    console.log('Base64解码失败:', error.message);
  }
};

// 使用指定的UUID尝试解密
const tryWithUUID = () => {
  const uuid = '8de17595-9a40-4aa7-a46e-f23e2051bfa3';
  console.log(`尝试使用UUID "${uuid}" 作为用户ID解密...`);

  // 尝试不同的盐值
  const salts = [
    'zhuguang_encryption_salt',
    'zhuguang_encryption_salt_2024',
    'candlelight_encryption_salt',
    'encryption_salt',
    'NEXT_PUBLIC_ENCRYPTION_SALT',
    'MGX_ENCRYPTION_SALT'
  ];

  let firstLevelDecrypted = null;
  let successSalt = null;

  for (const salt of salts) {
    const key = generateEncryptionKey(uuid, salt);
    try {
      const decrypted = decryptText(encryptedText, key);
      if (decrypted) {
        console.log('第一层解密成功!');
        console.log(`用户ID: "${uuid}"`);
        console.log(`盐值: "${salt}"`);
        console.log('解密结果:', decrypted);
        firstLevelDecrypted = decrypted;
        successSalt = salt;
        break;
      }
    } catch (error) {
      // 忽略错误，继续尝试
    }
  }

  if (!firstLevelDecrypted) {
    console.log('使用UUID尝试解密失败。');
    return false;
  }

  // 尝试解密第二层
  if (firstLevelDecrypted.startsWith('U2F')) {
    console.log('\n检测到嵌套加密，尝试解密第二层...');

    // 尝试直接使用相同的密钥解密
    try {
      const key = generateEncryptionKey(uuid, successSalt);
      const secondLevelDecrypted = decryptText(firstLevelDecrypted, key);
      if (secondLevelDecrypted) {
        console.log('第二层解密成功!');
        console.log('最终解密结果:', secondLevelDecrypted);
        return true;
      }
    } catch (error) {
      console.log('使用相同密钥解密第二层失败');
    }

    // 尝试使用其他盐值
    for (const salt of salts) {
      if (salt === successSalt) continue; // 跳过已使用的盐值

      const key = generateEncryptionKey(uuid, salt);
      try {
        const secondLevelDecrypted = decryptText(firstLevelDecrypted, key);
        if (secondLevelDecrypted) {
          console.log('第二层解密成功!');
          console.log(`第二层盐值: "${salt}"`);
          console.log('最终解密结果:', secondLevelDecrypted);
          return true;
        }
      } catch (error) {
        // 忽略错误，继续尝试
      }
    }

    // 尝试直接使用常见密钥
    const commonKeys = [
      'password', '123456', 'admin', 'zhuguang', 'candlelight',
      'secret', 'key', 'encryption', 'default', uuid
    ];

    for (const key of commonKeys) {
      try {
        const secondLevelDecrypted = CryptoJS.AES.decrypt(firstLevelDecrypted, key).toString(CryptoJS.enc.Utf8);
        if (secondLevelDecrypted && secondLevelDecrypted.length > 0) {
          console.log('第二层直接解密成功!');
          console.log(`使用密钥: "${key}"`);
          console.log('最终解密结果:', secondLevelDecrypted);
          return true;
        }
      } catch (error) {
        // 忽略错误，继续尝试
      }
    }

    console.log('无法解密第二层。');
  }

  return firstLevelDecrypted !== null;
};

// 执行测试
console.log('=== 测试0: 使用UUID作为用户ID尝试解密 ===');
tryWithUUID();

// 其他测试暂时注释掉，优先尝试UUID
/*
console.log('\n=== 测试1: 尝试使用不同的用户ID和盐值组合 ===');
testDecryption();

console.log('\n=== 测试2: 尝试直接使用密钥解密 ===');
tryDirectDecryption();

console.log('\n=== 测试3: 尝试替代解密方法 ===');
tryAlternativeDecryption();
*/
