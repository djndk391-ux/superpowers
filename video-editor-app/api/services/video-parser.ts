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
 * 第三方视频解析API服务
 */
export class ThirdPartyParser {
  /**
   * 调用免费解析API
   */
  static async parseWithApi(url: string): Promise<any> {
    return new Promise((resolve) => {
      try {
        console.log(`调用第三方解析API: ${url}`);

        // 使用多个免费解析API作为备选
        const apis = [
          // API 1: 夜雨视频解析
          (videoUrl: string) => `https://api.yeyup.com/api.php?url=${encodeURIComponent(videoUrl)}`,
          // API 2: 视频解析API
          (videoUrl: string) => `https://douyin.iiilab.com/analyze?link=${encodeURIComponent(videoUrl)}`,
          // API 3: 备用解析API
          (videoUrl: string) => `https://api.pearktrue.com/?url=${encodeURIComponent(videoUrl)}`
        ];

        // 尝试第一个API
        this.tryApi(apis[0](url), 0, apis, url, resolve);

      } catch (error) {
        console.error('第三方解析失败:', error);
        resolve({
          success: false,
          error: '解析服务暂时不可用，请稍后重试'
        });
      }
    });
  }

  /**
   * 尝试多个解析API
   */
  private static async tryApi(
    apiUrl: string, 
    index: number, 
    apis: Array<(url: string) => string>,
    originalUrl: string,
    resolve: (result: any) => void
  ) {
    try {
      let parsedApiUrl: URL;
      try {
        parsedApiUrl = new URL(apiUrl);
      } catch (error) {
        if (index < apis.length - 1) {
          this.tryApi(apis[index + 1](originalUrl), index + 1, apis, originalUrl, resolve);
          return;
        }
        resolve({
          success: false,
          error: '所有解析API都不可用'
        });
        return;
      }

      const protocol = parsedApiUrl.protocol === 'https:' ? https : http;

      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Referer': apiUrl,
          'Accept': 'application/json, text/plain, */*'
        },
        timeout: 10000
      };

      console.log(`尝试解析API ${index + 1}: ${parsedApiUrl.hostname}`);

      const req = protocol.get(apiUrl, options, (response) => {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        response.on('end', async () => {
          try {
            const result = this.parseApiResponse(data, originalUrl);
            if (result.success) {
              resolve(result);
            } else if (index < apis.length - 1) {
              this.tryApi(apis[index + 1](originalUrl), index + 1, apis, originalUrl, resolve);
            } else {
              resolve(result);
            }
          } catch (error) {
            if (index < apis.length - 1) {
              this.tryApi(apis[index + 1](originalUrl), index + 1, apis, originalUrl, resolve);
            } else {
              resolve({
                success: false,
                error: '解析服务暂时不可用'
              });
            }
          }
        });
      });

      req.on('error', (error) => {
        console.error(`API ${index + 1} 错误:`, error.message);
        if (index < apis.length - 1) {
          this.tryApi(apis[index + 1](originalUrl), index + 1, apis, originalUrl, resolve);
        } else {
          resolve({
            success: false,
            error: '所有解析服务都暂时不可用，请稍后重试'
          });
        }
      });

      req.on('timeout', () => {
        req.destroy();
        if (index < apis.length - 1) {
          this.tryApi(apis[index + 1](originalUrl), index + 1, apis, originalUrl, resolve);
        } else {
          resolve({
            success: false,
            error: '解析超时，请稍后重试'
          });
        }
      });

    } catch (error) {
      console.error(`API ${index + 1} 异常:`, error);
      if (index < apis.length - 1) {
        this.tryApi(apis[index + 1](originalUrl), index + 1, apis, originalUrl, resolve);
      } else {
        resolve({
          success: false,
          error: '解析服务暂时不可用'
        });
      }
    }
  }

  /**
   * 解析API响应
   */
  private static parseApiResponse(responseData: string, originalUrl: string): any {
    try {
      let jsonData: any;
      try {
        jsonData = JSON.parse(responseData);
      } catch (e) {
        const match = responseData.match(/\{[\s\S]*\}/);
        if (match) {
          jsonData = JSON.parse(match[0]);
        } else {
          return {
            success: false,
            error: '无法解析API响应'
          };
        }
      }

      console.log('API响应:', JSON.stringify(jsonData, null, 2));

      let videoUrl = null;
      let title = null;
      let coverUrl = null;

      if (jsonData.code === 200 && jsonData.data) {
        if (jsonData.data.url) videoUrl = jsonData.data.url;
        if (jsonData.data.video) videoUrl = jsonData.data.video;
        if (jsonData.data.playurl) videoUrl = jsonData.data.playurl;
        if (jsonData.data.title) title = jsonData.data.title;
        if (jsonData.data.cover) coverUrl = jsonData.data.cover;
        if (jsonData.data.pic) coverUrl = jsonData.data.pic;
      }

      if (!videoUrl && jsonData.video) {
        videoUrl = jsonData.video;
        if (jsonData.title) title = jsonData.title;
        if (jsonData.cover) coverUrl = jsonData.cover;
      }

      if (!videoUrl && jsonData.result && jsonData.result.url) {
        videoUrl = jsonData.result.url;
        if (jsonData.result.title) title = jsonData.result.title;
      }

      if (!videoUrl && jsonData.data && jsonData.data.video_url) {
        videoUrl = jsonData.data.video_url;
        if (jsonData.data.title) title = jsonData.data.title;
      }

      if (!videoUrl && jsonData.url) {
        videoUrl = jsonData.url;
      }

      if (videoUrl) {
        console.log(`解析成功，视频地址: ${videoUrl}`);
        return {
          success: true,
          videoUrl: videoUrl,
          title: title || '视频',
          coverUrl: coverUrl,
          originalUrl: originalUrl
        };
      }

      return {
        success: false,
        error: '未找到视频地址，请尝试其他链接'
      };

    } catch (error) {
      console.error('解析API响应失败:', error);
      return {
        success: false,
        error: '解析响应失败'
      };
    }
  }
}

