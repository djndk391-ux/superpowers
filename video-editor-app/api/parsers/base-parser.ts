/**
 * 视频解析结果
 */
export interface ParseResult {
  success: boolean;
  error?: string;
  videoUrl?: string;
  title?: string;
  description?: string;
  coverUrl?: string;
  duration?: number;
  author?: string;
}

/**
 * 解析器接口
 */
export interface VideoParser {
  name: string;
  platform: string;
  
  parse(url: string, id?: string): Promise<ParseResult>;
  
  canHandle(url: string, platformInfo: any): boolean;
}

/**
 * 基础解析器类
 */
export abstract class BaseParser implements VideoParser {
  abstract name: string;
  abstract platform: string;
  
  abstract parse(url: string, id?: string): Promise<ParseResult>;
  
  abstract canHandle(url: string, platformInfo: any): boolean;
  
  protected async fetchUrl(url: string, options: any = {}) {
    const defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      ...options.headers
    };
    
    return fetch(url, {
      ...options,
      headers: defaultHeaders
    });
  }
}
