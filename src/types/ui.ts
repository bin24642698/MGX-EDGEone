/**
 * UI类型定义
 */

import { ReactNode } from 'react';

// 提示词类型映射
export interface PromptTypeInfo {
  label: string;
  color: string;
  icon: string;
  group: string;
  gradient: string;
}

// 提示词分组
export interface PromptGroup {
  label: string;
  color: string;
  icon: string;
  types: string[];
}

// 弹窗属性
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  maxWidth?: string;
}

// 按钮属性
export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

// 卡片属性
export interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  tapeColor?: string;
  withPageCurl?: boolean;
  withTape?: boolean;
  style?: React.CSSProperties;
}
