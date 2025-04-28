// 导出配置
export const config = {
  // 启用 Node.js 兼容性
  compatibility_flags: ["nodejs_compat"]
};

// 导入 Next.js 的 worker
import worker from './.next/server.js';

// 导出 fetch 处理函数
export default worker;
