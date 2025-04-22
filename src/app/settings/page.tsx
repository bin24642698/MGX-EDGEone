'use client';

import React, { useState } from 'react';
import { resetDatabases } from '@/lib/db';
import TopBar from '@/components/TopBar';

export default function SettingsPage() {
  const [isResetting, setIsResetting] = useState(false);

  // 处理数据库重置
  const handleResetDatabases = async () => {
    if (window.confirm('确定要重置所有数据库吗？此操作将删除所有数据，且不可恢复！')) {
      setIsResetting(true);
      try {
        await resetDatabases();
        // resetDatabases 函数内部会自动刷新页面
      } catch (error) {
        console.error('重置数据库失败:', error);
        alert('重置数据库失败，请查看控制台了解详情');
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-color animate-fadeIn">
      <TopBar title="系统设置" showBackButton={true} />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-primary-green font-ma-shan">数据管理</h2>
          
          <div className="mb-6">
            <h3 className="text-xl mb-2 text-text-dark">数据库管理</h3>
            <p className="text-text-medium mb-4">
              如果您遇到数据问题，可以尝试重置数据库。警告：此操作会删除所有数据！
            </p>
            <button
              onClick={handleResetDatabases}
              disabled={isResetting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isResetting ? '重置中...' : '重置数据库'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-primary-green font-ma-shan">关于</h2>
          <p className="text-text-medium mb-2">版本: v0.9.0</p>
          <p className="text-text-medium">
            逐光写作是一款专为小说创作者设计的写作工具，集成了创作、档案管理和AI辅助功能。
          </p>
        </div>
      </div>
    </div>
  );
} 