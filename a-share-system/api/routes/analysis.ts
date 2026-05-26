import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import {
  generateMockMarketData,
  generateMockAnalysis,
  generateMockRiskAssessment,
  generateMockStrategy,
  generateMockDecision,
} from '../utils/mockData.js';

const router = express.Router();

// 获取市场数据
router.get('/market-data', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = generateMockMarketData();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// 分析市场
router.post('/analyze', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = generateMockAnalysis();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// 风险评估
router.post('/assess-risk', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = generateMockRiskAssessment();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// 生成策略
router.post('/generate-strategy', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = generateMockStrategy();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// 综合决策
router.post('/make-decision', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = generateMockDecision();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
