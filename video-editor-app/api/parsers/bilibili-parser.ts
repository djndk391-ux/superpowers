/**
 * B站视频解析器
 * 支持BV号和AV号的基础解析
 */
import { BaseParser, ParseResult } from './base-parser.js';

export class BilibiliParser extends BaseParser {
  name = 'B站解析器';
  platform = 'bilibili';

  canHandle(url: string, platformInfo: any): boolean {
    return platformInfo && platformInfo.type === 'bilibili';
  }

  async parse(url: string, id?: string): Promise<ParseResult> {
    try {
      console.log(`开始解析B站视频: ${url}, ID: ${id}`);

      // 提取BV号或AV号
      const bvMatch = url.match(/BV[0-9A-Za-z]{10}/);
      const bvId = bvMatch ? bvMatch[0] : id;

      if (!bvId) {
        return {
          success: false,
          error: '未能找到有效的BV号'
        };
      }

      console.log(`提取到BV号: ${bvId}`);

      // 注意：B站正式API需要复杂的签名和Cookie
      // 这里我们提供一个友好的错误提示，并建议使用第三方解析服务或获取直链
      
      return {
        success: false,
        error: 'B站视频需要特殊解析。建议：\n1. 使用B站视频下载工具获取MP4直链\n2. 或使用第三方解析服务获取视频地址\n3. 直接粘贴视频MP4链接进行编辑',
        title: 'B站视频 ' + bvId,
        description: '需要特殊解析'
      };

    } catch (error) {
      console.error('B站解析错误:', error);
      return {
        success: false,
        error: '解析B站视频时发生错误: ' + (error instanceof Error ? error.message : '未知错误')
      };
    }
  }
}
