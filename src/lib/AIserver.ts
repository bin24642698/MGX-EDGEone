/**
 * AIserver - 简化的AI服务接口
 * 提供与Gemini API的通信功能
 */
import { getApiKey } from './settingsManager';
import { OpenAI } from 'openai'; // 导入OpenAI库

// 模型常量
export const MODELS = {
  GEMINI_FLASH: 'gemini-2.5-flash-preview-04-17', // 普通版
  GEMINI_PRO: 'gemini-2.5-pro-exp-03-25',      // 高级版
};

// 消息类型
export interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

// 生成选项接口
export interface GenerateOptions {
  model: string;
  temperature?: number;
  max_tokens?: number; // 更改为 max_tokens
  stream?: boolean;
  abortSignal?: AbortSignal; // AbortSignal 可能需要不同的处理方式
}

// 默认选项
const DEFAULT_OPTIONS: Omit<GenerateOptions, 'model' | 'abortSignal'> = {
  temperature: 0.7,
  max_tokens: 4096, // 调整默认max_tokens
  stream: true
};

// API Base URL (从用户输入获取)
const API_BASE = "https://bin.24642698.xyz/v1";

/** 
 * 错误处理函数
 */
const handleAIError = (error: any): string => {
  console.error('AI服务错误:', error);
  const errorMessage = error?.message || JSON.stringify(error) || '未知错误'; // 更详细的错误日志

  if (errorMessage.includes('API key not configured')) {
    return 'API密钥未配置，请在设置中配置API密钥';
  }
  // 增加对OpenAI特定错误的处理
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401) {
        return `API认证失败：${error.message} (状态码: ${error.status})，请检查您的API密钥和API Base是否正确。`;
    }
    if (error.status === 429) {
        return `请求过于频繁：${error.message} (状态码: ${error.status})，请稍后再试。`;
    }
    if (error.code === 'invalid_api_key') {
         return `无效的API密钥：${error.message}。请检查您的API密钥。`;
    }
    return `OpenAI API错误：${error.message} (状态码: ${error.status}, 类型: ${error.type}, Code: ${error.code})`;
  }
  // 其他错误类型
  if (errorMessage.includes('token') || errorMessage.includes('context_length_exceeded')) {
    return '内容长度超出模型限制，请尝试减少输入内容';
  }
  if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('fetch failed')) {
    return '网络连接错误，请检查您的网络连接或API Base URL是否正确，并重试';
  }
  if (errorMessage.includes('authentication') || errorMessage.includes('认证')) {
     return 'API认证失败，请检查您的API密钥是否正确或有效';
  }
  // 默认错误消息
  return `生成内容失败: ${errorMessage}`;
};

// 缓存 OpenAI client 实例
let openaiClientInstance: OpenAI | null = null;
let currentApiKey: string | null = null;

/**
 * 获取或创建OpenAI客户端实例
 * @returns OpenAI 客户端实例
 */
const getOpenAIClient = async (): Promise<OpenAI> => {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  // 如果 API Key 发生变化或实例不存在，则重新创建
  if (apiKey !== currentApiKey || !openaiClientInstance) {
    console.log("Creating new OpenAI client instance...");
    currentApiKey = apiKey;
    openaiClientInstance = new OpenAI({
      apiKey: currentApiKey,
      baseURL: API_BASE, // 使用baseURL, typescript类型定义使用这个名称
      dangerouslyAllowBrowser: true // 必须在浏览器环境中允许
    });
  }

  return openaiClientInstance;
};

/**
 * AI内容生成核心
 */
export const AIGenerator = {
  /**
   * 生成AI内容(非流式)
   * @param messages 消息数组
   * @param options 生成选项
   * @returns 生成的内容
   */
  generate: async (
    messages: Message[],
    options: Partial<GenerateOptions> = {}
  ): Promise<string> => {
    if (!messages || messages.length === 0) return "";

    // 确保仅在客户端执行
    if (typeof window === 'undefined') {
      throw new Error('AI generation can only be executed in browser environment');
    }

    try {
      const client = await getOpenAIClient();
      // 确保 model 有明确的值，避免 undefined
      const modelToUse = options.model || MODELS.GEMINI_FLASH;

      console.log(`使用模型: ${modelToUse}`);

      // 添加请求信息日志
      console.log("发送请求:", {
        model: modelToUse,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options.temperature || DEFAULT_OPTIONS.temperature
      });

      const completion = await client.chat.completions.create({
        model: modelToUse,
        messages: messages.map(m => ({ role: m.role, content: m.content })), // 确保格式正确
        temperature: options.temperature || DEFAULT_OPTIONS.temperature,
        stream: false
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error("API请求错误:", error);
      
      // 添加更详细的错误信息
      if (error.status) console.error(`错误状态码: ${error.status}`);
      if (error.message) console.error(`错误消息: ${error.message}`);
      if (error.code) console.error(`错误代码: ${error.code}`);
      if (error.type) console.error(`错误类型: ${error.type}`);
      if (error.stack) console.error(`堆栈: ${error.stack}`);
      
      const errorMessage = handleAIError(error);
      throw new Error(errorMessage);
    }
  },

  /**
   * 生成AI内容(流式)
   * @param messages 消息数组
   * @param options 生成选项
   * @param onChunk 块回调函数
   */
  generateStream: async (
    messages: Message[],
    options: Partial<GenerateOptions> = {},
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    if (!messages || messages.length === 0 || typeof onChunk !== 'function') return;

    // 确保仅在客户端执行
    if (typeof window === 'undefined') {
      throw new Error('AI generation can only be executed in browser environment');
    }

    try {
      const client = await getOpenAIClient();
      // 确保 model 有明确的值，避免 undefined
      const modelToUse = options.model || MODELS.GEMINI_FLASH;
      
      console.log(`流式生成使用模型: ${modelToUse}`);
      
      // 添加请求信息日志
      console.log("发送流式请求:", {
        model: modelToUse,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options.temperature || DEFAULT_OPTIONS.temperature
      });

      // 使用更简化的参数调用API
      const stream = await client.chat.completions.create({
        model: modelToUse,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options.temperature || DEFAULT_OPTIONS.temperature,
        stream: true
      });

      console.log("Stream created successfully");

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onChunk(content);
        }
      }
    } catch (error: any) {
      console.error("API流式请求错误:", error);
      
      // 添加更详细的错误信息
      if (error.status) console.error(`错误状态码: ${error.status}`);
      if (error.message) console.error(`错误消息: ${error.message}`);
      if (error.code) console.error(`错误代码: ${error.code}`);
      if (error.type) console.error(`错误类型: ${error.type}`);
      if (error.stack) console.error(`堆栈: ${error.stack}`);
      
      // 检查是否是用户主动中止
      if (error instanceof OpenAI.APIUserAbortError || (error instanceof DOMException && error.name === 'AbortError')) {
        console.log("Stream generation aborted by user.");
        const abortError = new Error('AbortError');
        abortError.name = 'AbortError';
        throw abortError;
      }
      
      const errorMessage = handleAIError(error);
      throw new Error(errorMessage);
    }
  }
};

// 导出简化的API
export const generateAIContent = AIGenerator.generate;
export const generateAIContentStream = AIGenerator.generateStream;
