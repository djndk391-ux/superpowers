/**
 * 视频平台识别器
 * 支持识别B站、抖音、快手、小红书、微博等主流平台
 */

export interface PlatformInfo {
  type: string;
  name: string;
  id: string;
  url: string;
}

export class PlatformDetector {
  static detect(url: string): PlatformInfo | null {
    try {
      const parsedUrl = new URL(url);

      // B站检测
      const bilibili = this.detectBilibili(url, parsedUrl);
      if (bilibili) return bilibili;

      // 抖音检测
      const douyin = this.detectDouyin(url, parsedUrl);
      if (douyin) return douyin;

      // 快手检测
      const kuaishou = this.detectKuaishou(url, parsedUrl);
      if (kuaishou) return kuaishou;

      // 小红书检测
      const xiaohongshu = this.detectXiaohongshu(url, parsedUrl);
      if (xiaohongshu) return xiaohongshu;

      // 微博检测
      const weibo = this.detectWeibo(url, parsedUrl);
      if (weibo) return weibo;

      // 西瓜视频
      const xigua = this.detectXigua(url, parsedUrl);
      if (xigua) return xigua;

      // 检查是否是直接的视频链接
      const directVideo = this.detectDirectVideo(url);
      if (directVideo) return directVideo;

    } catch (e) {
      console.log('URL解析失败:', e);
    }

    return null;
  }

  private static detectBilibili(url: string, parsedUrl: URL): PlatformInfo | null {
    const host = parsedUrl.hostname;
    if (host.includes('bilibili.com') || host.includes('b23.tv')) {
      // 匹配BV号
      const bvMatch = url.match(/BV[0-9A-Za-z]{10}/);
      if (bvMatch) {
        return {
          type: 'bilibili',
          name: '哔哩哔哩',
          id: bvMatch[0],
          url: url
        };
      }
      // 匹配AV号
      const avMatch = url.match(/av(\d+)/);
      if (avMatch) {
        return {
          type: 'bilibili',
          name: '哔哩哔哩',
          id: avMatch[0],
          url: url
        };
      }
    }
    return null;
  }

  private static detectDouyin(url: string, parsedUrl: URL): PlatformInfo | null {
    const host = parsedUrl.hostname;
    if (host.includes('douyin.com') || host.includes('v.douyin.com')) {
      // 匹配视频ID
      const videoMatch = url.match(/video\/([0-9]+)/);
      if (videoMatch) {
        return {
          type: 'douyin',
          name: '抖音',
          id: videoMatch[1],
          url: url
        };
      }
      // 短链接或其他格式
      return {
        type: 'douyin',
        name: '抖音',
        id: 'unknown',
        url: url
      };
    }
    return null;
  }

  private static detectKuaishou(url: string, parsedUrl: URL): PlatformInfo | null {
    const host = parsedUrl.hostname;
    if (host.includes('kuaishou.com') || host.includes('v.kuaishou.com')) {
      return {
        type: 'kuaishou',
        name: '快手',
        id: 'unknown',
        url: url
      };
    }
    return null;
  }

  private static detectXiaohongshu(url: string, parsedUrl: URL): PlatformInfo | null {
    const host = parsedUrl.hostname;
    if (host.includes('xiaohongshu.com') || host.includes('xhslink.com')) {
      return {
        type: 'xiaohongshu',
        name: '小红书',
        id: 'unknown',
        url: url
      };
    }
    return null;
  }

  private static detectWeibo(url: string, parsedUrl: URL): PlatformInfo | null {
    const host = parsedUrl.hostname;
    if (host.includes('weibo.com') || host.includes('m.weibo.cn')) {
      return {
        type: 'weibo',
        name: '微博',
        id: 'unknown',
        url: url
      };
    }
    return null;
  }

  private static detectXigua(url: string, parsedUrl: URL): PlatformInfo | null {
    const host = parsedUrl.hostname;
    if (host.includes('ixigua.com') || host.includes('v.ixigua.com')) {
      return {
        type: 'xigua',
        name: '西瓜视频',
        id: 'unknown',
        url: url
      };
    }
    return null;
  }

  private static detectDirectVideo(url: string): PlatformInfo | null {
    // 检查是否是直接的视频文件链接
    const videoExtensions = ['.mp4', '.webm', '.mov', '.flv', '.m3u8', '.m4v'];
    const lowercaseUrl = url.toLowerCase();
    
    for (const ext of videoExtensions) {
      if (lowercaseUrl.includes(ext)) {
        return {
          type: 'direct',
          name: '直链视频',
          id: 'direct',
          url: url
        };
      }
    }
    
    return null;
  }
}
