// 导入 Cloudflare Workers 相关模块
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// 配置
const DEBUG = false;

// 处理请求的主函数
async function handleRequest(event) {
  const url = new URL(event.request.url);
  let options = {};

  try {
    // 尝试从 KV 存储获取资源
    const page = await getAssetFromKV(event, options);

    // 允许 HTML 页面被缓存 30 分钟
    const response = new Response(page.body, page);
    response.headers.set('Cache-Control', 'public, max-age=1800');
    return response;
  } catch (e) {
    // 如果资源不存在，返回 404 页面
    if (DEBUG) {
      return new Response(e.message || e.toString(), { status: 500 });
    }

    // 返回自定义 404 页面
    return new Response('404 - 页面未找到', { status: 404 });
  }
}

// 导出 fetch 事件处理函数
addEventListener('fetch', event => {
  try {
    event.respondWith(handleRequest(event));
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), { status: 500 })
      );
    }
    event.respondWith(new Response('发生内部错误', { status: 500 }));
  }
});

// 导出配置
export const config = {
  // 启用 Node.js 兼容性
  compatibility_flags: ["nodejs_compat"]
};
