'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllWorks, addWork, updateWork, deleteWork, Work } from '@/data';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentWorkId, setCurrentWorkId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  // 添加删除确认弹窗状态
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<number | null>(null);

  // 添加过滤和排序相关状态
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [searchQuery, setSearchQuery] = useState('');

  // 定义空的变量，避免引用错误
  const fileUploadMode = false;
  const chapterPreview: any[] = [];
  const showPreview = false;
  const uploading = false;

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const allWorks = await getAllWorks();
        setWorks(allWorks);
      } catch (error) {
        console.error('获取作品失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorks();
  }, []);

  const handleCreateWork = () => {
    setIsEditMode(false);
    setCurrentWorkId(null);
    setFormData({
      title: '',
    });
    setIsModalOpen(true);
  };

  const handleEditWork = (work: Work) => {
    setIsEditMode(true);
    setCurrentWorkId(work.id ?? null);
    setFormData({
      title: work.title,
    });
    setIsModalOpen(true);
  };

  const handleDeleteWork = async (id: number) => {
    setWorkToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!workToDelete) return;

    setIsDeleting(true);
    try {
      await deleteWork(workToDelete);
      // 更新作品列表
      const allWorks = await getAllWorks();
      setWorks(allWorks);
    } catch (error) {
      console.error('删除作品失败:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setWorkToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setWorkToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError('');
    setFormData({
      title: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.title.trim()) {
        throw new Error('标题不能为空');
      }

      const now = new Date();

      // Prepare data, adding back empty/default values for removed fields for DB compatibility
      const workData = {
        title: formData.title,
        description: '', // Default empty string
        type: 'novel' as 'novel' | 'character' | 'worldbuilding' | 'plot', // Default type
        content: '', // Default empty string
      };

      if (isEditMode && currentWorkId) {
        // 更新现有作品
        await updateWork({
          ...workData,
          id: currentWorkId,
          updatedAt: now,
          createdAt: works.find(w => w.id === currentWorkId)?.createdAt || now
        });
      } else {
        // 创建新作品
        const newWork = await addWork({
          ...workData,
          createdAt: now,
          updatedAt: now
        });

        router.push(`/works/${newWork.id}`);
        return;
      }

      // 重新获取作品列表
      const allWorks = await getAllWorks();
      setWorks(allWorks);

      // 重置表单并关闭创建界面
      setFormData({
        title: '',
      });
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : isEditMode ? '更新作品失败' : '创建作品失败');
    } finally {
      setIsLoading(false);
    }
  };



  // 过滤和排序作品
  const filteredAndSortedWorks = works
    .filter(work => filter === 'all' || work.type === filter)
    .filter(work => work.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === 'created') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  // 作品卡片组件
  const WorkCard = ({ work, onDelete }: { work: Work; onDelete: (id: number) => Promise<void> }) => {
    // 简化的颜色类
    const colors = {
      text: 'text-[#7D85CC]',
      border: 'border-[#7D85CC]',
      hover: 'hover:bg-[rgba(125,133,204,0.1)]',
      icon: 'M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5A2,2 0 0,0 17,3M7,5H17V16L12,14.25L7,16V5Z'
    };

    return (
      <div
        className="ghibli-card h-72 text-center cursor-pointer"
        onClick={() => router.push(`/works/${work.id}`)}
      >
        <div className="tape" style={{ backgroundColor: 'rgba(125,133,204,0.7)' }}>
          <div className="tape-texture"></div>
        </div>
        <div className="flex flex-col items-center h-full">
          <svg className={`w-10 h-10 mt-6 mb-4 fill-current ${colors.text}`} viewBox="0 0 24 24">
            <path d={colors.icon} />
          </svg>
          <h3 className="font-medium text-text-dark text-lg mb-2" style={{fontFamily: "'Ma Shan Zheng', cursive"}}>{work.title}</h3>
          <p className="text-text-medium text-xs mb-2 px-4 line-clamp-2">{work.description || "暂无描述"}</p>
          <div className="flex justify-center space-x-2 mb-2">
            <span className="text-text-medium text-xs flex items-center">
              <span className="material-icons text-xs mr-1">calendar_today</span>
              {new Date(work.updatedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex space-x-2 mt-auto mb-4">
            <button
              className={`px-2 py-1 rounded-full text-xs ${colors.text} border ${colors.border} ${colors.hover} transition-colors duration-200 flex items-center`}
              onClick={(e) => {
                e.stopPropagation();
                handleEditWork(work);
              }}
            >
              <span className="material-icons text-xs mr-1">edit</span>
              编辑
            </button>
            <button
              className="px-2 py-1 rounded-full text-xs text-[#E06F6F] border border-[#E06F6F] hover:bg-[rgba(224,111,111,0.1)] transition-colors duration-200 flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(work.id!);
              }}
              disabled={isDeleting}
            >
              <span className="material-icons text-xs mr-1">delete</span>
              删除
            </button>
          </div>
        </div>
        <div className="page-curl"></div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-bg-color animate-fadeIn overflow-hidden">
      {/* 左侧导航栏 */}
      <Sidebar activeMenu="works" />

      {/* 右侧内容区 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 使用通用顶边栏组件 */}
        <TopBar
          title="我的作品集"
          showBackButton={true}
          actions={
            <>
              <button
                className="hidden md:flex ghibli-button text-sm"
                onClick={handleCreateWork}
              >
                <span className="material-icons mr-1 text-sm">add</span>
                创建新作品
              </button>
              <button
                className="md:hidden round-button"
                onClick={handleCreateWork}
                aria-label="创建新作品"
              >
                <span className="material-icons">add</span>
              </button>
            </>
          }
        />

        {/* 主要内容 */}
        <div className="flex-1 p-3 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* 过滤和排序 */}
            <div className="flex flex-wrap items-center justify-between mb-4 md:mb-6 gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <select
                    className="pl-9 pr-4 py-1.5 text-xs md:text-sm text-text-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-green appearance-none"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">全部作品</option>
                    <option value="novel">小说</option>
                    <option value="short_story">短篇</option>
                    <option value="script">剧本</option>
                  </select>
                  <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-text-light text-lg">filter_list</span>
                </div>
                <div className="relative">
                  <select
                    className="pl-9 pr-4 py-1.5 text-xs md:text-sm text-text-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-green appearance-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="updated">最近更新</option>
                    <option value="created">创建时间</option>
                    <option value="title">标题</option>
                  </select>
                  <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-text-light text-lg">sort</span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索作品..."
                  className="pl-9 pr-4 py-1.5 text-xs md:text-sm w-full md:w-64 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-green"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-text-light text-lg">search</span>
                {searchQuery && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-light hover:text-text-medium"
                    onClick={() => setSearchQuery('')}
                  >
                    <span className="material-icons text-lg">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* 作品卡片网格 */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {/* 创建新作品的专属卡片 */}
                <div
                  className="ghibli-card h-72 text-center cursor-pointer bg-gradient-to-br from-[rgba(120,180,140,0.05)] to-[rgba(125,133,204,0.1)]"
                  onClick={handleCreateWork}
                >
                  <div className="tape bg-gradient-to-r from-[rgba(120,180,140,0.7)] to-[rgba(125,133,204,0.7)]">
                    <div className="tape-texture"></div>
                  </div>
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 bg-gradient-to-r from-[rgba(120,180,140,0.2)] to-[rgba(125,133,204,0.2)] rounded-full flex items-center justify-center mb-4">
                      <span className="material-icons text-[#78B48C] text-3xl">edit</span>
                    </div>
                    <h3 className="font-medium text-text-dark text-xl mb-3" style={{fontFamily: "'Ma Shan Zheng', cursive"}}>创建新作品</h3>
                    <p className="text-text-medium text-sm mb-6 px-6">开始你的创作之旅</p>
                  </div>
                  <div className="page-curl"></div>
                </div>

                {/* 现有作品列表 */}
                {filteredAndSortedWorks.map((work) => (
                  <WorkCard key={work.id} work={work} onDelete={handleDeleteWork} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 创建/编辑作品弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-card-color rounded-2xl shadow-xl max-w-md w-full overflow-auto border border-[rgba(120,180,140,0.4)]">
            <div className="sticky top-0 bg-card-color p-6 border-b border-[rgba(120,180,140,0.3)] flex justify-between items-center rounded-t-2xl z-10">
              <h2 className="text-xl font-ma-shan text-text-dark">{isEditMode ? '编辑作品' : '创建新作品'}</h2>
              <button
                className="p-2 hover:bg-[rgba(120,180,140,0.1)] rounded-full transition-colors duration-200 text-text-medium"
                onClick={handleCloseModal}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-[rgba(224,111,111,0.1)] border border-[rgba(224,111,111,0.3)] rounded-xl text-[#E06F6F]">
                  <div className="flex items-center">
                    <span className="material-icons mr-2 text-[#E06F6F]">error</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="title" className="block text-text-dark font-medium mb-2 font-ma-shan">作品标题</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[rgba(120,180,140,0.4)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7D85CC] focus:border-transparent bg-card-color text-text-dark"
                    placeholder="请输入作品标题"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 sticky bottom-0 pt-4 bg-card-color border-t border-[rgba(120,180,140,0.2)] mt-6">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#7D85CC] text-white hover:bg-[#6970B9] transition-colors duration-200 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-icons animate-spin mr-2 text-sm">refresh</span>
                        <span>{isEditMode ? '保存中...' : '创建中...'}</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-2 text-sm">save</span>
                        <span>{isEditMode ? '保存修改' : '创建作品'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="px-5 py-2 rounded-full border border-[#7D85CC] text-[#7D85CC] hover:bg-[rgba(125,133,204,0.1)] transition-colors duration-200"
                    onClick={handleCloseModal}
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-card-color rounded-2xl shadow-xl w-[320px] overflow-hidden border border-[rgba(224,111,81,0.4)]">
            <div className="sticky top-0 bg-[rgba(224,111,81,0.1)] p-4 border-b border-[rgba(224,111,81,0.3)] flex justify-between items-center rounded-t-2xl z-10">
              <h2 className="text-lg font-ma-shan text-[#E06F51]">确认删除作品</h2>
              <button
                className="p-1 hover:bg-[rgba(224,111,81,0.1)] rounded-full transition-colors duration-200 text-text-medium"
                onClick={cancelDelete}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="p-4">
              <p className="text-text-medium text-sm mb-4">确定要删除这个作品吗？此操作不可恢复。</p>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[rgba(224,111,81,0.2)]">
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-full bg-[#E06F51] text-white hover:bg-[#D05E40] transition-colors duration-200 flex items-center"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? '删除中...' : '确认删除'}
                </button>
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-full border border-[#7D85CC] text-[#7D85CC]"
                  onClick={cancelDelete}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}