export interface PlatformInfo {
  type: string;
  name: string;
  id: string;
  url: string;
}

export class VideoParser {
  
  static detectPlatform(url: string): PlatformInfo | null {
    try {
      // 清理URL，只保留基础URL（去除查询参数）
      const cleanUrl = url.split('?')[0];
      
      const parsedUrl = new URL(cleanUrl);
      const hostname = parsedUrl.hostname.toLowerCase();

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

      if (hostname.includes('douyin.com') || hostname.includes('v.douyin.com')) {
        return {
          type: 'douyin',
          name: '抖音',
          id: 'unknown',
          url: url
        };
      }

      if (hostname.includes('kuaishou.com') || hostname.includes('v.kuaishou.com')) {
        return {
          type: 'kuaishou',
          name: '快手',
          id: 'unknown',
          url: url
        };
      }

      if (hostname.includes('xiaohongshu.com') || hostname.includes('xhslink.com')) {
        return {
          type: 'xiaohongshu',
          name: '小红书',
          id: 'unknown',
          url: url
        };
      }

      if (hostname.includes('weibo.com') || hostname.includes('m.weibo.cn')) {
        return {
          type: 'weibo',
          name: '微博',
          id: 'unknown',
          url: url
        };
      }

      if (hostname.includes('ixigua.com') || hostname.includes('v.ixigua.com')) {
        return {
          type: 'xigua',
          name: '西瓜视频',
          id: 'unknown',
          url: url
        };
      }

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

  static async parseAndDownload(videoUrl: string): Promise<any> {
    // 清理URL，去除查询参数
    const cleanUrl = videoUrl.split('?')[0];
    
    const platformInfo = this.detectPlatform(cleanUrl);

    if (!platformInfo) {
      return {
        success: false,
        error: '无法识别该链接格式，请检查链接是否正确'
      };
    }

    console.log(`识别到平台: ${platformInfo.name}`);

    if (platformInfo.type === 'direct') {
      console.log('直链视频，直接下载');
      return await this.downloadVideo(platformInfo.url);
    }

    console.log('尝试第三方API解析...');
    // 传递清理后的URL给解析API
    const parseResult = await ThirdPartyParser.parseWithApi(cleanUrl);

    if (parseResult.success && parseResult.videoUrl) {
      console.log('第三方解析成功，开始下载视频');
      const downloadResult = await this.downloadVideo(parseResult.videoUrl);
      
      if (downloadResult.success) {
        return {
          success: true,
          data: {
            ...downloadResult.data,
            title: parseResult.title || downloadResult.data.fileName,
            description: `解析自 ${platformInfo.name}`,
            coverUrl: parseResult.coverUrl
          }
        };
      } else {
        return downloadResult;
      }
    }

    const platforms = ['bilibili', 'douyin', 'kuaishou', 'xiaohongshu', 'weibo', 'xigua'];
    const isSupportedPlatform = platforms.includes(platformInfo.type);

    if (isSupportedPlatform) {
      return {
        success: false,
        error: `检测到${platformInfo.name}视频\n\n当前解析服务暂时不可用。\n\n建议方案：\n1. 等待稍后重试解析服务\n2. 使用其他视频下载工具获取MP4直链\n3. 直接上传本地MP4文件进行剪辑`,
        platform: platformInfo
      };
    }

    return {
      success: false,
      error: `暂不支持该平台的解析。\n\n建议方案：\n1. 使用其他视频下载工具获取MP4直链\n2. 直接上传本地视频文件\n\n当前支持的格式：\n• 直链视频 (.mp4, .webm, .mov)\n• B站、抖音、快手等平台（需解析服务在线）`,
      platform: platformInfo
    };
  }

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
