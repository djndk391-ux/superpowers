import { BaseDataSourceAdapter } from './base';

// 模拟数据适配器（备用）
export class MockDataSourceAdapter extends BaseDataSourceAdapter {
  name = '模拟数据';
  isAvailable = true;
  priority = 99; // 优先级最低
  
  // 热门股票
  private readonly targetStocks = [
    { code: '300223', name: '寒武纪', sectorId: 'ai' },
    { code: '300418', name: '昆仑万维', sectorId: 'ai' },
    { code: '002230', name: '科大讯飞', sectorId: 'ai' },
    { code: '300750', name: '宁德时代', sectorId: 'newenergy' },
    { code: '002594', name: '比亚迪', sectorId: 'newenergy' },
    { code: '002475', name: '立讯精密', sectorId: 'consumerelec' },
    { code: '300142', name: '沃森生物', sectorId: 'medicine' }
  ];
  
  async getMarketSectors(): Promise<any[]> {
    console.log(`[${this.name}] 使用模拟板块数据`);
    
    const today = new Date();
    return [
      { id: 'ai', name: '人工智能', change: 5.8 + (Math.random() - 0.5) * 2.5, vol: 158000000000 + (Math.random() - 0.5) * 30000000000, leaders: ['300223', '300418', '002230'], source: this.name, timestamp: today.toISOString() },
      { id: 'newenergy', name: '新能源', change: 3.2 + (Math.random() - 0.5) * 2.0, vol: 98000000000 + (Math.random() - 0.5) * 20000000000, leaders: ['300750', '002594', '000333'], source: this.name, timestamp: today.toISOString() },
      { id: 'consumerelec', name: '消费电子', change: 2.5 + (Math.random() - 0.5) * 1.5, vol: 76000000000 + (Math.random() - 0.5) * 15000000000, leaders: ['002475', '300136', '002241'], source: this.name, timestamp: today.toISOString() },
      { id: 'medicine', name: '生物医药', change: 1.8 + (Math.random() - 0.5) * 1.2, vol: 65000000000 + (Math.random() - 0.5) * 12000000000, leaders: ['300142', '600276', '000661'], source: this.name, timestamp: today.toISOString() },
      { id: 'finance', name: '金融', change: -0.5 + (Math.random() - 0.5) * 1.0, vol: 52000000000 + (Math.random() - 0.5) * 10000000000, leaders: ['601318', '600036', '601166'], source: this.name, timestamp: today.toISOString() },
      { id: 'realestate', name: '房地产', change: -1.2 + (Math.random() - 0.5) * 1.2, vol: 38000000000 + (Math.random() - 0.5) * 8000000000, leaders: ['000002', '600048', '000656'], source: this.name, timestamp: today.toISOString() }
    ];
  }
  
  async getStockQuotes(codes: string[]): Promise<any[]> {
    console.log(`[${this.name}] 使用模拟股票数据`);
    
    const today = new Date();
    return codes.map((code) => {
      const stockInfo = this.targetStocks.find(s => s.code === code);
      const basePrices: Record<string, number> = {
        '300223': 245.80, '300418': 42.35, '002230': 58.60,
        '300750': 185.50, '002594': 268.90, '002475': 32.80,
        '300142': 48.50
      };
      
      const basePrice = basePrices[code] || 50;
      const price = basePrice + (Math.random() - 0.5) * basePrice * 0.12;
      const change = (Math.random() - 0.3) * 18;
      const volume = 400000000 + Math.random() * 1600000000;
      
      return {
        id: `stock_${code}`,
        code: code,
        name: stockInfo?.name || code,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        vol: Math.round(volume),
        leader: stockInfo ? true : false,
        sector: stockInfo?.sectorId || 'unknown',
        source: this.name,
        timestamp: today.toISOString()
      };
    });
  }
  
  async getFundFlows(): Promise<any> {
    console.log(`[${this.name}] 使用模拟资金流向数据`);
    
    const today = new Date();
    return {
      main: 8500000000 + (Math.random() - 0.5) * 2500000000,
      north: 3200000000 + (Math.random() - 0.5) * 1200000000,
      sectorFlows: {
        'ai': 4200000000 + (Math.random() - 0.5) * 1200000000,
        'newenergy': 2100000000 + (Math.random() - 0.5) * 900000000,
        'consumerelec': 1200000000 + (Math.random() - 0.5) * 600000000,
        'medicine': 800000000 + (Math.random() - 0.5) * 400000000,
        'finance': -500000000 + (Math.random() - 0.5) * 250000000,
        'realestate': -800000000 + (Math.random() - 0.5) * 400000000
      },
      source: this.name,
      timestamp: today.toISOString()
    };
  }
  
  async getMarketNews(): Promise<any[]> {
    console.log(`[${this.name}] 使用模拟新闻数据`);
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);
    
    return [
      { id: 'mock_news_1', title: 'AI大模型应用落地加速，产业链持续受益', content: '多家上市公司宣布AI大模型应用落地，行业景气度持续提升，相关龙头公司订单饱满，产能利用率高', source: '证券时报', time: today.toISOString(), tags: ['AI', '大模型', '利好'], dataSource: this.name },
      { id: 'mock_news_2', title: '新能源汽车销量再创新高', content: '5月份新能源汽车销量同比增长超60%，产业链需求旺盛，上游原材料价格企稳回升', source: '第一财经', time: yesterday.toISOString(), tags: ['新能源', '销量', '数据'], dataSource: this.name },
      { id: 'mock_news_3', title: '消费电子迎来传统旺季', content: '下半年消费电子传统旺季临近，产业链备货积极性提升，相关公司订单改善', source: '上海证券报', time: yesterday.toISOString(), tags: ['消费电子', '旺季', '需求'], dataSource: this.name },
      { id: 'mock_news_4', title: '生物医药创新突破', content: '国内药企在创新药领域取得重要突破，多款新药获批上市', source: '医药经济报', time: dayBeforeYesterday.toISOString(), tags: ['医药', '创新'], dataSource: this.name }
    ];
  }
}
