/**
 * 视频下载路由
 */

import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VideoParser } from '../services/video-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// 确保上传目录存在
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 解析并下载视频API
router.post('/parse', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({
        success: false,
        error: '缺少视频URL'
      });
      return;
    }

    console.log(`开始解析视频链接: ${url}`);

    // 使用VideoParser解析并下载
    const result = await VideoParser.parseAndDownload(url);

    res.json(result);

  } catch (error) {
    console.error('解析过程出错:', error);
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
