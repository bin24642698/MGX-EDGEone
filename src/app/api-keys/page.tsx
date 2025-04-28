'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getApiKeyPool, getUserKeyAssignment, getUserKeyHistory } from '@/lib/supabase/apiKeyPoolService';
import { useAuth } from '@/hooks/useAuth';

// API Key池页面
export default function ApiKeysPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [apiKeyPool, setApiKeyPool] = useState<any[]>([]);
  const [userKeyAssignment, setUserKeyAssignment] = useState<any>(null);
  const [userKeyHistory, setUserKeyHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载API Key池和用户分配
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        router.push('/');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 获取API Key池
        const pool = await getApiKeyPool();
        setApiKeyPool(pool);

        // 获取用户当前的API Key分配
        const assignment = await getUserKeyAssignment();
        setUserKeyAssignment(assignment);

        // 获取用户的API Key使用历史
        const history = await getUserKeyHistory();
        setUserKeyHistory(history);
      } catch (error) {
        console.error('加载API Key池失败:', error);
        setError('加载API Key池失败，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, authLoading, router]);

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 计算剩余时间
  const getRemainingTime = (expiresAt: string) => {
    if (!expiresAt) return '未知';

    const now = new Date();
    const expireDate = new Date(expiresAt);
    const diffMs = expireDate.getTime() - now.getTime();

    if (diffMs <= 0) return '已过期';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}小时${diffMinutes}分钟`;
  };

  // 计算使用进度
  const getUsageProgress = (usageCount: number, quota: number) => {
    if (!usageCount || !quota) return 0;
    return Math.min(100, Math.round((usageCount / quota) * 100));
  };

  return (
    <div className="flex h-screen bg-bg-color">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <TopBar title="API密钥池" />

        {/* 内容区 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-text-dark mb-2">API密钥池</h1>
              <p className="text-text-medium">
                查看当前的API密钥分配情况。每个用户每天会分配一个API密钥，使用次数达到上限后会自动更换。
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl">
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 用户当前分配 */}
                <div className="bg-card-color rounded-2xl p-6 shadow-md">
                  <h2 className="text-xl font-bold text-text-dark mb-4">我的API密钥分配</h2>

                  {userKeyAssignment ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-text-medium text-sm">密钥ID</p>
                          <p className="text-text-dark font-medium">{userKeyAssignment.api_key_pool.id}</p>
                        </div>
                        <div>
                          <p className="text-text-medium text-sm">分配时间</p>
                          <p className="text-text-dark font-medium">{formatDateTime(userKeyAssignment.assigned_at)}</p>
                        </div>
                        <div>
                          <p className="text-text-medium text-sm">过期时间</p>
                          <p className="text-text-dark font-medium">{formatDateTime(userKeyAssignment.expires_at)}</p>
                        </div>
                        <div>
                          <p className="text-text-medium text-sm">剩余时间</p>
                          <p className="text-text-dark font-medium">{getRemainingTime(userKeyAssignment.expires_at)}</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex justify-between mb-1">
                          <p className="text-text-medium text-sm">使用情况</p>
                          <p className="text-text-medium text-sm">
                            {userKeyAssignment.usage_count} / {userKeyAssignment.api_key_pool.daily_quota}
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-primary-green h-2.5 rounded-full"
                            style={{ width: `${getUsageProgress(userKeyAssignment.usage_count, userKeyAssignment.api_key_pool.daily_quota)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-text-medium">您当前没有分配的API密钥，将在下次使用AI功能时自动分配。</p>
                  )}
                </div>

                {/* 用户API Key使用历史 */}
                <div className="bg-card-color rounded-2xl p-6 shadow-md">
                  <h2 className="text-xl font-bold text-text-dark mb-4">我的API密钥使用历史</h2>

                  {userKeyHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">密钥ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">使用次数</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">最后使用时间</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">分配时间</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">过期时间</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userKeyHistory.map((assignment) => (
                            <tr key={assignment.id}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-text-dark">{assignment.api_key_pool.id}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-text-dark">{assignment.usage_count}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-text-dark">{formatDateTime(assignment.last_used)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-text-dark">{formatDateTime(assignment.assigned_at)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-text-dark">{formatDateTime(assignment.expires_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-text-medium">您还没有使用过API密钥。</p>
                  )}
                </div>

                {/* API密钥池 */}
                <div className="bg-card-color rounded-2xl p-6 shadow-md">
                  <h2 className="text-xl font-bold text-text-dark mb-4">API密钥池</h2>
                  <p className="text-text-medium mb-4">
                    注意：上一日使用过的API密钥不会被释放和重新分配，将继续分配给同一用户使用。
                  </p>

                  {apiKeyPool.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">密钥</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">状态</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">每日配额</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-medium uppercase tracking-wider">创建时间</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {apiKeyPool.map((key) => (
                            <tr key={key.id}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-text-dark">{key.id}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-text-dark">
                                {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 8)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {key.is_active ? '活跃' : '禁用'}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-text-dark">{key.daily_quota}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-text-dark">{formatDateTime(key.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-text-medium">API密钥池为空，请联系管理员添加API密钥。</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
