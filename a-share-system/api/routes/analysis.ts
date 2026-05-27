import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import fetch from 'node-fetch';
import {
  generateMockMarketData,
  generateMockAnalysis,
  generateMockRiskAssessment,
  generateMockStrategy,
  generateMockDecision,
} from '../utils/mockData.js';

const router = express.Router();

// 带重试的fetch请求
async function fetchWithRetry(url: string, retries = 3, timeout = 15000) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (i === retries - 1) {
        console.error(`请求失败，已重试${retries}次:`, url);
        throw error;
      }
      console.log(`请求失败，正在重试 (${i + 1}/${retries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// 从东方财富获取真实板块数据
async function fetchEastMoneySectors() {
  try {
    const url = 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50&po=1&np=1&fltt=2&fid=f3&fs=m:90+t:2+f:!50&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152,f133,f108';
    
    console.log('正在获取东方财富板块数据...');
    const data = await fetchWithRetry(url) as any;
    console.log('东方财富板块数据获取成功！');
    
    if (data && data.data && data.data.diff) {
      return data.data.diff.slice(0, 10).map((item: any) => ({
        id: `sector_${item.f12}`,
        name: item.f14,
        changePercent: item.f3,
        volume: item.f6,
        leaderStocks: getLeaderStocksForSector(item.f14),
        source: '东方财富',
        dataType: '真实API',
        timestamp: new Date().toISOString()
      }));
    }
    
    return null;
  } catch (error) {
    console.error('获取东方财富板块数据失败:', error);
    return null;
  }
}

// 获取板块对应的龙头股
function getLeaderStocksForSector(sectorName: string) {
  const sectorLeaders: Record<string, string[]> = {
    '人工智能': ['寒武纪', '科大讯飞', '昆仑万维'],
    '新能源': ['宁德时代', '比亚迪', '天齐锂业'],
    '芯片': ['中芯国际', '北方华创', '韦尔股份'],
    '消费电子': ['立讯精密', '歌尔股份', '蓝思科技'],
    '医药生物': ['恒瑞医药', '药明康德', '迈瑞医疗'],
    '金融': ['中国平安', '招商银行', '兴业银行'],
    '房地产': ['万科A', '保利发展', '金地集团']
  };
  
  // 模糊匹配
  for (const [key, leaders] of Object.entries(sectorLeaders)) {
    if (sectorName.includes(key) || key.includes(sectorName)) {
      return leaders;
    }
  }
  
  return ['寒武纪', '科大讯飞']; // 默认
}

// 从东方财富获取真实个股数据
async function fetchEastMoneyStocks() {
  // 减少股票数量，提高成功率
  const stockCodes = ['0.300223', '0.300750'];
  const stocks = [];
  
  console.log('正在获取东方财富个股数据...');
  
  for (const secid of stockCodes) {
    try {
      const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f107,f116,f117,f127,f152,f161,f162,f163,f164,f165,f166,f167,f168,f169,f170`;
      
      const data = await fetchWithRetry(url, 2, 10000) as any;
      
      if (data && data.data) {
        const stock = data.data;
        stocks.push({
          id: `stock_${secid.split('.')[1]}`,
          code: secid.split('.')[1],
          name: stock.f58,
          price: stock.f43,
          changePercent: stock.f170,
          volume: stock.f47,
          isLeader: true,
          sectorId: 'unknown',
          source: '东方财富',
          dataType: '真实API',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`获取股票 ${secid} 数据失败:`, error);
    }
  }
  
  console.log(`个股数据获取完成，共获取 ${stocks.length} 只股票`);
  
  return stocks.length > 0 ? stocks : null;
}

// 获取真实市场数据（综合）
async function fetchRealMarketData() {
  try {
    const [sectors, stocks] = await Promise.all([
      fetchEastMoneySectors(),
      fetchEastMoneyStocks()
    ]);
    
    const mockData = generateMockMarketData();
    
    return {
      ...mockData,
      sectors: sectors || mockData.sectors,
      stocks: stocks || mockData.stocks,
      dataSource: sectors ? '东方财富' : '模拟数据',
      dataType: sectors ? '真实API' : '模拟数据',
      collectionTime: new Date().toISOString()
    };
  } catch (error) {
    console.error('获取真实市场数据失败:', error);
    return {
      ...generateMockMarketData(),
      dataSource: '模拟数据',
      dataType: '模拟数据',
      collectionTime: new Date().toISOString()
    };
  }
}

// 获取市场数据（真实API优先，失败时降级到模拟数据）
router.get('/market-data', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchRealMarketData();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// 新的接口：专门用于获取真实API数据（不降级）
router.get('/real-market-data', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sectors = await fetchEastMoneySectors();
    const stocks = await fetchEastMoneyStocks();
    
    if (!sectors && !stocks) {
      res.status(200).json({
        success: false,
        error: '无法获取真实数据',
        data: null
      });
      return;
    }
    
    const mockData = generateMockMarketData();
    
    res.status(200).json({
      success: true,
      data: {
        ...mockData,
        sectors: sectors || mockData.sectors,
        stocks: stocks || mockData.stocks,
        fundFlow: mockData.fundFlow,
        news: mockData.news,
        dataSource: '东方财富',
        dataType: '真实API',
        collectionTime: new Date().toISOString()
      }
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
