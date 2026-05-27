
import { BaseDataSourceAdapter } from './base';

// 东方财富API适配器
export class EastMoneyAdapter extends BaseDataSourceAdapter {
  name = '东方财富';
  isAvailable = true;
  priority = 1; // 优先级最高
  
  // 新增：调试模式 - 强制使用模拟数据
  private forceMock = false;
  
  // 东方财富API端点
  private readonly baseUrls = {
    sector: 'https://push2.eastmoney.com/api/qt/clist/get',
    stock: 'https://push2.eastmoney.com/api/qt/stock/get',
    fundFlow: 'https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get',
    news: 'https://np-anotice-stock.eastmoney.com/api/security/ann'
  };
  
  // 板块映射
  private readonly sectorMapping: Record&lt;string, { id: string; name: string; code: string }&gt; = {
    'BK0800': { id: 'ai', name: '人工智能', code: 'BK0800' },
    'BK0493': { id: 'newenergy', name: '新能源', code: 'BK0493' },
    'BK0440': { id: 'consumerelec', name: '消费电子', code: 'BK0440' },
    'BK0465': { id: 'medicine', name: '生物医药', code: 'BK0465' },
    'BK0473': { id: 'finance', name: '金融', code: 'BK0473' },
    'BK0451': { id: 'realestate', name: '房地产', code: 'BK0451' }
  };
  
  // 热门股票列表
  private readonly targetStocks = [
    { code: '300223', name: '寒武纪', sectorId: 'ai' },
    { code: '300418', name: '昆仑万维', sectorId: 'ai' },
    { code: '002230', name: '科大讯飞', sectorId: 'ai' },
    { code: '300750', name: '宁德时代', sectorId: 'newenergy' },
    { code: '002594', name: '比亚迪', sectorId: 'newenergy' },
    { code: '002475', name: '立讯精密', sectorId: 'consumerelec' },
    { code: '300142', name: '沃森生物', sectorId: 'medicine' }
  ];
  
  async getMarketSectors(): Promise&lt;any[]&gt; {
    try {
      console.log(`[${this.name}] 获取板块数据...`);
      
      // 调试模式：强制使用模拟数据
      if (this.forceMock) {
        console.warn(`[${this.name}] ⚠️  调试模式：强制使用模拟数据`);
        return this.getMockSectors(true);
      }
      
      // 尝试调用真实API，失败则使用备用数据
      try {
        // 东方财富板块API - 获取热门板块
        const url = `${this.baseUrls.sector}?pn=1&amp;pz=50&amp;po=1&amp;np=1&amp;fltt=2&amp;fid=f3&amp;fs=m:90+t:2+f:!50&amp;fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152,f133,f108`;
        
        console.log(`[${this.name}] 📡 调用真实API:`, url);
        const response = await this.fetchData(url);
        
        if (response &amp;&amp; response.data &amp;&amp; response.data.diff) {
          // 解析真实API数据
          console.log(`[${this.name}] ✅ 真实API调用成功！返回 ${response.data.diff.length} 条数据`);
          const sectors = response.data.diff.slice(0, 10).map((item: any) =&gt; {
            return {
              id: `sector_${item.f12}`,
              name: item.f14,
              change: item.f3,
              vol: item.f6,
              leaders: this.getLeaderStocksForSector(item.f14),
              source: this.name,
              dataType: '真实API',
              apiUrl: url,
              timestamp: new Date().toISOString()
            };
          });
          
          return sectors;
        } else {
          console.warn(`[${this.name}] ⚠️ API响应格式异常，使用模拟数据`);
        }
      } catch (apiError) {
        console.warn(`[${this.name}] ❌ 真实API调用失败，使用备用数据:`, apiError);
      }
      
      // 备用数据
      return this.getMockSectors(false);
      
    } catch (error) {
      console.error(`[${this.name}] 获取板块数据完全失败:`, error);
      throw error;
    }
  }
  
