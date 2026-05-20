/**
 * 文件存储管理服务
 * 统一管理视频文件和元数据
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义存储目录
const STORAGE_BASE = path.join(__dirname, '../../data');
const STORAGE_VIDEO = path.join(STORAGE_BASE, 'videos');
const STORAGE_THUMBNAIL = path.join(STORAGE_BASE, 'thumbnails');
const STORAGE_METADATA = path.join(STORAGE_BASE, 'metadata');

export interface VideoMetadata {
  fileId: string;
  originalUrl: string;
  title: string;
  platform: string;
  platformId?: string;
  duration?: number;
  fileSize: number;
  resolution?: { width: number; height: number };
  thumbnail?: string;
  author?: string;
  viewCount?: number;
  likeCount?: number;
  tags?: string[];
  downloadTime: Date;
  filePath: string;
}

export class StorageService {
  
  /**
   * 确保所有目录都存在
   */
  static ensureDirectories(): void {
    const dirs = [STORAGE_BASE, STORAGE_VIDEO, STORAGE_THUMBNAIL, STORAGE_METADATA];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * 生成安全的文件路径
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
  }

  /**
   * 生成安全的文件路径
   */
  static generateSafeFileName(originalTitle: string, extension = 'mp4'): { fileName: string; filePath: string } {
    const timestamp = Date.now();
    const fileId = this.generateId();
    // 只保留安全字符
    const safeTitle = originalTitle
      .replace(/[<>:"/\\|?*]+/g, '_')
      .substring(0, 80);
    
    const fileName = `${timestamp}_${fileId}_${safeTitle}.${extension}`;
    const filePath = path.join(STORAGE_VIDEO, fileName);
    
    return { fileName, filePath };
  }

  /**
   * 保存视频文件并记录元数据
   */
  static async saveVideo(
    tempFilePath: string,
    metadata: Omit<VideoMetadata, 'fileId' | 'downloadTime' | 'filePath' | 'fileSize'>
  ): Promise<VideoMetadata> {
    this.ensureDirectories();
    
    const fileId = this.generateId();
    const { fileName, filePath } = this.generateSafeFileName(metadata.title);
    
    // 移动或复制文件到存储目录
    fs.copyFileSync(tempFilePath, filePath);
    
    const stat = fs.statSync(filePath);
    
    const videoMetadata: VideoMetadata = {
      fileId,
      ...metadata,
      fileSize: stat.size,
      downloadTime: new Date(),
      filePath,
    };
    
    // 保存元数据
    const metadataPath = path.join(STORAGE_METADATA, `${fileId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(videoMetadata, null, 2));
    
    return videoMetadata;
  }

  /**
   * 获取文件信息
   */
  static getVideoInfo(fileId: string): VideoMetadata | null {
    const metadataPath = path.join(STORAGE_METADATA, `${fileId}.json`);
    
    if (!fs.existsSync(metadataPath)) {
      return null;
    }
    
    const data = fs.readFileSync(metadataPath, 'utf-8');
    return JSON.parse(data) as VideoMetadata;
  }

  /**
   * 删除视频文件及其元数据
   */
  static deleteVideo(fileId: string): boolean {
    const metadata = this.getVideoInfo(fileId);
    if (!metadata) return false;
    
    try {
      // 删除视频文件
      if (fs.existsSync(metadata.filePath)) {
        fs.unlinkSync(metadata.filePath);
      }
      
      // 删除元数据
      const metadataPath = path.join(STORAGE_METADATA, `${fileId}.json`);
      if (fs.existsSync(metadataPath)) {
        fs.unlinkSync(metadataPath);
      }
      
      return true;
    } catch (error) {
      console.error('删除文件失败:', error);
      return false;
    }
  }

  /**
   * 列出所有已下载的视频
   */
  static listVideos(): VideoMetadata[] {
    if (!fs.existsSync(STORAGE_METADATA)) {
      return [];
    }
    
    return fs.readdirSync(STORAGE_METADATA)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const data = fs.readFileSync(path.join(STORAGE_METADATA, file), 'utf-8');
          return JSON.parse(data) as VideoMetadata;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as VideoMetadata[];
  }

  /**
   * 清理过期文件
   */
  static cleanupOldFiles(days = 30): number {
    const videos = this.listVideos();
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    let deletedCount = 0;
    
    for (const video of videos) {
      if (new Date(video.downloadTime).getTime() < cutoffTime) {
        if (this.deleteVideo(video.fileId)) {
          deletedCount++;
        }
      }
    }
    
    return deletedCount;
  }

  /**
   * 获取视频完整路径
   */
  static getVideoPath(fileId: string): string | null {
    const metadata = this.getVideoInfo(fileId);
    return metadata ? metadata.filePath : null;
  }
}

export { STORAGE_VIDEO, STORAGE_THUMBNAIL, STORAGE_METADATA };
