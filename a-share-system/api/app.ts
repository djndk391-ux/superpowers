/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import analysisRoutes from './routes/analysis.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * Root welcome page
 */
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>A股热点轮动交易系统 - API Server</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
        }
        .container {
          text-align: center;
          padding: 40px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-width: 600px;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 20px;
          background: linear-gradient(90deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .status {
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
          padding: 12px 24px;
          border-radius: 8px;
          display: inline-block;
          margin-bottom: 24px;
        }
        .api-list {
          text-align: left;
          background: rgba(0, 0, 0, 0.2);
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .api-item {
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .api-item:last-child {
          border-bottom: none;
        }
        .method {
          background: #3b82f6;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          margin-right: 10px;
        }
        .link {
          color: #60a5fa;
          text-decoration: none;
        }
        .link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📈 A股热点轮动交易系统</h1>
        <div class="status">✅ 后端 API 服务器运行正常</div>
        <p>前端界面请访问：<a href="http://localhost:5173/" class="link">http://localhost:5173/</a></p>
        
        <div class="api-list">
          <h3 style="margin-top:0;">可用的 API：</h3>
          <div class="api-item">
            <span class="method">GET</span>
            <a href="/api/health" class="link">/api/health</a> - 健康检查
          </div>
          <div class="api-item">
            <span class="method">GET</span>
            <a href="/api/market-data" class="link">/api/market-data</a> - 获取市场数据
          </div>
          <div class="api-item">
            <span class="method">POST</span>
            /api/analyze - 分析市场
          </div>
          <div class="api-item">
            <span class="method">POST</span>
            /api/assess-risk - 风险评估
          </div>
          <div class="api-item">
            <span class="method">POST</span>
            /api/generate-strategy - 生成策略
          </div>
          <div class="api-item">
            <span class="method">POST</span>
            /api/make-decision - 综合决策
          </div>
        </div>
      </div>
    </body>
    </html>
  `)
})

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api', analysisRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
