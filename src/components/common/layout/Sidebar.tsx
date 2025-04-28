/**
 * 侧边栏组件
 */
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeMenu: string;
}

/**
 * 侧边栏组件
 * @param props 侧边栏属性
 * @returns 侧边栏组件
 */
export const Sidebar: React.FC<SidebarProps> = ({ activeMenu }) => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 菜单项
  const menuItems = [
    { id: 'novel', label: '小说创作', icon: 'auto_stories', path: '/' },
    { id: 'prompts', label: '提示词', icon: 'psychology', path: '/prompts' },
    { id: 'works', label: '作品集', icon: 'book', path: '/works' },
    { id: 'creativemap', label: '创意地图', icon: 'map', path: '/creativemap' }
  ];

  // 处理菜单点击
  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className={`bg-card-color border-r border-[rgba(120,180,140,0.2)] h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-56'}`}>
      {/* 顶部Logo */}
      <div className="p-4 flex items-center justify-center border-b border-[rgba(120,180,140,0.2)]">
        {isCollapsed ? (
          <div className="w-8 h-8 rounded-full bg-primary-green flex items-center justify-center text-white">
            <span className="material-icons">edit</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-green flex items-center justify-center text-white mr-3">
              <span className="material-icons">edit</span>
            </div>
            <h1 className="text-lg font-medium text-text-dark" style={{fontFamily: "'Ma Shan Zheng', cursive"}}>烛光写作</h1>
          </div>
        )}
      </div>

      {/* 菜单项 */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul>
          {menuItems.map(item => (
            <li key={item.id} className="mb-1 px-3">
              <button
                className={`w-full flex items-center py-2 px-3 rounded-xl transition-colors duration-200 ${activeMenu === item.id ? 'bg-primary-green bg-opacity-10 text-primary-green' : 'text-text-medium hover:bg-[rgba(120,180,140,0.05)]'}`}
                onClick={() => handleMenuClick(item.path)}
              >
                <span className="material-icons">{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 底部折叠按钮 */}
      <div className="p-4 border-t border-[rgba(120,180,140,0.2)]">
        <button
          className="w-full flex items-center justify-center py-2 rounded-xl text-text-medium hover:bg-[rgba(120,180,140,0.1)] transition-colors duration-200"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span className="material-icons">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!isCollapsed && <span className="ml-2">收起</span>}
        </button>
      </div>
    </div>
  );
};