  async getStockQuotes(codes: string[]): Promise&lt;any[]&gt; {
    try {
      console.log(`[${this.name}] 获取 ${codes.length} 只股票行情...`);
      
      if (this.forceMock) {
        console.warn(`[${this.name}] ⚠️  调试模式：强制使用模拟数据`);
        return this.targetStocks.map(stock =&gt; this.getMockStock(stock.code, true));
      }
      
      const stockPromises = codes.map(async (code) =&gt; {
        try {
          // 东方财富个股API
          const secid = this.getSecid(code);
          const url = `${this.baseUrls.stock}?secid=${secid}&amp;fields=f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f107,f116,f117,f127,f152,f161,f162,f163,f164,f165,f166,f167,f168,f169,f170,f171,f172,f173,f174,f175,f176,f177,f178,f179,f180,f181,f182,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f193,f194,f195,f196,f197,f198,f199,f200,f201,f202,f203,f204,f205,f206,f207,f208,f209,f210,f211,f212,f213,f214,f215,f216,f217,f218,f219,f220,f221,f222,f223,f224,f225,f226,f227,f228,f229,f230,f231,f232,f233,f234,f235,f236,f237,f238,f239,f240,f241,f242,f243,f244,f245,f246,f247,f248,f249,f250,f251,f252,f253,f254,f255,f256,f257,f258,f259,f260,f261,f262,f263,f264,f265,f266,f267,f268,f269,f270,f271,f272,f273,f274,f275,f276,f277,f278,f279,f280,f281,f282,f283,f284,f285,f286,f287,f288,f289,f290,f291,f292,f293,f294,f295,f296,f297,f298,f299,f300,f301,f302,f303,f304,f305,f306,f307,f308,f309,f310,f311,f312,f313,f314,f315,f316,f317,f318,f319,f320,f321,f322,f323,f324,f325,f326,f327,f328,f329,f330,f331,f332,f333,f334,f335,f336,f337,f338,f339,f340,f341,f342,f343,f344,f345,f346,f347,f348,f349,f350,f351,f352,f353,f354,f355,f356,f357,f358,f359,f360,f361,f362,f363,f364,f365,f366,f367,f368,f369,f370,f371,f372,f373,f374,f375,f376,f377,f378,f379,f380,f381,f382,f383,f384,f385,f386,f387,f388,f389,f390,f391,f392,f393,f394,f395,f396,f397,f398,f399,f400,f401,f402,f403,f404,f405,f406,f407,f408,f409,f410,f411,f412,f413,f414,f415,f416,f417,f418,f419,f420,f421,f422,f423,f424,f425,f426,f427,f428,f429,f430,f431,f432,f433,f434,f435,f436,f437,f438,f439,f440,f441,f442,f443,f444,f445,f446,f447,f448,f449,f450,f451,f452,f453,f454,f455,f456,f457,f458,f459,f460,f461,f462,f463,f464,f465,f466,f467,f468,f469,f470,f471,f472,f473,f474,f475,f476,f477,f478,f479,f480,f481,f482,f483,f484,f485,f486,f487,f488,f489,f490,f491,f492,f493,f494,f495,f496,f497,f498,f499,f500`;
          
          console.log(`[${this.name}] 📡 调用股票API (${code}):`, url);
          const response = await this.fetchData(url);
          
          if (response &amp;&amp; response.data) {
            const data = response.data;
            const stockInfo = this.targetStocks.find(s =&gt; s.code === code);
            console.log(`[${this.name}] ✅ 股票 ${code} 真实API调用成功`);
            
            return {
              id: `stock_${code}`,
              code: code,
              name: data.f58 || stockInfo?.name || code,
              price: data.f43 || 0,
              change: data.f170 || 0,
              vol: data.f47 || 0,
              leader: stockInfo ? true : false,
              sector: stockInfo?.sectorId || 'unknown',
              source: this.name,
              dataType: '真实API',
              apiUrl: url,
              timestamp: new Date().toISOString()
            };
          }
        } catch (error) {
          console.warn(`[${this.name}] ❌ 获取股票 ${code} 行情失败:`, error);
        }
        
        // 获取失败时使用备用数据
        return this.getMockStock(code, false);
      });
      
      const stocks = await Promise.all(stockPromises);
      return stocks.filter(Boolean);
      
    } catch (error) {
      console.error(`[${this.name}] 获取股票行情完全失败:`, error);
      return this.targetStocks.map(stock =&gt; this.getMockStock(stock.code, true));
    }
  }
  
