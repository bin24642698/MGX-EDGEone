'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { PromptTypeCard } from '@/components/prompts/PromptTypeCard';
import { usePrompts } from '@/hooks/usePrompts';
import { PromptGroup } from '@/types/ui';

// 提示词类型映射
const promptTypeMap = {
  'ai_writing': { label: 'AI写作', color: 'bg-green-100 text-green-800', icon: 'create', group: 'novel', gradient: 'from-green-500 to-green-600' },
  'ai_polishing': { label: 'AI润色', color: 'bg-blue-100 text-blue-800', icon: 'auto_fix_high', group: 'novel', gradient: 'from-blue-500 to-blue-600' },
  'ai_analysis': { label: 'AI分析', color: 'bg-indigo-100 text-indigo-800', icon: 'analytics', group: 'novel', gradient: 'from-indigo-500 to-indigo-600' },
  'worldbuilding': { label: '世界观', color: 'bg-purple-100 text-purple-800', icon: 'public', group: 'creative', gradient: 'from-purple-500 to-purple-600' },
  'character': { label: '角色', color: 'bg-amber-100 text-amber-800', icon: 'person', group: 'creative', gradient: 'from-amber-500 to-amber-600' },
  'plot': { label: '情节', color: 'bg-rose-100 text-rose-800', icon: 'timeline', group: 'creative', gradient: 'from-rose-500 to-rose-600' },
  'introduction': { label: '导语', color: 'bg-indigo-100 text-indigo-800', icon: 'format_quote', group: 'creative', gradient: 'from-indigo-500 to-indigo-600' },
  'outline': { label: '大纲', color: 'bg-blue-100 text-blue-800', icon: 'format_list_bulleted', group: 'creative', gradient: 'from-blue-500 to-blue-600' },
  'detailed_outline': { label: '细纲', color: 'bg-teal-100 text-teal-800', icon: 'subject', group: 'creative', gradient: 'from-teal-500 to-teal-600' },
  'book_tool': { label: '一键拆书', color: 'bg-amber-100 text-amber-800', icon: 'auto_stories', group: 'tools', gradient: 'from-amber-500 to-amber-600' }
};

// 提示词分组定义
const promptGroups: PromptGroup[] = [
  {
    label: '小说创作',
    color: 'bg-green-100 text-green-800',
    icon: 'auto_stories',
    types: ['ai_writing', 'ai_polishing', 'ai_analysis']
  },
  {
    label: '创意构思',
    color: 'bg-purple-100 text-purple-800',
    icon: 'lightbulb',
    types: ['worldbuilding', 'character', 'plot', 'introduction', 'outline', 'detailed_outline']
  },
  {
    label: '工具',
    color: 'bg-amber-100 text-amber-800',
    icon: 'build',
    types: ['book_tool']
  }
];

export default function PromptsPage() {
  const router = useRouter();
  const { typePrompts, loadAllTypePrompts } = usePrompts();
  const [isLoading, setIsLoading] = useState(true);

  // 加载所有类型的提示词
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        setIsLoading(true);
        await loadAllTypePrompts();
      } catch (error) {
        console.error('加载提示词失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrompts();
  }, [loadAllTypePrompts]);

  // 获取每种类型的提示词数量
  const getPromptCount = (type: string) => {
    return typePrompts[type]?.length || 0;
  };

  // 导航到提示词类型页面
  const navigateToType = (type: string) => {
    router.push(`/prompts/type/${type}`);
  };

  return (
    <div className="flex h-screen bg-bg-color animate-fadeIn overflow-hidden">
      {/* 背景网格 */}
      <div className="grid-background"></div>

      {/* 装饰元素，在小屏幕上减少数量 */}
      <div className="dot hidden md:block" style={{ top: "120px", left: "15%" }}></div>
      <div className="dot" style={{ bottom: "80px", right: "20%" }}></div>
      <div className="dot hidden md:block" style={{ top: "30%", right: "25%" }}></div>
      <div className="dot hidden md:block" style={{ bottom: "40%", left: "30%" }}></div>

      <svg className="wave hidden md:block" style={{ bottom: "20px", left: "10%" }} width="100" height="20" viewBox="0 0 100 20">
        <path d="M0,10 Q25,0 50,10 T100,10" fill="none" stroke="var(--accent-brown)" strokeWidth="2" />
      </svg>

      <Sidebar activeMenu="prompts" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title="提示词管理"
          showBackButton={true}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* 提示词分组 */}
            {promptGroups.map((group, index) => (
              <div key={group.label} className={`mb-12 ${index === 0 ? '' : 'mt-16'}`}>
                <div className="flex items-center mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${group.color.split(' ')[0]}`}>
                    <span className={`material-icons ${group.color.split(' ')[1]}`}>{group.icon}</span>
                  </div>
                  <h2 className="text-xl font-bold text-text-dark font-ma-shan">{group.label}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.types.map(type => {
                    if (type === 'book_tool') {
                      // 拆书工具卡片
                      return (
                        <PromptTypeCard
                          key={type}
                          type={type}
                          typeInfo={promptTypeMap[type as keyof typeof promptTypeMap]}
                          count={0}
                          onClick={() => navigateToType('book_tool')}
                        />
                      );
                    }

                    // 常规提示词类型卡片
                    return (
                      <PromptTypeCard
                        key={type}
                        type={type}
                        typeInfo={promptTypeMap[type as keyof typeof promptTypeMap]}
                        count={getPromptCount(type)}
                        onClick={() => navigateToType(type)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
