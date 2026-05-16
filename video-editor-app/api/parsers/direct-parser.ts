/**
 * 直链视频解析器
 * 处理直接的视频文件链接
 */
import { BaseParser, ParseResult } from './base-parser.js';

export class DirectVideoParser extends BaseParser {
  name = '直链视频解析器';
  platform = 'direct';

  canHandle(url: string, platformInfo: any): boolean {
    return platformInfo && platformInfo.type === 'direct';
  }

  async parse(url: string, id?: string): Promise<ParseResult> {
    try {
      // 直接返回原始URL作为视频地址
      const filename = url.split('/').pop() || 'video.mp4';
      
      return {
        success: true,
        videoUrl: url,
        title: filename,
        description: '直链视频'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '解析失败'
      };
    }
  }
}
