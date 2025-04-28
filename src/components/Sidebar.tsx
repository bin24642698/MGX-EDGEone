'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';

// 侧边栏收起状态的localStorage键
const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed';

interface SidebarProps {
  activeMenu?: string;
}

export default function Sidebar({ activeMenu = 'works' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isFirstVisit } = useNavigation();

  // 使用 useState 初始化为 false，然后在 useEffect 中从 localStorage 加载
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 在客户端加载时从 localStorage 获取状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (savedState === 'true') {
        setIsCollapsed(true);
      }
    }
  }, []);

  // 导航处理函数
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // 当前路径
  const isActive = (path: string): boolean => {
    if (!pathname) return false;
    return pathname === path;
  };

  // 当收起状态变化时，保存到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isCollapsed.toString());
    }
  }, [isCollapsed]);

  return (
    <>
      {/* 收起状态下只显示展开按钮 */}
      {isCollapsed ? (
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-card-color p-2 rounded-r-xl shadow-md border border-l-0 border-accent-brown/30 text-text-medium hover:text-primary-green transition-colors duration-200 z-10"
          onClick={() => setIsCollapsed(false)}
          aria-label="展开侧边栏"
        >
          <span className="material-icons">chevron_right</span>
        </button>
      ) : (
        <div className="sidebar w-64 border-r border-[rgba(120,180,140,0.2)] bg-card-color shadow-md flex flex-col rounded-tr-2xl rounded-br-2xl transition-all duration-300">
      <div className="p-5 border-b border-[rgba(120,180,140,0.2)] flex items-center">
        <div className="w-10 h-10 bg-primary-green rounded-xl flex items-center justify-center text-white font-bold mr-3 text-base shadow-sm">烛</div>
        <span
          className="text-xl font-medium text-text-dark"
          style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
        >
          烛光写作
        </span>
      </div>

      <div className="flex-1 py-8 px-3">
        <div className="mb-6 px-4">
          <h3 className="text-xs font-semibold text-text-medium uppercase tracking-wider mb-3">主要功能</h3>
        </div>

        <div
          className={`menu-item ${activeMenu === 'novel' ? 'active' : ''}`}
          onClick={() => handleNavigation('/')}
        >
          <div className="menu-icon">
            <span className="material-icons text-xl">home</span>
          </div>
          <span className="menu-text">首页</span>
        </div>

        <div
          className={`menu-item ${activeMenu === 'works' || (pathname && pathname.startsWith('/works')) ? 'active' : ''}`}
          onClick={() => handleNavigation('/works')}
        >
          <div className="menu-icon">
            <span className="material-icons text-xl">auto_stories</span>
          </div>
          <span className="menu-text">小说创作</span>
        </div>

        <div
          className={`menu-item ${activeMenu === 'creativemap' || (pathname && pathname.startsWith('/creativemap')) ? 'active' : ''}`}
          onClick={() => handleNavigation('/creativemap')}
        >
          <div className="menu-icon">
            <span className="material-icons text-xl">map</span>
          </div>
          <span className="menu-text">创意地图</span>
        </div>

        <div className="mt-8 mb-4 px-4">
          <h3 className="text-xs font-semibold text-text-medium uppercase tracking-wider mb-3">工具</h3>
        </div>

        <div
          className={`menu-item ${activeMenu === 'prompts' || (pathname && pathname.startsWith('/prompts')) ? 'active' : ''}`}
          onClick={() => handleNavigation('/prompts')}
        >
          <div className="menu-icon">
            <span className="material-icons text-xl">edit_note</span>
          </div>
          <span className="menu-text">提示词管理</span>
        </div>

        <div
          className={`menu-item ${activeMenu === 'booktool' || (pathname && pathname.startsWith('/booktool')) ? 'active' : ''}`}
          onClick={() => handleNavigation('/booktool')}
        >
          <div className="menu-icon">
            <span className="material-icons text-xl">auto_stories</span>
          </div>
          <span className="menu-text">一键拆书</span>
        </div>
      </div>

      <div className="flex-grow"></div>

      {/* 收起/展开按钮 */}
      <div className="p-4 border-t border-[rgba(120,180,140,0.2)] flex justify-center">
        <button
          className="w-full flex items-center justify-center py-2 rounded-xl text-text-medium hover:bg-[rgba(120,180,140,0.1)] transition-colors duration-200"
          onClick={() => setIsCollapsed(true)}
          aria-label="收起侧边栏"
        >
          <span className="material-icons">chevron_left</span>
          <span className="ml-2">收起</span>
        </button>
      </div>
        </div>
      )}
    </>
  );
}