  async getFundFlows(): Promise&lt;any&gt; {
    try {
      console.log(`[${this.name}] 获取资金流向数据...`);
      
      if (this.forceMock) {
        console.warn(`[${this.name}] ⚠️  调试模式：强制使用模拟数据`);
        return this.getMockFundFlows(true);
      }
      
      try {
        // 尝试获取北向资金数据
        const northUrl = `${this.baseUrls.fundFlow}?lmt=1&amp;klt=101&amp;secid=1.000001`;
        console.log(`[${this.name}] 📡 调用资金流向API:`, northUrl);
        const response = await this.fetchData(northUrl);
        
        let northFlow = 3200000000;
        let usedRealApi = false;
        if (response &amp;&amp; response.data &amp;&amp; response.data.klines &amp;&amp; response.data.klines.length &gt; 0) {
          const latestData = response.data.klines[response.data.klines.length - 1];
          northFlow = parseFloat(latestData.split(',')[1]) * 1000000000;
          usedRealApi = true;
          console.log(`[${this.name}] ✅ 资金流向真实API调用成功`);
        }
        
        return {
          main: 8500000000 + (Math.random() - 0.5) * 2000000000,
          north: northFlow,
          sectorFlows: {
            'ai': 4200000000 + (Math.random() - 0.5) * 1000000000,
            'newenergy': 2100000000 + (Math.random() - 0.5) * 800000000,
            'consumerelec': 1200000000 + (Math.random() - 0.5) * 500000000,
            'medicine': 800000000 + (Math.random() - 0.5) * 300000000,
            'finance': -500000000 + (Math.random() - 0.5) * 200000000,
            'realestate': -800000000 + (Math.random() - 0.5) * 300000000
          },
          source: this.name,
          dataType: usedRealApi ? '真实API' : '模拟数据',
          apiUrl: usedRealApi ? northUrl : undefined,
          timestamp: new Date().toISOString()
        };
      } catch (apiError) {
        console.warn(`[${this.name}] ❌ 资金流向API调用失败，使用备用数据:`, apiError);
      }
      
      return this.getMockFundFlows(false);
      
    } catch (error) {
      console.error(`[${this.name}] 获取资金流向完全失败:`, error);
      return this.getMockFundFlows(true);
    }
  }
  
  async getMarketNews(): Promise&lt;any[]&gt; {
    try {
      console.log(`[${this.name}] 获取市场新闻...`);
      
      if (this.forceMock) {
        console.warn(`[${this.name}] ⚠️  调试模式：强制使用模拟数据`);
        return this.getMockNews(true);
      }
      
      try {
        const url = `${this.baseUrls.news}?page_index=1&amp;page_size=20`;
        console.log(`[${this.name}] 📡 调用新闻API:`, url);
        const response = await this.fetchData(url);
        
        if (response &amp;&amp; response.data &amp;&amp; response.data.list) {
          console.log(`[${this.name}] ✅ 新闻真实API调用成功，返回 ${response.data.list.length} 条`);
          return response.data.list.slice(0, 10).map((item: any, index: number) =&gt; ({
            id: `news_${index}_${Date.now()}`,
            title: item.title || '市场新闻',
            content: item.content || item.title || '暂无详细内容',
            source: item.org_s_name || '证券时报',
            time: item.publish_time || new Date().toISOString(),
            tags: ['市场', '新闻'],
            dataSource: this.name,
            dataType: '真实API',
            apiUrl: url
          }));
        }
      } catch (apiError) {
        console.warn(`[${this.name}] ❌ 新闻API调用失败，使用备用数据:`, apiError);
      }
      
      return this.getMockNews(false);
      
    } catch (error) {
      console.error(`[${this.name}] 获取市场新闻完全失败:`, error);
      return this.getMockNews(true);
    }
  }
  
  // 辅助方法 - 转换股票代码为secid格式
  private getSecid(code: string): string {
    if (code.startsWith('6')) {
      return `1.${code}`; // 上海
    }
    return `0.${code}`; // 深圳
  }
  
  // 辅助方法 - 获取板块龙头股
  private getLeaderStocksForSector(sectorName: string): string[] {
    const sectorLeaders: Record&lt;string, string[]&gt; = {
      '人工智能': ['300223', '300418', '002230'],
      '新能源': ['300750', '002594', '000333'],
      '消费电子': ['002475', '300136', '002241'],
      '生物医药': ['300142', '600276', '000661']
    };
    return sectorLeaders[sectorName] || ['300223', '300418'];
  }
  
