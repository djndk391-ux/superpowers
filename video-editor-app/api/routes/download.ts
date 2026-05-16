/**
 * 视频下载路由
 */

import { Router, Request, Response } from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// 生成唯一ID的简单函数
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 确保上传目录存在
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 下载视频API
router.post('/download', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({
        success: false,
        error: '缺少视频URL'
      });
      return;
    }

    // 验证URL格式
    let videoUrl: URL;
    try {
      videoUrl = new URL(url);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: '无效的URL格式'
      });
      return;
    }

    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(videoUrl.protocol)) {
      res.status(400).json({
        success: false,
        error: '只支持 http 或 https 链接'
      });
      return;
    }

    // 生成唯一文件名
    const fileId = uuidv4();
    const fileName = `${fileId}.mp4`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    console.log(`开始下载视频: ${url}`);
    console.log(`保存到: ${filePath}`);

    // 使用流下载文件
    const protocol = videoUrl.protocol === 'https:' ? https : http;
    
    const file = fs.createWriteStream(filePath);

    protocol.get(videoUrl.href, (response) => {
      // 检查响应状态
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filePath);
        res.status(400).json({
          success: false,
          error: `下载失败，服务器返回状态码: ${response.statusCode}`
        });
        return;
      }

      // 检查内容类型
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('video') && !contentType.includes('octet-stream')) {
        console.log(`警告: 内容类型不是视频类型: ${contentType}`);
        // 继续下载，因为某些服务器可能不返回正确的content-type
      }

      // 获取文件大小
      const contentLength = response.headers['content-length'];
      let downloadedBytes = 0;
      const totalBytes = contentLength ? parseInt(contentLength) : 0;

      response.on('data', (chunk: Buffer) => {
        downloadedBytes += chunk.length;
        if (totalBytes > 0) {
          const progress = Math.round((downloadedBytes / totalBytes) * 100);
          console.log(`下载进度: ${progress}%`);
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`视频下载完成: ${filePath}`);
        
        // 获取文件大小
        const stats = fs.statSync(filePath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        res.json({
          success: true,
          data: {
            fileId: fileId,
            fileName: fileName,
            filePath: `/uploads/${fileName}`,
            fileSize: stats.size,
            fileSizeInMB: fileSizeInMB
          }
        });
      });

      file.on('error', (err) => {
        console.error('文件写入错误:', err);
        file.close();
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(500).json({
          success: false,
          error: '文件写入失败'
        });
      });
    }).on('error', (err) => {
      console.error('下载错误:', err);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(500).json({
        success: false,
        error: `下载失败: ${err.message}`
      });
    });

  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
});

// 获取下载的文件
router.get('/files/:fileId', (req: Request, res: Response) => {
  const { fileId } = req.params;
  const filePath = path.join(UPLOAD_DIR, `${fileId}.mp4`);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({
      success: false,
      error: '文件不存在'
    });
    return;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    };
    
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

export default router;
