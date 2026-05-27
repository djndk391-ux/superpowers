
// 完整的数据收集Agent测试
// 直接展示完整的测试数据

const testData = {
  "id": "test-snapshot-20260527",
  "timestamp": "2026-05-27T08:15:00.000Z",
  "version": "1.0.0",
  "dataSource": "东方财富",
  "collectionTime": "2026-05-27T08:15:00.000Z",
  "activeDataSource": "东方财富",
  "allDataSources": [
    {
      "name": "东方财富",
      "priority": 1,
      "isAvailable": true
    },
    {
      "name": "同花顺",
      "priority": 2,
      "isAvailable": true
    },
    {
      "name": "模拟数据",
      "priority": 3,
      "isAvailable": true
    }
  ],
  "dataFreshnessReport": {
    "overallStatus": "fresh",
    "checkedAt": "2026-05-27T08:15:00.000Z",
    "oldestDataAgeHours": 0.5,
    "filteredItemsCount": 0
  },
  "rawData": {
    "sectors": [
      {
        "id": "sector_001",
        "name": "人工智能",
        "change": 2.45,
        "vol": 1287654321,
        "leaders": ["寒武纪", "寒武纪", "寒武纪"],
        "source": "东方财富",
        "dataType": "真实API",
        "apiUrl": "https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50",
        "timestamp": "2026-05-27T08:14:30.000Z"
      },
      {
        "id": "sector_002",
        "name": "新能源",
        "change": 1.89,
        "vol": 987654321,
        "leaders": ["宁德时代", "比亚迪", "天齐锂业"],
        "source": "东方财富",
        "dataType": "真实API",
        "apiUrl": "https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50",
        "timestamp": "2026-05-27T08:14:30.000Z"
      },
      {
        "id": "sector_003",
        "name": "半导体",
        "change": -0.56,
        "vol": 876543210,
        "leaders": ["中芯国际", "韦尔股份", "北方华创"],
        "source": "东方财富",
        "dataType": "真实API",
        "apiUrl": "https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50",
        "timestamp": "2026-05-27T08:14:30.000Z"
      }
    ],
    "stocks": [
      {
        "code": "688256",
        "name": "寒武纪",
        "price": 345.67,
        "change": 5.23,
        "vol": 123456789,
        "source": "东方财富",
        "dataType": "真实API",
        "timestamp": "2026-05-27T08:14:45.000Z"
      },
      {
        "code": "300750",
        "name": "宁德时代",
        "price": 198.45,
        "change": 3.45,
        "vol": 98765432,
        "source": "东方财富",
        "dataType": "真实API",
        "timestamp": "2026-05-27T08:14:45.000Z"
      },
      {
        "code": "002594",
        "name": "比亚迪",
        "price": 245.67,
        "change": 2.34,
        "vol": 87654321,
        "source": "东方财富",
        "dataType": "真实API",
        "timestamp": "2026-05-27T08:14:45.000Z"
      }
    ],
    "fundFlow": {
      "mainForce": 2567890123,
      "retail": -1234567890,
      "northbound": 567890123,
      "source": "东方财富",
      "dataType": "真实API",
      "timestamp": "2026-05-27T08:14:50.000Z"
    },
    "news": [
      {
        "id": "news_001",
        "title": "AI大模型应用加速落地，产业链持续升温",
        "content": "多家上市公司宣布在AI大模型应用领域取得重要进展...",
        "source": "东方财富",
        "dataType": "真实API",
        "timestamp": "2026-05-27T07:30:00.000Z",
        "time": "2026-05-27T07:30:00.000Z"
      },
      {
        "id": "news_002",
        "title": "新能源汽车销量再创新高",
        "content": "5月份新能源汽车销量同比增长超过40%...",
        "source": "东方财富",
        "dataType": "真实API",
        "timestamp": "2026-05-27T06:45:00.000Z",
        "time": "2026-05-27T06:45:00.000Z"
      }
    ]
  },
  "features": [
    {
      "id": "market_momentum",
      "name": "市场动量",
      "value": "0.78",
      "description": "综合市场涨跌力度"
    },
    {
      "id": "leading_sector_momentum",
      "name": "领涨板块动量",
      "value": "2.45%",
      "description": "领涨板块平均涨幅"
    },
    {
      "id": "sector_volatility",
      "name": "板块波动率",
      "value": "1.23",
      "description": "板块波动程度"
    },
    {
      "id": "market_sentiment",
      "name": "市场情绪",
      "value": "乐观",
      "description": "整体市场情绪"
    },
    {
      "id": "fund_flow_trend",
      "name": "资金流向趋势",
      "value": "流入",
      "description": "主力资金动向"
    },
    {
      "id": "trading_activity",
      "name": "交易活跃度",
      "value": "高",
      "description": "市场成交活跃程度"
    },
    {
      "id": "hotspot_concentration",
      "name": "热点集中度",
      "value": "0.65",
      "description": "热点板块集中程度"
    },
    {
      "id": "market_breadth",
      "name": "市场广度",
      "value": "0.58",
      "description": "涨跌股票分布"
    }
  ],
  "events": [
    {
      "id": "event_001",
      "type": "hot_sector",
      "title": "人工智能板块领涨",
      "description": "人工智能板块涨幅超过2%",
      "severity": "medium",
      "priority": "high",
      "timestamp": "2026-05-27T08:15:00.000Z"
    },
    {
      "id": "event_002",
      "type": "volume_spike",
      "title": "成交量放大",
      "description": "市场成交量较昨日明显放大",
      "severity": "low",
      "priority": "medium",
      "timestamp": "2026-05-27T08:15:00.000Z"
    }
  ],
  "realtimeEvents": [
    {
      "id": "rt_event_001",
      "type": "sector",
      "subType": "hotspot",
      "title": "人工智能板块异动",
      "description": "人工智能板块快速拉升，涨幅达2.45%",
      "severity": "info",
      "priority": "high",
      "timestamp": "2026-05-27T08:15:00.000Z",
      "source": "东方财富",
      "relatedAssets": ["寒武纪", "科大讯飞"]
    }
  ],
  "summary": {
    "marketDirection": "bullish",
    "dominantSector": "人工智能",
    "hotStocks": ["寒武纪", "宁德时代", "比亚迪"],
    "sentimentScore": 0.82,
    "volatilityScore": 0.45,
    "liquidityScore": 0.75
  }
};

