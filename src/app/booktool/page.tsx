'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import BookToolSidebar from '@/components/booktool/BookToolSidebar';
import BookToolContent from '@/components/booktool/BookToolContent';

export default function BookToolPage() {
  const router = useRouter();

  // 状态
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [chapters, setChapters] = useState<Array<{id: number, title: string, content: string}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // 处理章节选择
  const handleChapterSelect = (chapterId: number) => {
    setSelectedChapters(prev => {
      if (prev.includes(chapterId)) {
        return prev.filter(id => id !== chapterId);
      } else {
        return [...prev, chapterId];
      }
    });
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectedChapters.length === chapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(chapters.map(chapter => chapter.id));
    }
  };

  // 处理文件上传成功
  const handleFileUploaded = (
    parsedChapters: Array<{id: number, title: string, content: string}>,
    name: string
  ) => {
    setChapters(parsedChapters);
    setFileName(name);
    // 默认全选章节
    setSelectedChapters(parsedChapters.map(chapter => chapter.id));
  };

  // 处理AI分析结果
  const handleAnalysisResult = (analysisResult: string) => {
    setResult(analysisResult);
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

      {/* 左侧导航栏 */}
      <Sidebar activeMenu="booktool" />

      {/* 右侧内容区 */}
      <div className="flex-1 flex flex-col h-screen max-h-screen overflow-hidden">
        {/* 顶部导航栏 */}
        <TopBar
          title="一键拆书"
          showBackButton={true}
          onBackButtonClick={() => router.push('/')}
          actions={
            <div className="flex items-center space-x-2">
              {/* 可以添加一些操作按钮 */}
            </div>
          }
        />

        {/* 主要内容区 - 使用大卡片包裹整个内容 */}
        <div className="booktool-container p-4 md:p-6">
          <div className="ghibli-card h-full p-0 flex flex-col relative overflow-hidden">
            <div className="tape -rotate-2 -left-2 -top-2" style={{ backgroundColor: 'rgba(111,156,224,0.7)' }}>
              <div className="tape-texture"></div>
            </div>
            {/* 内容区域 */}
            <div className="booktool-content">
              {/* 左侧章节列表 */}
              <BookToolSidebar
                chapters={chapters}
                selectedChapters={selectedChapters}
                onChapterSelect={handleChapterSelect}
                onSelectAll={handleSelectAll}
              />

              {/* 右侧内容区 */}
              <BookToolContent
                chapters={chapters}
                selectedChapters={selectedChapters}
                result={result}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                onFileUploaded={handleFileUploaded}
                onAnalysisResult={handleAnalysisResult}
                fileName={fileName}
              />
            </div>
            <div className="page-curl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
