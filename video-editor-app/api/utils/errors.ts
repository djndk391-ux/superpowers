/**
 * 标准化错误定义与错误处理
 */

export class VideoParserError extends Error {
  code: string
  details: any

  constructor(code: string, message: string, details?: any) {
    super(message)
    this.name = 'VideoParserError'
    this.code = code
    this.details = details
  }
}

// 预定义的错误代码
export const ERROR_CODES = {
  PARSE_ERROR: 'parse_error',
  DOWNLOAD_ERROR: 'download_error',
  PLATFORM_ERROR: 'platform_error',
  NETWORK_ERROR: 'network_error',
  INVALID_URL: 'invalid_url',
  FILE_ERROR: 'file_error',
  TIMEOUT_ERROR: 'timeout_error',
  RATE_LIMIT: 'rate_limit',
  AUTH_ERROR: 'auth_error',
  INTERNAL_ERROR: 'internal_error',
} as const

// 工具函数：重试机制
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    factor?: number
  } = {}
): Promise<T> {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000, factor = 2 } = options
  
  let lastError: any
  let currentDelay = initialDelay
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }
      
      console.log(`[Retry] 操作失败，${currentDelay}ms后重试 (${attempt + 1}/${maxRetries})`)
      
      await new Promise(resolve => setTimeout(resolve, currentDelay))
      
      // 指数退避
      currentDelay = Math.min(currentDelay * factor, maxDelay)
    }
  }
  
  throw lastError
}

// 工具函数：超时处理
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = '操作超时'
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new VideoParserError(ERROR_CODES.TIMEOUT_ERROR, errorMessage))
    }, timeoutMs)
    
    promise
      .then(result => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch(error => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}
