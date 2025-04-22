/**
 * 格式化工具函数
 */

/**
 * 格式化日期
 * @param date 日期
 * @param options 格式化选项
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('zh-CN', options).format(d);
};

/**
 * 格式化相对时间
 * @param date 日期
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  // 转换为秒
  const seconds = Math.floor(diff / 1000);
  
  // 小于1分钟
  if (seconds < 60) {
    return '刚刚';
  }
  
  // 小于1小时
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分钟前`;
  }
  
  // 小于1天
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}小时前`;
  }
  
  // 小于1周
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days}天前`;
  }
  
  // 小于1个月
  if (seconds < 2592000) {
    const weeks = Math.floor(seconds / 604800);
    return `${weeks}周前`;
  }
  
  // 小于1年
  if (seconds < 31536000) {
    const months = Math.floor(seconds / 2592000);
    return `${months}个月前`;
  }
  
  // 大于1年
  const years = Math.floor(seconds / 31536000);
  return `${years}年前`;
};

/**
 * 格式化字数
 * @param count 字数
 * @returns 格式化后的字数字符串
 */
export const formatWordCount = (count: number): string => {
  if (count < 1000) {
    return `${count}`;
  }
  
  if (count < 10000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  
  return `${(count / 10000).toFixed(1)}w`;
};
