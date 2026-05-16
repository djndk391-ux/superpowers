/**
 * 解析器管理器
 * 统一管理和调度不同平台的解析器
 */
import { PlatformDetector } from '../utils/platform-detector.js';
import { BaseParser, ParseResult } from './base-parser.js';
import { DirectVideoParser } from './direct-parser.js';
import { BilibiliParser } from './bilibili-parser.js';

export class ParserManager {
  private parsers: BaseParser[] = [];

  constructor() {
    // 注册解析器
    this.parsers = [
      new DirectVideoParser(),
      new BilibiliParser()
    ];
  }

  /**
   * 解析视频链接
   */
  async parseVideoUrl(url: string): Promise<ParseResult> {
    try {
      // 首先识别平台
      const platformInfo = PlatformDetector.detect(url);

      if (!platformInfo) {
        return {
          success: false,
          error: '无法识别该视频链接格式，请检查链接是否正确'
        };
      }

      console.log(`识别到平台: ${platformInfo.name} (${platformInfo.type})`);

      // 查找合适的解析器
      const parser = this.findParser(url, platformInfo);

      if (!parser) {
        return {
          success: false,
          error: `暂不支持 ${platformInfo.name} 平台的解析，请使用MP4直链`
        };
      }

      console.log(`使用解析器: ${parser.name}`);

      // 调用解析器
      const result = await parser.parse(url, platformInfo.id);
      
      if (result.success && result.videoUrl) {
        console.log('解析成功，视频地址:', result.videoUrl);
      } else {
        console.log('解析结果:', result);
      }

      return result;

    } catch (error) {
      console.error('解析过程出错:', error);
      return {
        success: false,
        error: '解析过程中发生错误: ' + (error instanceof Error ? error.message : '未知错误')
      };
    }
  }

  /**
   * 查找合适的解析器
   */
  private findParser(url: string, platformInfo: any): BaseParser | null {
    for (const parser of this.parsers) {
      if (parser.canHandle(url, platformInfo)) {
        return parser;
      }
    }
    return null;
  }

  /**
   * 获取支持的平台列表
   */
  getSupportedPlatforms(): string[] {
    return this.parsers.map(p => p.platform);
  }
}