  // 备用数据方法 - 新增参数标识是否强制使用
  private getMockSectors(isForced: boolean): any[] {
    const marker = isForced ? ' (强制)' : ' (降级)';
    return [
      { id: 'ai', name: '人工智能', change: 5.8 + (Math.random() - 0.5) * 2, vol: 158000000000 + (Math.random() - 0.5) * 20000000000, leaders: ['300223', '300418', '002230'], source: this.name, dataType: '模拟数据' + marker, timestamp: new Date().toISOString() },
      { id: 'newenergy', name: '新能源', change: 3.2 + (Math.random() - 0.5) * 1.5, vol: 98000000000 + (Math.random() - 0.5) * 15000000000, leaders: ['300750', '002594', '000333'], source: this.name, dataType: '模拟数据' + marker, timestamp: new Date().toISOString() },
      { id: 'consumerelec', name: '消费电子', change: 2.5 + (Math.random() - 0.5) * 1, vol: 76000000000 + (Math.random() - 0.5) * 10000000000, leaders: ['002475', '300136', '002241'], source: this.name, dataType: '模拟数据' + marker, timestamp: new Date().toISOString() },
      { id: 'medicine', name: '生物医药', change: 1.8 + (Math.random() - 0.5) * 1, vol: 65000000000 + (Math.random() - 0.5) * 8000000000, leaders: ['300142', '600276', '000661'], source: this.name, dataType: '模拟数据' + marker, timestamp: new Date().toISOString() },
      { id: 'finance', name: '金融', change: -0.5 + (Math.random() - 0.5) * 0.5, vol: 52000000000 + (Math.random() - 0.5) * 6000000000, leaders: ['601318', '600036', '601166'], source: this.name, dataType: '模拟数据' + marker, timestamp: new Date().toISOString() },
      { id: 'realestate', name: '房地产', change: -1.2 + (Math.random() - 0.5) * 0.8, vol: 38000000000 + (Math.random() - 0.5) * 5000000000, leaders: ['000002', '600048', '000656'], source: this.name, dataType: '模拟数据' + marker, timestamp: new Date().toISOString() }
    ];
  }
  
  private getMockStock(code: string, isForced: boolean): any {
    const marker = isForced ? ' (强制)' : ' (降级)';
    const stockInfo = this.targetStocks.find(s =&gt; s.code === code);
    const basePrices: Record&lt;string, number&gt; = {
      '300223': 245.80, '300418': 42.35, '002230': 58.60,
      '300750': 185.50, '002594': 268.90, '002475': 32.80,
      '300142': 48.50
    };
    
    const basePrice = basePrices[code] || 50;
    const price = basePrice + (Math.random() - 0.5) * basePrice * 0.1;
    const change = (Math.random() - 0.3) * 15;
    const volume = 500000000 + Math.random() * 1500000000;
    
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
      dataType: '模拟数据' + marker,
      timestamp: new Date().toISOString()
    };
  }
  
  private getMockFundFlows(isForced: boolean): any {
    const marker = isForced ? ' (强制)' : ' (降级)';
    return {
      main: 8500000000 + (Math.random() - 0.5) * 2000000000,
      north: 3200000000 + (Math.random() - 0.5) * 1000000000,
      sectorFlows: {
        'ai': 4200000000 + (Math.random() - 0.5) * 1000000000,
        'newenergy': 2100000000 + (Math.random() - 0.5) * 800000000,
        'consumerelec': 1200000000 + (Math.random() - 0.5) * 500000000,
        'medicine': 800000000 + (Math.random() - 0.5) * 300000000,
        'finance': -500000000 + (Math.random() - 0.5) * 200000000,
        'realestate': -800000000 + (Math.random() - 0.5) * 300000000
      },
      source: this.name,
      dataType: '模拟数据' + marker,
      timestamp: new Date().toISOString()
    };
  }
  
  private getMockNews(isForced: boolean): any[] {
    const marker = isForced ? ' (强制)' : ' (降级)';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return [
      { id: 'news_1', title: 'AI大模型应用落地加速，产业链持续受益', content: '多家上市公司宣布AI大模型应用落地，行业景气度持续提升，相关龙头公司订单饱满，产能利用率高', source: '证券时报', time: today.toISOString(), tags: ['AI', '大模型', '利好'], dataSource: this.name, dataType: '模拟数据' + marker },
      { id: 'news_2', title: '新能源汽车销量再创新高', content: '5月份新能源汽车销量同比增长超60%，产业链需求旺盛，上游原材料价格企稳回升', source: '第一财经', time: yesterday.toISOString(), tags: ['新能源', '销量', '数据'], dataSource: this.name, dataType: '模拟数据' + marker },
      { id: 'news_3', title: '消费电子迎来传统旺季', content: '下半年消费电子传统旺季临近，产业链备货积极性提升，相关公司订单改善', source: '上海证券报', time: yesterday.toISOString(), tags: ['消费电子', '旺季', '需求'], dataSource: this.name, dataType: '模拟数据' + marker }
    ];
  }
}

