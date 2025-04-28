'use client';

import React, { useState } from 'react';
import Encoding from 'encoding-japanese';

// 导入TextDecoderPolyfill类型
declare class TextDecoderPolyfill {
  constructor(encoding: string);
  decode(input?: ArrayBuffer | ArrayBufferView): string;
}

interface FileUploaderProps {
  onFileUploaded: (chapters: Array<{id: number, title: string, content: string}>, fileName: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    console.log('文件信息:', file.name, file.size, file.type);

    if (file.type !== 'text/plain' && !file.name.toLowerCase().endsWith('.txt')) {
      setError('请上传TXT文本文件');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 读取文件内容
      let fileBuffer = await file.arrayBuffer();
      console.log('文件大小:', fileBuffer.byteLength, '字节');

      // 检查文件的前几个字节，帮助判断编码
      const dataView = new DataView(fileBuffer);
      let hexHeader = '';
      for (let i = 0; i < Math.min(fileBuffer.byteLength, 8); i++) {
        hexHeader += dataView.getUint8(i).toString(16).padStart(2, '0') + ' ';
      }
      console.log('文件头部字节:', hexHeader);

      // 解码文件内容
      const text = convertChineseEncoding(fileBuffer);
      console.log('解码完成，结果长度:', text.length);

      // 过滤掉常见的电子书水印和版权声明
      const cleanText = text.replace(/☆[^☆]*?看帮网[^☆]*?☆/g, '')
                            .replace(/☆本文由.*?所有☆/g, '')
                            .replace(/☆请勿用于商业.*?自负☆/g, '')
                            .replace(/☆https?:\/\/www\.kanbang\.cc☆/g, '');

      // 解析章节
      console.log('开始解析章节');
      const parsedChapters = parseChapters(cleanText);
      console.log('章节解析完成，识别到', parsedChapters.length, '个章节');

      // 添加ID属性
      const chaptersWithId = parsedChapters.length > 0
        ? parsedChapters.map((chapter, index) => ({
            id: index + 1,
            title: chapter.title,
            content: chapter.content
          }))
        : [{ id: 1, title: '第一章', content: cleanText }];

      // 设置文件名（去除.txt后缀）
      const fileName = file.name.replace(/\.txt$/i, '');

      // 回调上传成功
      onFileUploaded(chaptersWithId, fileName);
    } catch (err) {
      setError('文件解析失败，请重试');
      console.error('文件解析错误:', err);
    } finally {
      setUploading(false);
    }
  };

  // 添加GBK/GB18030转UTF-8的函数
  function convertChineseEncoding(buffer: ArrayBuffer): string {
    try {
      // 转换为Uint8Array以便处理
      const uint8Array = new Uint8Array(buffer);

      // 首先检查是否是UTF-8 BOM
      if (uint8Array.length >= 3 &&
          uint8Array[0] === 0xEF &&
          uint8Array[1] === 0xBB &&
          uint8Array[2] === 0xBF) {
        // UTF-8带BOM
        console.log('检测到UTF-8 BOM');
        return new TextDecoder('utf-8').decode(uint8Array.slice(3));
      }

      // 尝试使用浏览器原生TextDecoder解码UTF-8
      let utf8Text = '';
      try {
        utf8Text = new TextDecoder('utf-8').decode(uint8Array);
        // 如果UTF-8解码没有明显乱码，直接返回
        if (!utf8Text.includes('\uFFFD') && !utf8Text.includes('锟斤拷')) {
          console.log('UTF-8解码成功，无明显乱码');
          return utf8Text;
        }
      } catch (e) {
        console.warn('UTF-8解码失败', e);
      }

      // 尝试检测编码
      const detected = Encoding.detect(uint8Array);
      console.log('Encoding-Japanese检测到的编码:', detected);

      // 尝试GBK解码 - 使用text-encoding库的polyfill
      try {
        console.log('尝试GBK解码');
        // 注意：浏览器原生不支持GBK，使用polyfill
        const gbkText = new (window as any).TextDecoder('gbk').decode(uint8Array);

        // 检查是否有明显乱码
        const gbkFffdCount = (gbkText.match(/\uFFFD/g) || []).length;
        const utf8FffdCount = (utf8Text.match(/\uFFFD/g) || []).length;

        console.log('GBK解码乱码数:', gbkFffdCount, 'UTF-8解码乱码数:', utf8FffdCount);

        // 如果GBK解码的乱码更少，使用GBK解码结果
        if (gbkFffdCount < utf8FffdCount) {
          console.log('使用GBK解码结果');
          return gbkText;
        }
      } catch (gbkError) {
        console.warn('GBK polyfill解码失败', gbkError);
      }

      // 使用Encoding-Japanese库进行转换尝试
      try {
        console.log('尝试使用Encoding-Japanese转换');
        // 尝试使用检测到的编码，如果是BINARY（无法检测）则尝试GBK
        const fromEncoding = detected === 'BINARY' ? 'GBK' : detected;

        const unicodeArray = Encoding.convert(uint8Array, {
          to: 'UNICODE',
          from: fromEncoding
        });

        const convertedText = Encoding.codeToString(unicodeArray);

        // 检查转换结果中的乱码
        const convertedFffdCount = (convertedText.match(/\uFFFD/g) || []).length;
        const utf8FffdCount = (utf8Text.match(/\uFFFD/g) || []).length;

        console.log('Encoding-Japanese转换乱码数:', convertedFffdCount, 'UTF-8解码乱码数:', utf8FffdCount);

        // 如果是中文相关编码或转换后乱码更少，使用转换结果
        if (['GBK', 'GB18030', 'GB2312', 'BIG5', 'CHINESE'].includes(detected) ||
            convertedFffdCount < utf8FffdCount) {
          console.log('使用Encoding-Japanese转换结果');
          return convertedText;
        }
      } catch (encError) {
        console.warn('Encoding-Japanese转换失败', encError);
      }

      // 如果上述所有方法都失败或效果不理想，回退到UTF-8
      console.log('所有方法效果不佳，回退到UTF-8解码结果');
      return utf8Text;
    } catch (error) {
      console.error('编码转换总体错误:', error);
      // 最终兜底方案
      return new TextDecoder('utf-8').decode(buffer);
    }
  }

