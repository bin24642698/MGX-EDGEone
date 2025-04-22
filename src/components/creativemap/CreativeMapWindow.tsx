import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/common/modals';
import { generateAIContentStream, MODELS, Message } from '@/lib/AIserver';
import { getPromptsByType, Prompt, addArchive, Archive, getAllWorks, Work } from '@/lib/db';
import { CreativeMapItem } from '@/app/creativemap/page';

interface CreativeMapWindowProps {
  isOpen: boolean;
  onClose: () => void;
  item: CreativeMapItem;
  apiKeyExists: boolean;
}

export const CreativeMapWindow: React.FC<CreativeMapWindowProps> = ({
  isOpen,
  onClose,
  item,
  apiKeyExists,
}) => {
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState('');
  const [showGenerationView, setShowGenerationView] = useState(false);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState<boolean>(false);
  const [promptsError, setPromptsError] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(MODELS.GEMINI_FLASH);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showWorkSelection, setShowWorkSelection] = useState(false);
  const [worksList, setWorksList] = useState<Work[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);

  // --- Add new state to track if generation has occurred --- 
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  // Helper function to get localStorage key for a given item type
  const getLocalStorageKey = (itemId: string) => `creativeMapLastPrompt_${itemId}`;

  useEffect(() => {
    if (isOpen && item) {
      const loadPrompts = async () => {
        setPromptsLoading(true);
        setPromptsError('');
        setPrompts([]);
        setSelectedPrompt(null);
        try {
          const fetchedPrompts = await getPromptsByType(item.id as Prompt['type']);
          setPrompts(fetchedPrompts);

          // --- Load last selected prompt ID --- 
          let lastSelectedId: number | null = null;
          if (typeof window !== 'undefined') {
            try {
              const storedId = localStorage.getItem(getLocalStorageKey(item.id));
              if (storedId) {
                lastSelectedId = parseInt(storedId, 10);
              }
            } catch (error) {
              console.error('Error reading localStorage for last prompt:', error);
            }
          }

          // --- Set initial selected prompt --- 
          if (lastSelectedId !== null) {
            const foundPrompt = fetchedPrompts.find(p => p.id === lastSelectedId);
            if (foundPrompt) {
              setSelectedPrompt(foundPrompt);
            } else {
              // Last selected prompt not found (maybe deleted?), reset
              setSelectedPrompt(null);
              if (typeof window !== 'undefined') {
                  try {
                      localStorage.removeItem(getLocalStorageKey(item.id));
                  } catch (error) {
                      console.error('Error removing invalid prompt from localStorage:', error);
                  }
              }
            }
          } else {
             // No last selection, keep it null or select first if needed
             setSelectedPrompt(null); // Keep default behavior
          }
          // --- End of changes --- 

          if (fetchedPrompts.length > 0) {
          } else {
            setPromptsError('未找到适用于此类型的提示词。');
          }
        } catch (err) {
          console.error('加载提示词失败:', err);
          setPromptsError('加载提示词时出错，请稍后再试。');
        } finally {
          setPromptsLoading(false);
        }
      };
      loadPrompts();
    }
  }, [isOpen, item]);

  useEffect(() => {
    if (isOpen) {
      setUserInput('');
      setGeneratedContent('');
      setError('');
      setShowGenerationView(false);
      setHasGeneratedOnce(false); // Reset generation tracker when modal opens
      setIsSaving(false);
      setSaveSuccess(false);
      setSaveError('');
      setShowWorkSelection(false);
      setSelectedWorkId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight;
    }
  }, [generatedContent]);

  const handleGenerate = async () => {
    if (!apiKeyExists) {
      setError('请先在设置中配置 API 密钥');
      return;
    }
    if (!selectedPrompt) {
      setError('请先选择一个提示词');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedContent('');
    setShowGenerationView(true);
    setHasGeneratedOnce(true); // Mark that generation has occurred

    const systemPrompt = selectedPrompt.content;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput || '请根据系统提示词的要求开始创作。' }
    ];

    try {
      // --- Start: New character-by-character logic --- 
      let pendingChars: string[] = []; // 等待显示的字符队列
      let isProcessing = false; // 是否正在处理字符队列

      // 处理字符队列的函数
      const processCharQueue = () => {
        // 如果队列中有字符且没有处理循环在运行
        if (pendingChars.length > 0 && !isProcessing) {
          isProcessing = true;
          
          // 立即取出并显示一个字符
          const char = pendingChars.shift() as string;
          setGeneratedContent(prev => prev + char); // 更新 CreativeMapWindow 的状态
          
          // 标记处理完成，并立即尝试处理下一个（如果有）
          isProcessing = false;
          requestAnimationFrame(processCharQueue); // 使用 rAF 优化性能
        }
      };
      // --- End: New character-by-character logic --- 

      await generateAIContentStream(
        messages,
        { model: selectedModel },
        (chunk) => {
          // --- Start: Updated chunk handling --- 
          if (!chunk) return;
          
          // 将接收到的chunk分解为字符并加入队列
          for (const char of chunk) {
            pendingChars.push(char);
          }
          
          // 触发字符处理（如果不在处理中）
          processCharQueue();
          // --- End: Updated chunk handling --- 
        }
      );
    } catch (err) {
      console.error('生成内容失败:', err);
      setError(err instanceof Error ? err.message : '生成内容时发生未知错误');
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to initiate saving process (fetch works, show selection)
  const initiateSaveToArchive = async () => {
    if (!generatedContent || isSaving || isGenerating) return;

    setError(''); // Clear previous errors
    setSaveError(''); // Clear previous save errors
    setSaveSuccess(false);

    try {
      const works = await getAllWorks();
      if (works.length === 0) {
        setError('您还没有创建任何作品，请先创建作品后再保存词条。');
        setTimeout(() => setError(''), 5000);
        return;
      }
      setWorksList(works);
      setSelectedWorkId(works[0].id ?? null); // Default to the first work
      setShowWorkSelection(true);
    } catch (err) {
      console.error('获取作品列表失败:', err);
      setError('获取作品列表失败，无法保存。');
       setTimeout(() => setError(''), 5000);
    }
  };

  // Function to handle saving to archive AFTER work selection
  const handleSaveToArchive = async () => {
    if (!generatedContent || isSaving || selectedWorkId === null) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    setShowWorkSelection(false); // Close the work selection modal

    try {
      const title = `新建的${item.name}`;
      
      const newArchiveEntry: Omit<Archive, 'id'> = {
        title: title,
        content: generatedContent,
        category: item.id,
        workId: selectedWorkId, // Use the selected work ID
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [item.name, 'AI 生成']
      };

      await addArchive(newArchiveEntry);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (err) {
      console.error('保存到档案馆失败:', err);
      setSaveError('保存失败，请稍后再试。');
      setTimeout(() => setSaveError(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const renderInputView = () => (
    <div className="content-container">
      <div>
        <h3 className="text-lg font-semibold mb-1 text-text-dark" style={{fontFamily: "'Ma Shan Zheng', cursive"}}>
          创作：{item.name}
        </h3>
        <p className="text-text-medium text-sm">{item.description}</p>
      </div>

      <div className="relative">
         <label htmlFor="model-select" className="block text-sm font-medium text-text-dark mb-1.5" style={{fontFamily: "'Ma Shan Zheng', cursive"}}>选择模型</label>
         <select
           id="model-select"
           value={selectedModel}
           onChange={(e) => setSelectedModel(e.target.value)}
           className="w-full px-4 py-2.5 rounded-lg border border-[rgba(120,180,140,0.3)] bg-white focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-200 appearance-none pr-8"
         >
           <option value={MODELS.GEMINI_FLASH}>普通版 (快速生成)</option>
           <option value={MODELS.GEMINI_PRO}>高级版 (高质量)</option>
         </select>
         <div className="pointer-events-none absolute inset-y-0 right-0 top-7 flex items-center px-2 text-gray-700">
           <svg className="fill-current h-4 w-4 text-primary-green opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
         </div>
      </div>

      <div className="relative">
         <label htmlFor="prompt-select" className="block text-sm font-medium text-text-dark mb-1.5" style={{fontFamily: "'Ma Shan Zheng', cursive"}}>选择提示词 (系统提示词)</label>
         <select
           id="prompt-select"
           value={selectedPrompt?.id || ''}
           onChange={(e) => {
             const promptId = Number(e.target.value);
             const prompt = prompts.find(p => p.id === promptId) || null;
             setSelectedPrompt(prompt);
             setError('');

             // --- Save selected prompt ID to localStorage --- 
             if (prompt && typeof window !== 'undefined') {
               try {
                 localStorage.setItem(getLocalStorageKey(item.id), String(prompt.id));
               } catch (error) {
                 console.error('Error saving last prompt to localStorage:', error);
               }
             }
             // --- End of changes ---
           }}
           disabled={promptsLoading || prompts.length === 0}
           className="w-full px-4 py-2.5 rounded-lg border border-[rgba(120,180,140,0.3)] bg-white focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-200 appearance-none pr-8"
         >
           <option value="" disabled>{promptsLoading ? '正在加载提示词...' : prompts.length === 0 ? '无可用提示词' : '请选择...'}</option>
           {prompts.map(prompt => (
             <option key={prompt.id} value={prompt.id}>
               {prompt.title}
             </option>
           ))}
         </select>
         <div className="pointer-events-none absolute inset-y-0 right-0 top-7 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4 text-primary-green opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
         </div>
         {promptsError && <p className="text-red-500 text-xs mt-1">{promptsError}</p>}
      </div>

      <div>
        <label htmlFor="user-input" className="block text-sm font-medium text-text-dark mb-1.5" style={{fontFamily: "'Ma Shan Zheng', cursive"}}>用户提示词 (可选)</label>
        <textarea
          id="user-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-3 rounded-lg border border-[rgba(120,180,140,0.3)] bg-white focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-200 min-h-[150px] text-text-medium"
          placeholder={`可以在此输入具体要求，补充或覆盖系统提示词的部分内容...`}
        />
      </div>

       {error && !showGenerationView && (
         <p className="text-red-500 text-sm mt-1">错误: {error}</p>
       )}
    </div>
  );

  const renderGenerationView = () => (
     // Return the content directly, removing the white page container
     <>
       {error && (
          // Error message structure remains the same
          <div className="relative bg-white p-3 rounded-xl shadow-sm border border-red-200 mb-3"> {/* Added mb-3 for spacing */}
             <div className="flex items-center text-red-600">
               <span className="material-icons mr-2">error_outline</span>
               <p className="text-text-dark font-medium text-sm">{error}</p>
             </div>
           </div>
       )}
       {/* Render the text container directly */}
       <div
         ref={resultContainerRef} // Keep ref if needed for other purposes, though scrolling is handled by scrollableContainerRef
         className="whitespace-pre-wrap text-text-dark text-[14pt] leading-relaxed font-normal"
         style={{fontFamily: "'Noto Sans SC', sans-serif"}}
       >
           {generatedContent || (
             <span className="text-text-light italic">
               {isGenerating ? "AI 正在创作中..." : "AI 生成的内容将显示在这里..."}
             </span>
           )}
         </div>
       {/* Remove the page curl div */}
     </>
   );

  // Render the work selection modal content
  const renderWorkSelection = () => (
    <div className="p-4 space-y-4">
        <h4 className="text-lg font-semibold text-text-dark">选择要保存到的作品</h4>
        {worksList.length > 0 ? (
            <select
                value={selectedWorkId ?? ''}
                onChange={(e) => setSelectedWorkId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[rgba(120,180,140,0.3)] bg-white focus:outline-none focus:ring-1 focus:ring-primary-green"
            >
                {worksList.map((work) => (
                    <option key={work.id} value={work.id}>
                        {work.title}
                    </option>
                ))}
            </select>
        ) : (
            <p className="text-text-medium">没有找到作品。</p>
        )}
        {/* Add confirmation and cancel buttons for the selection */} 
        <div className="flex justify-end space-x-3">
            <button
                onClick={() => setShowWorkSelection(false)}
                className="ghibli-button outline text-sm py-1.5 px-3"
            >
                取消
            </button>
            <button
                onClick={handleSaveToArchive} // This now confirms selection and saves
                disabled={selectedWorkId === null || isSaving}
                className={`ghibli-button text-sm py-1.5 px-3 ${selectedWorkId === null || isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isSaving ? '保存中...' : '确认并保存'}
            </button>
       </div>
     </div>
   );

  const renderFooter = () => {
     if (showGenerationView) {
       return (
         <div className="flex justify-between items-center pt-2">
           <div className="text-sm">
              {isSaving && <span className="text-primary-green animate-pulse">正在保存...</span>}
              {saveSuccess && <span className="text-green-600">已保存到档案馆!</span>}
              {saveError && <span className="text-red-500">{saveError}</span>}
           </div>
           
           <div className="flex space-x-3">
             <button
               onClick={initiateSaveToArchive}
               disabled={isGenerating || isSaving || !generatedContent}
               className={`ghibli-button text-sm py-2 flex items-center ${(isGenerating || isSaving || !generatedContent) ? 'opacity-50 cursor-not-allowed' : ''}`}
               title={!generatedContent ? '没有内容可保存' : isSaving ? '保存中...' : '保存到档案馆'}
             >
               <span className="material-icons mr-1 text-sm">save</span>
               保存到档案馆
             </button>
             <button
               onClick={() => setShowGenerationView(false)}
               disabled={isGenerating || isSaving}
               className={`ghibli-button outline text-sm py-2 flex items-center ${(isGenerating || isSaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               <span className="material-icons mr-1 text-sm">arrow_back</span>
               返回编辑
             </button>
             <button
               onClick={handleGenerate}
               disabled={isGenerating || isSaving || !selectedPrompt}
               className={`ghibli-button text-sm py-2 flex items-center ${(isGenerating || isSaving || !selectedPrompt) ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               <span className="material-icons mr-1 text-sm">refresh</span>
               重新生成
             </button>
           </div>
         </div>
       );
     } else {
       return (
         <div className="flex justify-end space-x-3 pt-2">
           {hasGeneratedOnce ? (
             // --- Buttons when generation has happened --- 
             <>
               <button
                 onClick={() => setShowGenerationView(true)} // Go back to the results view
                 className="ghibli-button outline text-sm py-2 flex items-center"
               >
                 <span className="material-icons mr-1 text-sm">visibility</span>
                 返回结果
               </button>
               <button
                 onClick={handleGenerate} // Trigger generation again
                 disabled={isGenerating || !apiKeyExists || !selectedPrompt || promptsLoading}
                 className={`ghibli-button text-sm py-2 flex items-center ${(!apiKeyExists || !selectedPrompt || isGenerating || promptsLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                 title={!apiKeyExists ? '请先配置API密钥' : !selectedPrompt ? '请选择提示词' : ''}
               >
                 <span className="material-icons mr-1 text-sm">refresh</span>
                 {isGenerating ? '生成中...' : '重新生成'}
               </button>
             </>
           ) : (
             // --- Initial Buttons --- 
             <>
               <button
                 onClick={onClose} // Close the modal
                 className="ghibli-button outline text-sm py-2"
               >
                 取消
               </button>
               <button
                 onClick={handleGenerate} // Trigger first generation
                 disabled={isGenerating || !apiKeyExists || !selectedPrompt || promptsLoading}
                 className={`ghibli-button text-sm py-2 flex items-center ${(!apiKeyExists || !selectedPrompt || isGenerating || promptsLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                 title={!apiKeyExists ? '请先配置API密钥' : !selectedPrompt ? '请选择提示词' : ''}
               >
                 <span className="material-icons mr-1 text-sm">auto_awesome</span>
                 {isGenerating ? '生成中...' : '开始生成'}
               </button>
             </>
           )}
         </div>
       );
     }
   };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient || 'from-gray-400 to-gray-500'} flex items-center justify-center mr-3 text-white shadow-md`}>
            <span className="material-icons text-lg">{item.icon}</span>
          </div>
          <span style={{fontFamily: "'Ma Shan Zheng', cursive"}} className="text-xl text-text-dark">
            {item.name}
          </span>
        </div>
      }
      footer={renderFooter()}
      maxWidth="max-w-3xl"
    >
      {/* Conditionally render work selection or main content */}
      {showWorkSelection ? (
          renderWorkSelection()
      ) : (
          <div 
            ref={scrollableContainerRef} 
            className="scrollable-container"
          >
        {showGenerationView ? renderGenerationView() : renderInputView()}
      </div>
      )}
    </Modal>
  );
}; 