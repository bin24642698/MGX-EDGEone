/**
 * 通用弹窗组件 - 吉卜力风格
 * 从提示词管理界面复制而来
 */
import React, { ReactNode } from 'react';
import { ModalProps } from '@/types/ui';

// 扩展的Modal属性类型
interface ExtendedModalProps extends ModalProps {
  footer?: ReactNode;
}

/**
 * 吉卜力风格弹窗组件
 * @param props 弹窗属性
 * @returns 弹窗组件
 */
export const Modal: React.FC<ExtendedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-2xl"
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" aria-hidden="true" onClick={onClose}></div>

      {/* 外部弹窗框架 - 固定高度 */}
      <div className={`relative bg-card-color rounded-2xl text-left shadow-xl transform transition-all ${maxWidth} w-full h-[700px] flex flex-col`}>

        {/* 标题和关闭按钮 */}
        <div className="px-6 pt-5 pb-4 flex justify-between items-center relative z-10">
          <div className="w-6">
            {/* 左侧占位，保持布局平衡 */}
          </div>
          <h3 className="text-2xl font-bold text-text-dark font-ma-shan text-center" id="modal-title">
            {title}
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700 w-6 flex justify-center"
            onClick={onClose}
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* 内部网格弹窗 - 固定高度 */}
        <div className="px-10 flex-1 overflow-hidden">
          <div className="relative bg-card-color rounded-xl border border-[rgba(120,180,140,0.4)] h-[520px] overflow-hidden editor-grid-bg shadow-[0_4px_12px_rgba(0,0,0,0.08),_0_2px_4px_rgba(0,0,0,0.04),_inset_0_0_3px_rgba(0,0,0,0.02)] p-4">
              {children}
          </div>
        </div>

        {/* 底部按钮区域 - 固定在底部 */}
        {footer && (
          <div className="px-6 py-4 mt-4 relative z-10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
