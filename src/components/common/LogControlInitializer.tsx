'use client';

import { useEffect } from 'react';
import { disableConsoleLogs } from '@/lib/logControl';

/**
 * 日志控制初始化组件
 * 在客户端初始化时直接禁用所有控制台日志
 */
export default function LogControlInitializer() {
  useEffect(() => {
    // 直接禁用所有控制台日志
    if (typeof window !== 'undefined') {
      disableConsoleLogs();
    }
  }, []);

  // 这个组件不渲染任何内容
  return null;
}
