/**
 * 优化对话框组件
 */
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/modals';
import { getAllPrompts, getAIInterfacePromptsByType } from '@/data';
import { Prompt } from '@/data';

interface OptimizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (optimizeText: string, selectedPrompt: Prompt | null) => void;
  content: string; // 当前内容
}

/**
 * 优化对话框组件
 */
export const OptimizeDialog: React.FC<OptimizeDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  content
}) => {
  // 状态
  const [optimizeText, setOptimizeText] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 加载提示词
  useEffect(() => {
    if (isOpen) {
      const loadPrompts = async () => {
        setIsLoading(true);
        try {
          // 加载AI润色类型的提示词
          const polishPrompts = await getAIInterfacePromptsByType('ai_polishing');
          setPrompts(polishPrompts);

          // 默认选择第一个提示词
          if (polishPrompts.length > 0) {
            setSelectedPrompt(polishPrompts[0]);
          }
        } catch (error) {
          console.error('加载提示词失败:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadPrompts();
    }
  }, [isOpen]);

  // 处理提交
  const handleSubmit = () => {
    onSubmit(optimizeText, selectedPrompt);
  };

  // 渲染底部按钮
  const renderFooter = () => (
    <div className="flex justify-end space-x-3 pt-2">
      <button
        onClick={onClose}
        className="ghibli-button outline text-sm py-2 transition-all duration-200 flex items-center"
      >
        <span className="material-icons mr-1 text-sm">arrow_back</span>
        返回
      </button>
      <button
        onClick={handleSubmit}
        disabled={!selectedPrompt}
        className={`ghibli-button text-sm py-2 transition-all duration-300 hover:shadow-md flex items-center
          ${!selectedPrompt ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="material-icons mr-1 text-sm">auto_fix_high</span>
        开始优化
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="优化内容"
      footer={renderFooter()}
    >
      <div className="flex flex-col h-full">
        {/* 提示词选择 */}
        <div className="mb-4">
          <label className="block text-text-dark font-medium mb-2">选择提示词</label>
          <div className="grid grid-cols-2 gap-3">
            {isLoading ? (
              <div className="col-span-2 flex justify-center py-4">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : prompts.length === 0 ? (
              <div className="col-span-2 text-center py-4 text-text-light">
                没有找到润色提示词
              </div>
            ) : (
              prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPrompt?.id === prompt.id
                      ? 'border-[#7D85CC] bg-[rgba(125,133,204,0.1)]'
                      : 'border-gray-200 hover:border-[#7D85CC] hover:bg-[rgba(125,133,204,0.05)]'
                  }`}
                  onClick={() => setSelectedPrompt(prompt)}
                >
                  <div className="font-medium text-text-dark mb-1">{prompt.title}</div>
                  <div className="text-sm text-text-light truncate">
                    {prompt.content.substring(0, 60)}
                    {prompt.content.length > 60 && '...'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 优化指令输入 */}
        <div className="flex-1">
          <label className="block text-text-dark font-medium mb-2">优化指令</label>
          <textarea
            value={optimizeText}
            onChange={(e) => setOptimizeText(e.target.value)}
            placeholder="请输入优化指令，例如：'使语言更加生动'、'增加更多细节描写'等..."
            className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7D85CC] resize-none"
          ></textarea>
        </div>

        {/* 当前内容预览 */}
        <div className="mt-4">
          <label className="block text-text-dark font-medium mb-2">当前内容预览</label>
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
            <div className="text-sm text-text-medium whitespace-pre-wrap">
              {content.substring(0, 200)}
              {content.length > 200 && '...'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
