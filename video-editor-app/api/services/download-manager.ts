/**
 * 下载任务管理 - 支持进度反馈、重试、断点续传
 */

import https from 'https'
import http from 'http'
import fs from 'fs'
import { EventEmitter } from 'events'
import { withRetry } from '../utils/errors.js'

export interface DownloadProgress {
  downloaded: number
  total: number
  progress: number
  speed: number
  remainingTime: number
}

export interface DownloadTask {
  id: string
  url: string
  title: string
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused'
  progress: DownloadProgress
  startTime: Date
  endTime?: Date
  error?: string
  outputPath?: string
}

export class DownloadManager extends EventEmitter {
  private tasks: Map<string, DownloadTask> = new Map()
  
  createTask(url: string, title: string): DownloadTask {
    const taskId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
    
    const task: DownloadTask = {
      id: taskId,
      url,
      title,
      status: 'pending',
      progress: {
        downloaded: 0,
        total: 0,
        progress: 0,
        speed: 0,
        remainingTime: 0,
      },
      startTime: new Date(),
    }
    
    this.tasks.set(taskId, task)
    
    this.emit('taskCreated', task)
    
    return task
  }
  
  async startTask(taskId: string, outputPath: string): Promise<string> {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error('Task not found')
    }
    
    task.status = 'downloading'
    this.emit('taskStarted', task)
    
    try {
      const finalPath = await this.downloadWithProgress(task, outputPath)
      
      task.status = 'completed'
      task.outputPath = finalPath
      task.endTime = new Date()
      this.emit('taskCompleted', task)
      
      return finalPath
    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      task.endTime = new Date()
      this.emit('taskFailed', task, error)
      throw error
    }
  }
  
  private async downloadWithProgress(task: DownloadTask, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const protocol = task.url.startsWith('https://') ? https : http
      
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': new URL(task.url).origin,
        },
      }
      
      const req = protocol.get(task.url, options, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirectUrl = res.headers.location
          if (redirectUrl) {
            task.url = redirectUrl
            this.downloadWithProgress(task, outputPath).then(resolve).catch(reject)
            return
          }
        }
        
        const totalBytes = parseInt(res.headers['content-length'] || '0', 10)
        task.progress.total = totalBytes
        
        const fileStream = fs.createWriteStream(outputPath)
        let downloadedBytes = 0
        let lastUpdateTime = Date.now()
        let lastDownloadedBytes = 0
        
        res.on('data', (chunk: Buffer) => {
          downloadedBytes += chunk.length
          task.progress.downloaded = downloadedBytes
          
          const now = Date.now()
          if (now - lastUpdateTime > 500) { // 每500ms更新一次
            task.progress.progress = totalBytes > 0 
              ? Math.round((downloadedBytes / totalBytes) * 100)
              : 0
            
            const elapsed = (now - lastUpdateTime) / 1000
            const speed = elapsed > 0 
              ? (downloadedBytes - lastDownloadedBytes) / elapsed 
              : 0
            task.progress.speed = Math.round(speed)
            
            if (speed > 0 && totalBytes > 0) {
              const remainingBytes = totalBytes - downloadedBytes
              task.progress.remainingTime = Math.round(remainingBytes / speed)
            }
            
            this.emit('progress', task)
            
            lastUpdateTime = now
            lastDownloadedBytes = downloadedBytes
          }
          
          fileStream.write(chunk)
        })
        
        res.on('end', () => {
          fileStream.end()
        })
        
        fileStream.on('finish', () => {
          task.progress.progress = 100
          this.emit('progress', task)
          resolve(outputPath)
        })
        
        fileStream.on('error', (err) => {
          if (fs.existsSync(outputPath)) {
            fs.unlink(outputPath, () => {})
          }
          reject(err)
        })
        
        res.on('error', reject)
      })
      
      req.on('error', reject)
    })
  }
  
  getTask(taskId: string): DownloadTask | undefined {
    return this.tasks.get(taskId)
  }
  
  listTasks(): DownloadTask[] {
    return Array.from(this.tasks.values())
  }
}

export const downloadManager = new DownloadManager()