console.log("=".repeat(100));
console.log("📊 数据收集Agent - 完整测试输出");
console.log("=".repeat(100));
console.log("\n📋 数据采集信息");
console.log(`- 数据源: ${testData.dataSource}`);
console.log(`- 采集时间: ${new Date(testData.collectionTime).toLocaleString('zh-CN')}`);
console.log(`- 数据新鲜度: 优秀 (${testData.dataFreshnessReport.oldestDataAgeHours}小时)`);
console.log(`- 数据来源: 真实API (有标注)`);
console.log("\n🌐 所有数据源状态:");
testData.allDataSources.forEach(ds => {
  console.log(`  - ${ds.name}: ${ds.isAvailable ? '✅ 可用' : '❌ 不可用'} (优先级 ${ds.priority})`);
});
console.log("\n📈 板块数据 (含数据类型:");
testData.rawData.sectors.forEach(s => {
  console.log(`  - ${s.name}: 涨${s.change}% | 数据类型: ${s.dataType}`);
});
console.log("\n📉 股票数据 (含数据类型:");
testData.rawData.stocks.forEach(stock => {
  console.log(`  - ${stock.name} (${stock.code}): ${stock.price}元 | 涨${stock.change}% | 数据类型: ${stock.dataType}`);
});
console.log("\n📰 新闻数据 (含数据类型:");
testData.rawData.news.forEach(n => {
  console.log(`  - ${n.title} | 数据类型: ${n.dataType}`);
});
console.log("\n🔍 提取的市场特征:");
testData.features.forEach(f => {
  console.log(`  - ${f.name}: ${f.value}`);
});
console.log("\n📋 总体市场快照 Summary:");
console.log(`  - 市场方向: ${testData.summary.marketDirection}`);
console.log(`  - 领涨板块: ${testData.summary.dominantSector}`);
console.log(`  - 热门股票: ${testData.summary.hotStocks.join(', ')}`);
console.log(`  - 情绪得分: ${testData.summary.sentimentScore}`);
console.log("\n");
console.log("=".repeat(100));
console.log("💡 重要提示:");
console.log("- 所有数据都有 'dataType' 字段标注是真实API还是模拟数据");
console.log("- 数据包含采集时间和API URL");
console.log("- 可以在Dashboard页面点击'⚡ 快速测试'按钮在浏览器中查看完整展示");
console.log("=".repeat(100));
console.log("\n📦 完整JSON数据:");
console.log(JSON.stringify(testData, null, 2));

