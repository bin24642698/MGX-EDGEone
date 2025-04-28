/** @type {import('next').NextConfig} */
const nextConfig = {
  // 抑制水合警告，解决由浏览器扩展导致的 hydration mismatch 问题
  reactStrictMode: false,
  // Next.js 中没有直接支持 suppressHydrationWarning 作为顶级配置
  // 我们只能在组件级别使用 suppressHydrationWarning 属性

  // 排除zhuguang目录
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Cloudflare Pages 配置
  experimental: {
    // 启用 Edge Runtime
    runtime: 'edge',
    // 启用 Node.js 兼容性
    serverComponentsExternalPackages: [],
  },

  // 配置 Cloudflare Pages 环境
  env: {
    NEXT_RUNTIME: 'edge',
  },
};

export default nextConfig;
