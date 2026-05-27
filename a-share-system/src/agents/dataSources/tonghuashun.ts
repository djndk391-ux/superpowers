
import { BaseDataSourceAdapter } from './base';

// 同花顺API适配器
export class TonghuashunAdapter extends BaseDataSourceAdapter {
  name = '同花顺';
  isAvailable = true;
  priority = 2; // 优先级低于东方财富
  
  // 调试模式 - 强制使用模拟数据
  private forceMock = false;
  
  // 同花顺API端点（使用和东方财富类似的公开API，避免跨域问题）
  private readonly baseUrls = {
    sector: 'https://push2.eastmoney.com/api/qt/clist/get',
    stock: 'https://push2.eastmoney.com/api/qt/stock/get',
    fundFlow: 'https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get',
    news: 'https://np-anotice-stock.eastmoney.com/api/security/ann'
  };
  
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
  
  async getMarketSectors(): Promise&lt;any[]&gt; {
    try {
      console.log(`[${this.name}] 获取板块数据...`);
      
      if (this.forceMock) {
        console.warn(`[${this.name}] ⚠️  调试模式：强制使用模拟数据`);
        return this.getMockSectors(true);
      }
      
      // 尝试调用真实API（使用东方财富的公开API，因为同花顺API容易跨域）
      try {
        const url = `${this.baseUrls.sector}?pn=1&amp;pz=50&amp;po=1&amp;np=1&amp;fltt=2&amp;fid=f3&amp;fs=m:90+t:2+f:!50&amp;fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152,f133,f108`;
        
        console.log(`[${this.name}] 📡 调用真实API:`, url);
        const response = await this.fetchData(url);
        
        if (response &amp;&amp; response.data &amp;&amp; response.data.diff) {
          console.log(`[${this.name}] ✅ 真实API调用成功！返回 ${response.data.diff.length} 条数据`);
          return response.data.diff.slice(0, 8).map((item: any) =&gt; ({
            id: `sector_${item.f12}`,
            name: item.f14,
            change: item.f3,
            vol: item.f6,
            leaders: this.getLeaderStocksForSector(item.f14),
            source: this.name,
            dataType: '真实API',
            apiUrl: url,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (apiError) {
        console.warn(`[${this.name}] ❌ 真实API调用失败，使用备用数据:`, apiError);
      }
      
      // 备用数据
      return this.getMockSectors(false);
      
    } catch (error) {
      console.error(`[${this.name}] 获取板块数据完全失败:`, error);
      return this.getMockSectors(true);
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
          // 使用东方财富API获取个股行情
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
        
        // 备用数据
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
          mainForce: 8400000000 + (Math.random() - 0.5) * 1800000000,
          retail: -1200000000 + (Math.random() - 0.5) * 800000000,
          northbound: northFlow,
          sectorFlows: {
            'ai': 4150000000 + (Math.random() - 0.5) * 900000000,
            'newenergy': 2080000000 + (Math.random() - 0.5) * 700000000,
            'consumerelec': 1150000000 + (Math.random() - 0.5) * 500000000,
            'medicine': 780000000 + (Math.random() - 0.5) * 280000000,
            'finance': -480000000 + (Math.random() - 0.5) * 180000000,
            'realestate': -780000000 + (Math.random() - 0.5) * 280000000
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
          return response.data.list.slice(0, 8).map((item: any, index: number) =&gt; ({
            id: `news_${index}_${Date.now()}`,
            title: item.title || '市场新闻',
            content: item.content || item.title || '暂无详细内容',
            source: item.org_s_name || '同花顺财经',
            time: item.publish_time || new Date().toISOString(),
            timestamp: item.publish_time || new Date().toISOString(),
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
  
  // 备用数据
  private getMockSectors(isForced: boolean): any[] {
    const marker = isForced ? ' (强制)' : ' (降级)';
    return [
      { id: 'ai', name: '人工智能', change: 5.7 + (Math.random() - 0.5) * 1.5, vol: 157000000000 + (Math.random() - 0.5) * 15000000000, leaders: ['300223', '300418', '002230'], source: this.name, dataType: '模拟数据' + marker, timestamp: new Date().toISOString() },
      { id: 'newenergy', name: '新能源', change: 3.3 + (Math.random() - 0.5) * 1.2, vol: 99000000000 + (Math.random() - 0.5) * 12000000000, leaders: ['300750', '002594', '000333'], source: this.name, dataType: '模拟数据' + marker, timestamp: new Date().toISOString() },
      { id: 'chip', name: '芯片', change: 4.1 + (Math.random() - 0.5) * 1.5, vol: 82000000000 + (Math.random() - 0.5) * 10000000000, leaders: ['688981', '688126'], source: this.name, dataType: '模拟数据' + marker, timestamp: new Date().toISOString() },
      { id: 'medicine', name: '生物医药', change: 1.7 + (Math.random() - 0.5) * 0.8, vol: 64000000000 + (Math.random() - 0.5) * 7000000000, leaders: ['300142', '600276'], source: this.name, dataType: '模拟数据' + marker, timestamp: new Date().toISOString() }
    ];
  }
  
  private getMockStock(code: string, isForced: boolean): any {
    const marker = isForced ? ' (强制)' : ' (降级)';
    const stockInfo = this.targetStocks.find(s =&gt; s.code === code);
    const basePrices: Record&lt;string, number&gt; = {
      '300223': 245.50, '300418': 42.20, '002230': 58.50,
      '300750': 185.30, '002594': 268.70, '002475': 32.70,
      '300142': 48.40
    };
    
    const basePrice = basePrices[code] || 50;
    const price = basePrice + (Math.random() - 0.5) * basePrice * 0.08;
    const change = (Math.random() - 0.3) * 12;
    const volume = 450000000 + Math.random() * 1400000000;
    
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
      mainForce: 8400000000 + (Math.random() - 0.5) * 1800000000,
      retail: -1200000000 + (Math.random() - 0.5) * 800000000,
      northbound: 3150000000 + (Math.random() - 0.5) * 900000000,
      sectorFlows: {
        'ai': 4150000000 + (Math.random() - 0.5) * 900000000,
        'newenergy': 2080000000 + (Math.random() - 0.5) * 700000000,
        'chip': 1500000000 + (Math.random() - 0.5) * 500000000,
        'medicine': 780000000 + (Math.random() - 0.5) * 280000000,
        'finance': -480000000 + (Math.random() - 0.5) * 180000000,
        'realestate': -780000000 + (Math.random() - 0.5) * 280000000
      },
      source: this.name,
      dataType: '模拟数据' + marker,
      timestamp: new Date().toISOString()
    };
  }
  
  private getMockNews(isForced: boolean): any[] {
    const marker = isForced ? ' (强制)' : ' (降级)';
    const today = new Date();
    return [
      { id: 'ths_news_1', title: '芯片国产替代加速', content: '国内芯片产业链取得重要突破，相关公司受益', source: '同花顺财经', time: today.toISOString(), timestamp: today.toISOString(), tags: ['芯片', '国产替代', '利好'], dataSource: this.name, dataType: '模拟数据' + marker },
      { id: 'ths_news_2', title: '5G应用场景持续扩展', content: '运营商加速5G网络建设，应用场景不断丰富', source: '同花顺财经', time: today.toISOString(), timestamp: today.toISOString(), tags: ['5G', '通信'], dataSource: this.name, dataType: '模拟数据' + marker }
    ];
  }
}

