/**
 * 视频解析服务
 * 支持多平台视频链接解析和下载
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 平台信息检测
 */
export interface PlatformInfo {
  type: string;
  name: string;
  id: string;
  url: string;
}

export class VideoParser {
  
  /**
   * 检测视频平台
   */
  static detectPlatform(url: string): PlatformInfo | null {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      // B站检测
      if (hostname.includes('bilibili.com') || hostname.includes('b23.tv')) {
        const bvMatch = url.match(/BV[0-9A-Za-z]{10}/);
        const avMatch = url.match(/av(\d+)/);
        return {
          type: 'bilibili',
          name: '哔哩哔哩',
          id: bvMatch ? bvMatch[0] : (avMatch ? avMatch[0] : ''),
          url: url
        };
      }

      // 抖音检测
      if (hostname.includes('douyin.com') || hostname.includes('v.douyin.com')) {
        return {
          type: 'douyin',
          name: '抖音',
          id: 'unknown',
          url: url
        };
      }

      // 快手检测
      if (hostname.includes('kuaishou.com') || hostname.includes('v.kuaishou.com')) {
        return {
          type: 'kuaishou',
          name: '快手',
          id: 'unknown',
          url: url
        };
      }

      // 小红书检测
      if (hostname.includes('xiaohongshu.com') || hostname.includes('xhslink.com')) {
        return {
          type: 'xiaohongshu',
          name: '小红书',
          id: 'unknown',
          url: url
        };
      }

      // 微博检测
      if (hostname.includes('weibo.com') || hostname.includes('m.weibo.cn')) {
        return {
          type: 'weibo',
          name: '微博',
          id: 'unknown',
          url: url
        };
      }

      // 西瓜视频
      if (hostname.includes('ixigua.com') || hostname.includes('v.ixigua.com')) {
        return {
          type: 'xigua',
          name: '西瓜视频',
          id: 'unknown',
          url: url
        };
      }

      // 直接视频链接
      const videoExtensions = ['.mp4', '.webm', '.mov', '.flv', '.m3u8'];
      for (const ext of videoExtensions) {
        if (url.toLowerCase().includes(ext)) {
          return {
            type: 'direct',
            name: '直链视频',
            id: 'direct',
            url: url
          };
        }
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * 解析并下载视频
   */
  static async parseAndDownload(videoUrl: string): Promise<any> {
    const platformInfo = this.detectPlatform(videoUrl);

    if (!platformInfo) {
      return {
        success: false,
        error: '无法识别该链接格式，请检查链接是否正确'
      };
    }

    console.log(`识别到平台: ${platformInfo.name}`);

    // 如果是直链视频，直接下载
    if (platformInfo.type === 'direct') {
      return await this.downloadVideo(platformInfo.url);
    }

    // 对于B站等需要特殊解析的平台，返回友好的提示
    if (platformInfo.type === 'bilibili') {
      return {
        success: false,
        error: `检测到B站视频 (${platformInfo.id})\n\nB站视频需要特殊解析方式。\n\n建议方案：\n1. 使用浏览器开发者工具获取真实视频链接\n2. 或使用B站下载器获取直链\n3. 直接上传MP4文件`,
        platform: platformInfo
      };
    }

    // 其他平台
    return {
      success: false,
      error: `暂不支持 ${platformInfo.name} 平台的解析。\n\n当前支持的格式：\n• 直链视频 (.mp4, .webm, .mov)\n• 其他平台请使用第三方解析获取直链`,
      platform: platformInfo
    };
  }

  /**
   * 下载视频文件
   */
  static async downloadVideo(url: string): Promise<any> {
    return new Promise((resolve) => {
      try {
        let videoUrl: URL;
        try {
          videoUrl = new URL(url);
        } catch (error) {
          resolve({
            success: false,
            error: '无效的URL格式'
          });
          return;
        }

        if (!['http:', 'https:'].includes(videoUrl.protocol)) {
          resolve({
            success: false,
            error: '只支持 http 或 https 链接'
          });
          return;
        }

        const fileId = generateId();
        const fileName = `${fileId}.mp4`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        console.log(`开始下载视频: ${url}`);
        console.log(`保存到: ${filePath}`);

        const protocol = videoUrl.protocol === 'https:' ? https : http;
        const file = fs.createWriteStream(filePath);

        const request = protocol.get(videoUrl.href, (response) => {
          if (response.statusCode !== 200 && response.statusCode !== 206) {
            file.close();
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            resolve({
              success: false,
              error: `下载失败，服务器返回状态码: ${response.statusCode}`
            });
            return;
          }

          const contentLength = response.headers['content-length'];
          let downloadedBytes = 0;
          const totalBytes = contentLength ? parseInt(contentLength) : 0;

          response.on('data', (chunk: Buffer) => {
            downloadedBytes += chunk.length;
            if (totalBytes > 0) {
              const progress = Math.round((downloadedBytes / totalBytes) * 100);
              if (progress % 20 === 0) {
                console.log(`下载进度: ${progress}%`);
              }
            }
          });

          response.pipe(file);

          file.on('finish', () => {
            file.close();
            console.log(`视频下载完成: ${filePath}`);
            
            const stats = fs.statSync(filePath);
            const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

            resolve({
              success: true,
              data: {
                fileId: fileId,
                fileName: fileName,
                filePath: `/uploads/${fileName}`,
                fileSize: stats.size,
                fileSizeInMB: fileSizeInMB,
                originalUrl: url
              }
            });
          });

          file.on('error', (err) => {
            console.error('文件写入错误:', err);
            file.close();
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            resolve({
              success: false,
              error: '文件写入失败'
            });
          });
        });

        request.on('error', (err) => {
          console.error('下载错误:', err);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          resolve({
            success: false,
            error: `下载失败: ${err.message}`
          });
        });

      } catch (error) {
        console.error('服务器错误:', error);
        resolve({
          success: false,
          error: '服务器内部错误'
        });
      }
    });
  }
}