  // 解析章节函数
  function parseChapters(text: string): { title: string; content: string }[] {
    // 章节识别的正则表达式
    // 1. 章节格式
    const chapterRegex = /(第[零一二三四五六七八九十百千0-9]+章(\s+[^\n]+)?|第[0-9]{1,4}章(\s+[^\n]+)?|Chapter\s+[0-9]+(\s+[^\n]+)?|CHAPTER\s+[0-9]+(\s+[^\n]+)?)/gi;

    // 2. 卷/册/部等结构，这些不直接作为分章依据，但是可以记录
    const volumeRegex = /(第[零一二三四五六七八九十百千0-9]+[卷册部篇集](\s+[^\n]+)?)/gi;

    // 查找所有章节标记及其位置
    let chapterMatches: { title: string, index: number }[] = [];
    let match;

    // 查找正式章节
    while ((match = chapterRegex.exec(text)) !== null) {
      // 防止重复匹配相同位置的章节
      let isDuplicate = false;
      for (const existingMatch of chapterMatches) {
        // 检查是否有重叠：如果新匹配的起始位置在某个现有匹配的范围内
        if (Math.abs(existingMatch.index - match.index) < 10) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        console.log(`找到章节: "${match[0]}" 在位置: ${match.index}`);
        chapterMatches.push({
          title: match[0].trim(),
          index: match.index
        });
      }
    }

    // 如果没有找到任何章节标题
    if (chapterMatches.length === 0) {
      console.log("未找到标准章节格式，尝试通过卷/册/部来分章");

      // 尝试使用卷/册/部等结构分章
      while ((match = volumeRegex.exec(text)) !== null) {
        // 防止重复匹配
        let isDuplicate = false;
        for (const existingMatch of chapterMatches) {
          if (Math.abs(existingMatch.index - match.index) < 10) {
            isDuplicate = true;
            break;
          }
        }

        if (!isDuplicate) {
          console.log(`找到卷/册/部: "${match[0]}" 在位置: ${match.index}`);
          chapterMatches.push({
            title: match[0].trim(),
            index: match.index
          });
        }
      }
    }

    // 按位置排序章节标题
    chapterMatches.sort((a, b) => a.index - b.index);

    // 如果仍然没有找到任何章节或卷结构
    if (chapterMatches.length === 0) {
      return [];
    }

    // 提取章节内容
    const chapters: { title: string; content: string }[] = [];

    for (let i = 0; i < chapterMatches.length; i++) {
      const current = chapterMatches[i];
      const next = chapterMatches[i + 1];

      const chapterContent = next
        ? text.substring(current.index, next.index).trim()
        : text.substring(current.index).trim();

      chapters.push({
        title: current.title,
        content: chapterContent
      });
    }

    return chapters;
  }

  return (
    <div className="animate-fadeIn w-full max-w-xl">
      <div className="bg-white p-8 flex flex-col items-center justify-center relative rounded-lg border border-[rgba(111,156,224,0.2)] shadow-sm">
        <div className="w-20 h-20 rounded-full bg-[rgba(111,156,224,0.15)] flex items-center justify-center mb-4">
          <span className="material-icons text-5xl text-[#6F9CE0]">upload_file</span>
        </div>

        <h3 className="text-xl font-medium text-text-dark mb-2 font-ma-shan">上传TXT文件开始拆书</h3>
        <p className="text-text-medium text-center max-w-md mb-6">
          上传TXT文件后，系统会自动识别章节，您可以选择需要处理的章节进行AI拆书分析
        </p>

        <div className="border-2 border-dashed border-[rgba(111,156,224,0.4)] rounded-xl p-6 w-full max-w-md flex flex-col items-center justify-center bg-[rgba(111,156,224,0.05)] mb-6">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
          >
            <span className="material-icons text-3xl text-[#6F9CE0] mb-3">description</span>
            <p className="text-text-medium mb-2 text-center">点击或拖放TXT文件到此处</p>
            <p className="text-text-light text-xs text-center">支持TXT格式，自动识别章节结构</p>
          </label>
        </div>

        <label
          htmlFor="file-upload"
          className="px-6 py-3 rounded-full bg-[#6F9CE0] text-white hover:bg-[#5A8BD0] transition-colors duration-200 flex items-center cursor-pointer shadow-md"
        >
          {uploading ? (
            <>
              <span className="material-icons animate-spin mr-2">refresh</span>
              <span>处理中...</span>
            </>
          ) : (
            <>
              <span className="material-icons mr-2">file_upload</span>
              <span>选择文件</span>
            </>
          )}
        </label>

        {error && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-500 text-sm flex items-center">
            <span className="material-icons text-red-500 mr-2">error</span>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
