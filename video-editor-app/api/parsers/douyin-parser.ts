/**
 * 抖音视频解析器
 * 支持抖音分享链接解析，获取无水印视频、封面、音频
 */
import { BaseParser, ParseResult } from './base-parser.js'
import https from 'https'
import http from 'http'
import path from 'path'
import fs from 'fs'
import { URL } from 'url'
import { withRetry, VideoParserError, ERROR_CODES } from '../utils/errors.js'

export class DouyinParser extends BaseParser {
  name = '抖音解析器'
  platform = 'douyin'
  private downloadDir = path.join(process.cwd(), 'downloads')
  
  // 模拟iPhone Safari浏览器
  private headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  }

  canHandle(url: string, platformInfo: any): boolean {
    return platformInfo && platformInfo.type === 'douyin'
  }

  async parse(url: string, id?: string): Promise<ParseResult> {
    try {
      console.log('[INFO] 开始解析抖音视频:', url)

      // 1. 短链还原
      const realUrl = await this.expandShortUrl(url)
      if (!realUrl) {
        return {
          success: false,
          error: '短链还原失败'
        }
      }
      console.log('[INFO] 短链还原完成:', realUrl)

      // 2. 提取视频ID
      const awemeId = this.extractAwemeId(realUrl)
      if (!awemeId) {
        return {
          success: false,
          error: '无法提取视频ID'
        }
      }
      console.log('[SUCCESS] 提取视频ID:', awemeId)

      // 3. 获取视频详情
      const videoData = await withRetry(
        () => this.getVideoDetail(awemeId),
        { maxRetries: 3, initialDelay: 1000 }
      )
      
      if (!videoData) {
        return {
          success: false,
          error: '获取视频详情失败'
        }
      }

      // 4. 解析数据并下载
      const result = await this.parseAndDownload(videoData)
      return result

    } catch (error) {
      console.error('[ERROR] 抖音解析错误:', error)
      return {
        success: false,
        error: '解析抖音视频时发生错误: ' + (error instanceof Error ? error.message : '未知错误')
      }
    }
  }

  /**
   * 步骤1: 短链还原 - 获取真实链接
   */
  private async expandShortUrl(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      const protocol = url.startsWith('https') ? https : http
      
      const options = {
        method: 'HEAD',
        headers: this.headers,
        timeout: 10000,
      }
      
      const req = protocol.request(url, options, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const location = res.headers.location
          if (location) {
            resolve(location)
          } else {
            resolve(url)
          }
        } else if (res.statusCode === 200) {
          resolve(url)
        } else {
          resolve(null)
        }
      })
      
      req.on('error', () => resolve(null))
      req.on('timeout', () => {
        req.destroy()
        resolve(null)
      })
      
      req.setTimeout(10000)
      req.end()
    })
  }

  /**
   * 从链接中提取视频ID
   */
  private extractAwemeId(url: string): string | null {
    // 多种匹配模式
    const patterns = [
      /\/video\/(\d+)/,
      /\/note\/(\d+)/,
      /aweme_id=(\d+)/,
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    return null
  }

  /**
   * 步骤2: 获取视频详情
   */
  private async getVideoDetail(awemeId: string): Promise<any> {
    return new Promise((resolve) => {
      const apiUrl = `https://www.iesdouyin.com/aweme/v1/web/aweme/detail/?aweme_id=${awemeId}&aid=6383`
      
      const req = https.get(apiUrl, { headers: this.headers, timeout: 10000 }, (res) => {
        let data = ''
        res.on('data', (chunk) => data += chunk)
        res.on('end', () => {
          try {
            const result = JSON.parse(data)
            if (result.status_code === 0) {
              console.log('[SUCCESS] 获取视频详情成功')
              resolve(result)
            } else {
              console.error('[ERROR] API返回错误:', result.status_msg)
              resolve(null)
            }
          } catch (e) {
            console.error('[ERROR] 解析JSON失败')
            resolve(null)
          }
        })
      })
      
      req.on('error', () => resolve(null))
      req.setTimeout(10000, () => {
        req.destroy()
        resolve(null)
      })
    })
  }

  /**
   * 步骤3: 去水印处理
   */
  private removeWatermark(url: string): string {
    if (!url) return url
    if (url.includes('playwm')) {
      return url.replace('playwm', 'play')
    }
    if (url.includes('wm=1')) {
      return url.replace('wm=1', 'wm=0')
    }
    return url
  }

  /**
   * 解析数据并下载视频
   */
  private async parseAndDownload(data: any): Promise<ParseResult> {
    const awemeData = data.aweme_detail
    const videoData = awemeData?.video
    const musicData = awemeData?.music
    
    // 提取标题
    const title = awemeData?.desc || '抖音视频'
    
    // 提取封面
    let coverUrl = ''
    const coverList = videoData?.cover?.url_list
    if (coverList && coverList.length > 0) {
      coverUrl = coverList[0]
    }
    
    // 提取无水印视频链接
    let videoUrl = ''
    const playUrlList = videoData?.play_addr?.url_list
    if (playUrlList && playUrlList.length > 0) {
      videoUrl = this.removeWatermark(playUrlList[0])
    }
    
    // 提取背景音乐
    let musicUrl = ''
    const musicUrlList = musicData?.play_url?.url_list
    if (musicUrlList && musicUrlList.length > 0) {
      musicUrl = musicUrlList[0]
    }
    
    // 提取作者
    const author = awemeData?.author?.nickname || '未知作者'
    
    if (!videoUrl) {
      return {
        success: false,
        error: '无法获取视频链接'
      }
    }
    
    // 下载视频
    const downloadedPath = await this.downloadVideo(videoUrl, title)
    
    if (!downloadedPath) {
      return {
        success: false,
        error: '视频下载失败'
      }
    }
    
    return {
      success: true,
      title: title,
      description: title,
      videoUrl: downloadedPath,
      thumbnail: coverUrl,
      author: author,
      platform: 'douyin',
      metadata: {
        awemeId: awemeData?.aweme_id || '',
        musicUrl: musicUrl,
      }
    }
  }

  /**
   * 下载视频文件
   */
  private async downloadVideo(url: string, title: string): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        // 确保目录存在
        if (!fs.existsSync(this.downloadDir)) {
          fs.mkdirSync(this.downloadDir, { recursive: true })
        }
        
        // 安全的文件名
        const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 80)
        const filePath = path.join(this.downloadDir, `${Date.now()}_${safeTitle}.mp4`)
        
        console.log('[INFO] 开始下载视频到:', filePath)
        
        const protocol = url.startsWith('https') ? https : http
        const req = protocol.get(url, { headers: this.headers }, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            const redirectUrl = res.headers.location
            if (redirectUrl) {
              this.downloadVideo(redirectUrl, title).then(resolve)
              return
            }
          }
          
          const fileStream = fs.createWriteStream(filePath)
          let downloadedBytes = 0
          const totalBytes = parseInt(res.headers['content-length'] || '0', 10)
          let lastUpdate = Date.now()
          
          res.on('data', (chunk) => {
            downloadedBytes += chunk.length
            
            const now = Date.now()
            if (now - lastUpdate > 2000) {
              const progress = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0
              console.log(`[INFO] 下载进度: ${progress}% (${(downloadedBytes / 1024 / 1024).toFixed(2)}MB)`)
              lastUpdate = now
            }
          })
          
          res.pipe(fileStream)
          
          fileStream.on('finish', () => {
            fileStream.close()
            console.log('[SUCCESS] 视频下载完成:', filePath)
            resolve(filePath)
          })
          
          fileStream.on('error', (err) => {
            console.error('[ERROR] 写入文件失败:', err)
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
            }
            resolve(null)
          })
        })
        
        req.on('error', (err) => {
          console.error('[ERROR] 下载请求失败:', err)
          resolve(null)
        })
        
      } catch (error) {
        console.error('[ERROR] 下载过程出错:', error)
        resolve(null)
      }
    })
  }
}
