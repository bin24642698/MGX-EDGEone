// 替代 node:buffer 模块
export const Buffer = {
  from: (data: string, encoding?: string) => {
    if (encoding === 'base64') {
      return Uint8Array.from(atob(data), c => c.charCodeAt(0));
    }
    const encoder = new TextEncoder();
    return encoder.encode(data);
  },
  toString: (buffer: Uint8Array, encoding?: string) => {
    if (encoding === 'base64') {
      return btoa(String.fromCharCode.apply(null, [...buffer]));
    }
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }
};

// 替代 node:async_hooks 模块
export const AsyncLocalStorage = class {
  private static instance: any = null;
  
  constructor() {
    // 简单实现
  }
  
  run(store: any, callback: Function) {
    AsyncLocalStorage.instance = store;
    try {
      return callback();
    } finally {
      AsyncLocalStorage.instance = null;
    }
  }
  
  getStore() {
    return AsyncLocalStorage.instance;
  }
};
