'use client';

import React from 'react';

interface BookToolSidebarProps {
  chapters: Array<{id: number, title: string, content: string}>;
  selectedChapters: number[];
  onChapterSelect: (chapterId: number) => void;
  onSelectAll: () => void;
}

const BookToolSidebar: React.FC<BookToolSidebarProps> = ({
  chapters,
  selectedChapters,
  onChapterSelect,
  onSelectAll
}) => {
  // 全选状态
  const allSelected = chapters.length > 0 && selectedChapters.length === chapters.length;

  return (
    <div className="booktool-sidebar bg-white animate-slideIn">
        <div className="booktool-sidebar-header">
          <h3 className="text-lg font-medium text-text-dark flex items-center font-ma-shan">
            <span className="material-icons text-[#6F9CE0] mr-2">menu_book</span>
            章节列表
          </h3>
        </div>

        {chapters.length > 0 ? (
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center mb-4 bg-[rgba(111,156,224,0.05)] p-3 rounded-lg border border-[rgba(111,156,224,0.2)] flex-shrink-0">
              <button
                className="flex items-center text-sm text-[#6F9CE0] hover:text-[#5A8BD0] transition-colors"
                onClick={onSelectAll}
              >
                <span className="material-icons text-sm mr-1">
                  {allSelected ? 'check_box' : 'check_box_outline_blank'}
                </span>
                {allSelected ? '取消全选' : '全选'}
              </button>
              <span className="ml-auto text-sm text-text-light bg-[rgba(111,156,224,0.1)] px-2 py-1 rounded-full">
                已选择 {selectedChapters.length}/{chapters.length}
              </span>
            </div>

            <div className="booktool-sidebar-content">
              {chapters.map(chapter => (
                <div
                  key={chapter.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-start max-w-[90%] ${
                    selectedChapters.includes(chapter.id)
                      ? 'bg-[rgba(111,156,224,0.1)] border-l-4 border-[#6F9CE0] shadow-sm'
                      : 'hover:bg-[rgba(111,156,224,0.05)] border-l-4 border-transparent'
                  }`}
                  onClick={() => onChapterSelect(chapter.id)}
                >
                  <span className="material-icons text-sm mr-2 mt-1 text-[#6F9CE0]">
                    {selectedChapters.includes(chapter.id) ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  <div className="flex-1">
                    <p className="text-text-dark font-medium text-sm truncate max-w-[95%]">{chapter.title}</p>
                    <div className="flex items-center max-w-[90%]">
                      <span className="material-icons text-[#6F9CE0] text-xs mr-1">schedule</span>
                      <p className="text-text-light text-xs truncate">
                        {Math.ceil(chapter.content.length / 500)} 分钟阅读
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-text-light">
            <div className="w-16 h-16 rounded-full bg-[rgba(111,156,224,0.1)] flex items-center justify-center mb-3">
              <span className="material-icons text-3xl text-[#6F9CE0]">auto_stories</span>
            </div>
            <p className="text-center font-medium">请先上传TXT文件</p>
            <p className="text-center text-xs mt-2">上传后将在此处显示章节列表</p>
          </div>
        )}
    </div>
  );
};

export default BookToolSidebar;
