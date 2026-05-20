/**
 * B站视频解析器
 * 使用B站官方API实现稳定解析
 */
import { BaseParser, ParseResult } from './base-parser.js'
import https from 'https'
import fs from 'fs'
import path from 'path'
import { withRetry } from '../utils/errors.js'

// 视频质量选项
export const VIDEO_QUALITY_OPTIONS = [
  { qn: 112, name: '1080P+ (高码率)' },
  { qn: 80, name: '1080P (高清)' },
  { qn: 64, name: '720P (准高清)', default: true },
  { qn: 32, name: '480P (标清)' },
  { qn: 16, name: '360P (流畅)' },
]

export interface BilibiliParseOptions {
  quality?: number
}

export class BilibiliParser extends BaseParser {
  name = 'B站解析器'
  platform = 'bilibili'
  private downloadDir = path.join(process.cwd(), 'downloads')

  canHandle(url: string, platformInfo: any): boolean {
    return platformInfo && platformInfo.type === 'bilibili'
  }

  async parse(url: string, id?: string, options?: BilibiliParseOptions): Promise<ParseResult> {
    try {
      console.log(`开始解析B站视频: ${url}, ID: ${id}`)

      // 提取BV号
      const bvMatch = url.match(/BV[0-9A-Za-z]{10}/)
      const bvId = bvMatch ? bvMatch[0] : id

      if (!bvId) {
        return {
          success: false,
          error: '未能找到有效的BV号'
        }
      }

      console.log(`提取到BV号: ${bvId}`)

      // 步骤1: 获取视频信息（带重试）
      const videoInfo = await withRetry(
        () => this.getVideoInfo(bvId),
        { maxRetries: 2, initialDelay: 500 }
      )
      
      if (!videoInfo) {
        return {
          success: false,
          error: '无法获取视频信息，请检查BV号是否正确'
        }
      }

      console.log(`获取到视频信息: ${videoInfo.title}`)

      // 步骤2: 获取视频下载链接（带重试）
      const quality = options?.quality || 64
      const downloadUrl = await withRetry(
        () => this.getDownloadUrl(bvId, videoInfo.cid, quality),
        { maxRetries: 2, initialDelay: 500 }
      )
      
      if (!downloadUrl) {
        return {
          success: false,
          error: '无法获取视频下载链接'
        }
      }

      console.log(`获取到下载链接，开始下载...`)

      // 步骤3: 下载视频（带重试）
      const filePath = await withRetry(
        () => this.downloadVideo(downloadUrl, videoInfo.title),
        { maxRetries: 2, initialDelay: 1000 }
      )
      
      if (!filePath) {
        return {
          success: false,
          error: '视频下载失败'
        }
      }

      return {
        success: true,
        title: videoInfo.title,
        description: videoInfo.desc || '',
        duration: videoInfo.duration,
        videoUrl: filePath,
        thumbnail: videoInfo.pic,
        author: videoInfo.owner?.name || '未知',
        platform: 'bilibili',
        metadata: {
          bvid: bvId,
          aid: videoInfo.aid,
          cid: videoInfo.cid,
          view: videoInfo.stat?.view || 0,
          like: videoInfo.stat?.like || 0,
          quality,
        }
      }

    } catch (error) {
      console.error('B站解析错误:', error)
      return {
        success: false,
        error: '解析B站视频时发生错误: ' + (error instanceof Error ? error.message : '未知错误')
      }
    }
  }

  /**
   * 获取视频基本信息
   */
  private async getVideoInfo(bvid: string): Promise<any> {
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.bilibili.com',
        path: `/x/web-interface/view?bvid=${bvid}`,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com/',
          'Accept': 'application/json'
        }
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => data += chunk)
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.code === 0 && json.data) {
              resolve(json.data)
            } else {
              console.error('API返回错误:', json.message)
              resolve(null)
            }
          } catch (e) {
            console.error('解析API响应失败:', e)
            resolve(null)
          }
        })
      })

      req.on('error', (e) => {
        console.error('请求视频信息失败:', e)
        resolve(null)
      })

      req.end()
    })
  }

  /**
   * 获取视频下载链接
   */
  private async getDownloadUrl(bvid: string, cid: number, qn: number = 64): Promise<string | null> {
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.bilibili.com',
        path: `/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=${qn}&fnval=0&fnver=0&otype=json`,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': `https://www.bilibili.com/video/${bvid}/`,
          'Accept': 'application/json'
        }
      }

      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => data += chunk)
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.code === 0 && json.data?.durl?.[0]?.url) {
              resolve(json.data.durl[0].url)
            } else {
              console.error('获取下载链接失败:', json.message)
              resolve(null)
            }
          } catch (e) {
            console.error('解析下载链接失败:', e)
            resolve(null)
          }
        })
      })

      req.on('error', (e) => {
        console.error('请求下载链接失败:', e)
        resolve(null)
      })

      req.end()
    })
  }

  /**
   * 下载视频文件
   */
  private async downloadVideo(url: string, title: string): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        // 确保下载目录存在
        if (!fs.existsSync(this.downloadDir)) {
          fs.mkdirSync(this.downloadDir, { recursive: true })
        }

        // 清理文件名
        const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100)
        const filePath = path.join(this.downloadDir, `${safeTitle}.mp4`)

        console.log(`开始下载视频到: ${filePath}`)

        const req = https.request(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.bilibili.com/',
          }
        }, (res) => {
          // 处理重定向
          if (res.statusCode === 302 || res.statusCode === 301) {
            const redirectUrl = res.headers.location
            if (redirectUrl) {
              console.log('检测到重定向:', redirectUrl.substring(0, 100))
              this.downloadVideo(redirectUrl, title).then(resolve)
              return
            }
          }

          const fileStream = fs.createWriteStream(filePath)
          let downloadedBytes = 0
          const totalBytes = parseInt(res.headers['content-length'] || '0', 10)
          let lastUpdateTime = Date.now()

          res.on('data', (chunk) => {
            downloadedBytes += chunk.length
            
            const now = Date.now()
            if (now - lastUpdateTime > 2000) { // 每2秒打印一次进度
              if (totalBytes > 0) {
                const progress = Math.round((downloadedBytes / totalBytes) * 100)
                console.log(`下载进度: ${progress}% (${(downloadedBytes / 1024 / 1024).toFixed(2)}MB / ${(totalBytes / 1024 / 1024).toFixed(2)}MB)`)
              } else {
                console.log(`下载中: ${(downloadedBytes / 1024 / 1024).toFixed(2)}MB`)
              }
              lastUpdateTime = now
            }
          })

          res.pipe(fileStream)

          fileStream.on('finish', () => {
            fileStream.close()
            console.log(`下载完成: ${filePath}`)
            resolve(filePath)
          })

          fileStream.on('error', (err) => {
            console.error('写入文件失败:', err)
            if (fs.existsSync(filePath)) {
              fs.unlink(filePath, () => {})
            }
            resolve(null)
          })
        })

        req.on('error', (e) => {
          console.error('下载请求失败:', e)
          resolve(null)
        })

        req.end()

      } catch (error) {
        console.error('下载过程出错:', error)
        resolve(null)
      }
    })
  }
}
