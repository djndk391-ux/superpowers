
# 📡 A股热点轮动交易系统 - API接入完整流程说明

## 📋 目录
1. [系统架构概览](#系统架构概览)
2. [数据源API详解](#数据源api详解)
3. [代码文件结构](#代码文件结构)
4. [完整测试流程](#完整测试流程)
5. [数据验证方法](#数据验证方法)

---

## 🏗️ 系统架构概览

### 多Agent协作架构
```
┌─────────────────────────────────────────────────────────────┐
│                     用户界面 (Dashboard)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   多Agent协调层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │数据收集Agent │◄─►│市场分析Agent │◄─►│风险评估Agent │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │策略生成Agent │◄─►│总控Agent     │                        │
│  └──────────────┘  └──────────────┘                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   数据源管理层                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │东方财富Adapter│  │同花顺Adapter  │  │模拟数据Adapter│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   真实API接口层                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │板块数据  │  │股票行情  │  │资金流向  │  │市场新闻  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 数据收集Agent的工作流
```
1. collectRawData()      → 从东方财富/同花顺获取原始数据
2. normalizeData()       → 标准化数据格式
3. extractFeatures()     → 提取市场特征
4. detectMarketEvents()  → 检测市场事件
5. generateMarketSnapshot() → 生成市场快照
6. publishEventStream()  → 发布事件流
```

---

## 🔌 数据源API详解

### 1. 东方财富API (主要数据源)

#### 板块数据API
- **地址**: `https://push2.eastmoney.com/api/qt/clist/get`
- **参数**:
  ```
  pn: 1           (页码)
  pz: 50          (每页数量)
  po: 1           (排序方式)
  np: 1
  fltt: 2
  fid: f3         (按涨跌幅排序)
  fs: m:90+t:2+f:!50  (板块筛选条件)
  fields: f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152,f133,f108
  ```
- **返回字段说明**:
  - `f14`: 板块名称
  - `f3`: 涨跌幅
  - `f6`: 成交额
  - `f12`: 板块代码

#### 股票行情API
- **地址**: `https://push2.eastmoney.com/api/qt/stock/get`
- **参数**:
  ```
  secid: 0.300223  (股票代码，0.=深圳，1.=上海)
  fields: f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f107,f116,f117,f127,f152,...
  ```
- **返回字段说明**:
  - `f58`: 股票名称
  - `f43`: 最新价
  - `f170`: 涨跌幅
  - `f47`: 成交量

#### 资金流向API
- **地址**: `https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get`
- **参数**:
  ```
  lmt: 1
  klt: 101
  secid: 1.000001
  ```

#### 市场新闻API
- **地址**: `https://np-anotice-stock.eastmoney.com/api/security/ann`
- **参数**:
  ```
  page_index: 1
  page_size: 20
  ```

### 2. 同花顺API (备用数据源)
- 使用与东方财富相同的API端点（因为同花顺原生API有CORS限制）
- 优先级低于东方财富
- 自动降级机制

### 3. 数据新鲜度验证
- 系统自动过滤超过30天的数据
- 每次数据收集都会生成`DataFreshnessReport`
- 在MarketSnapshot中包含数据来源和采集时间

---

## 📁 代码文件结构

```
a-share-system/
├── src/
│   ├── types/
│   │   └── index.ts                          # 类型定义 (新增 RealtimeMarketEvent, DataFreshnessReport)
│   ├── agents/
│   │   ├── dataSources/
│   │   │   ├── base.ts                       # 数据源适配器基类
│   │   │   ├── eastMoney.ts                  # 东方财富适配器 (已优化，增加dataType标记)
│   │   │   ├── tonghuashun.ts                # 同花顺适配器 (已优化，增加dataType标记)
│   │   │   └── mock.ts                       # 模拟数据适配器
│   │   ├── dataSources.ts                    # 数据源管理器
│   │   └── dataCollectorAgent.ts             # 数据收集Agent (核心)
│   ├── pages/
│   │   └── Dashboard.tsx                     # Dashboard页面 (新增测试评估区域)
│   └── ...
├── test-real-api.html                        # 真实API测试页面 (新建)
├── API-接入流程说明.md                       # 本文档 (新建)
└── package.json
```

### 核心类型定义 (types/index.ts)
```typescript
// 新增的数据类型
export interface RealtimeMarketEvent {
  id: string;
  type: string;
  subType?: string;
  title: string;
  description: string;
  severity: EventSeverity;
  priority: EventPriority;
  timestamp: string;
  source: string;
  relatedAssets?: string[];
  metadata?: Record&lt;string, any&gt;;
}

export interface DataFreshnessReport {
  overallStatus: 'fresh' | 'warning' | 'expired';
  checkedAt: string;
  oldestDataAgeHours: number;
  filteredItemsCount: number;
}

// 扩展的MarketSnapshot
export interface MarketSnapshot {
  id: string;
  timestamp: string;
  version: string;
  rawData: MarketDataResponse;
  features: MarketFeature[];
  events: MarketEvent[];
  realtimeEvents?: RealtimeMarketEvent[];  // 新增
  collectionTime: string;                   // 新增
  dataSource: string;                       // 新增
  activeDataSource?: string;                // 新增
  allDataSources?: Array&lt;{                 // 新增
    name: string;
    priority: number;
    isAvailable: boolean;
  }&gt;;
  dataFreshnessReport?: DataFreshnessReport;  // 新增
  summary: {
    marketDirection: 'bullish' | 'bearish' | 'neutral';
    dominantSector: string;
    hotStocks: string[];
    sentimentScore: number;
    volatilityScore: number;
    liquidityScore?: number;
  };
}
```

### 数据源适配器增强 (eastMoney.ts, tonghuashun.ts)
所有数据都增加了以下标记：
- `dataType`: "真实API" | "模拟数据 (降级)" | "模拟数据 (强制)"
- `apiUrl`: 实际调用的API地址
- `source`: 数据来源名称
- `timestamp`: 数据采集时间

---

## 🧪 完整测试流程

### 方法1: 使用Dashboard页面测试 (推荐)

1. **启动开发服务器**
   ```bash
   cd /workspace/a-share-system
   npm run dev
   ```

2. **访问Dashboard**
   - 打开浏览器访问: `http://localhost:5173`

3. **运行快速测试**
   - 点击页面顶部的 **"⚡ 快速测试"** 按钮
   - 观察页面中间的 **"🔬 数据收集Agent测试评估"** 区域

4. **查看结果**
   - 数据源信息: 显示当前使用的数据源和采集时间
   - 数据统计: 板块、股票、新闻数量
   - 数据类型详情: **关键！** 这里会明确标注每条数据是"真实API"还是"模拟数据"
   - 市场特征: 提取的8个市场特征
   - 总体评估: 系统评级和数据新鲜度

5. **打开浏览器控制台** (F12)
   - 查看详细的API调用日志
   - 检查数据收集Agent的执行过程

### 方法2: 使用独立测试页面

1. **打开测试页面**
   ```bash
   cd /workspace/a-share-system
   # 直接在浏览器中打开 test-real-api.html
   ```

2. **运行测试**
   - 点击 **"测试东方财富API"** 按钮
   - 或点击 **"测试同花顺API"** 按钮

3. **查看结果**
   - 4个数据卡片分别显示板块、股票、资金流向、新闻
   - 每个数据项都有 **"真实API"** (绿色) 或 **"模拟数据"** (橙色) 标签
   - 底部显示完整的JSON响应

### 方法3: 后端直接调用测试

创建测试文件 `test-api-direct.ts`:
```typescript
import { EastMoneyAdapter } from './src/agents/dataSources/eastMoney';
import { TonghuashunAdapter } from './src/agents/dataSources/tonghuashun';

async function testAllAPIs() {
  console.log('🧪 开始测试东方财富API...\n');
  
  const eastMoney = new EastMoneyAdapter();
  
  console.log('1️⃣ 获取板块数据:');
  const sectors = await eastMoney.getMarketSectors();
  console.log('   数据类型:', sectors[0]?.dataType);
  console.log('   数据来源:', sectors[0]?.source);
  console.log('   API地址:', sectors[0]?.apiUrl);
  console.log('   板块数量:', sectors.length);
  
  console.log('\n2️⃣ 获取股票行情:');
  const stocks = await eastMoney.getStockQuotes(['300223', '300750']);
  console.log('   数据类型:', stocks[0]?.dataType);
  
  console.log('\n3️⃣ 获取资金流向:');
  const fundFlow = await eastMoney.getFundFlows();
  console.log('   数据类型:', fundFlow.dataType);
  
  console.log('\n4️⃣ 获取市场新闻:');
  const news = await eastMoney.getMarketNews();
  console.log('   数据类型:', news[0]?.dataType);
  
  console.log('\n✅ 东方财富API测试完成!');
}

testAllAPIs().catch(console.error);
```

运行测试:
```bash
npx tsx test-api-direct.ts
```

---

## ✅ 数据验证方法

### 1. 检查数据来源标记
每个数据项都包含以下字段用于验证：
```typescript
{
  dataType: "真实API",        // 或 "模拟数据 (降级)"
  source: "东方财富",          // 数据来源名称
  apiUrl: "https://...",       // 实际调用的API地址
  timestamp: "2026-05-27T..."  // 采集时间
}
```

### 2. Dashboard验证点
在Dashboard的 **"🔬 数据收集Agent测试评估"** 区域中：

| 检查项 | 验证内容 | 正常状态 |
|--------|----------|----------|
| 数据源信息 | `dataSource` 字段 | "东方财富" 或 "同花顺" |
| 采集时间 | `collectionTime` | 与当前时间相差不超过1小时 |
| 数据类型详情 | 板块/股票/新闻的 `dataType` | **"真实API"** (绿色标签) |
| 数据新鲜度 | 根据时间差计算 | 🟢 非常新鲜 🟢 新鲜 🟡 可接受 |
| 总体评估 | 系统评级 | ✅ 优秀！使用真实API，数据新鲜 |

### 3. 控制台日志验证
打开浏览器控制台 (F12)，查看以下日志：
```
[东方财富] 获取板块数据...
[东方财富] 📡 调用真实API: https://push2.eastmoney.com/api/qt/clist/get?...
[东方财富] ✅ 真实API调用成功! 返回 50 条数据
```

### 4. 降级机制验证
系统具备完整的自动降级机制：
1. 优先尝试 **东方财富** API
2. 如果失败，自动降级到 **同花顺** API
3. 如果都失败，最后使用 **模拟数据**
4. 每次降级都会在控制台记录日志

### 5. 数据时效性验证
- 系统自动过滤超过30天的数据
- 在MarketSnapshot中包含 `dataFreshnessReport`
- 显示 `oldestDataAgeHours` (最旧数据的小时数)
- 显示 `filteredItemsCount` (过滤的数据条数)

---

## 📊 完整MarketSnapshot示例

```json
{
  "id": "snapshot_abc123",
  "timestamp": "2026-05-27T08:15:00.000Z",
  "version": "1.0.0",
  "dataSource": "东方财富",
  "collectionTime": "2026-05-27T08:15:00.000Z",
  "activeDataSource": "东方财富",
  "allDataSources": [
    { "name": "东方财富", "priority": 1, "isAvailable": true },
    { "name": "同花顺", "priority": 2, "isAvailable": true },
    { "name": "模拟数据", "priority": 3, "isAvailable": true }
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
        "id": "sector_1",
        "name": "人工智能",
        "change": 2.45,
        "vol": 158000000000,
        "source": "东方财富",
        "dataType": "真实API",
        "apiUrl": "https://push2.eastmoney.com/api/qt/clist/get?...",
        "timestamp": "2026-05-27T08:14:30.000Z"
      }
    ],
    "stocks": [...],
    "fundFlow": {...},
    "news": [...]
  },
  "features": [
    { "id": "market_momentum", "name": "市场动量", "value": "0.78", "description": "综合市场涨跌力度" },
    { "id": "leading_sector_momentum", "name": "领涨板块动量", "value": "2.45%", "description": "领涨板块平均涨幅" },
    ...
  ],
  "events": [...],
  "realtimeEvents": [...],
  "summary": {
    "marketDirection": "bullish",
    "dominantSector": "人工智能",
    "hotStocks": ["寒武纪", "宁德时代", "比亚迪"],
    "sentimentScore": 0.82,
    "volatilityScore": 0.45,
    "liquidityScore": 0.75
  }
}
```

---

## 🎯 关键改进总结

### 本次优化的核心改进点：
1. ✅ **明确的数据来源标记** - 每个数据项都有 `dataType` 字段标注
2. ✅ **真实API优先调用** - 优先使用东方财富和同花顺的真实API
3. ✅ **自动降级机制** - API失败时自动降级，保证系统稳定性
4. ✅ **数据新鲜度验证** - 自动过滤过期数据，生成新鲜度报告
5. ✅ **完整的测试工具** - Dashboard测试区域 + 独立测试页面
6. ✅ **透明的验证方法** - 多种方式验证数据真实性

### 如何确认使用的是真实数据：
1. 查看Dashboard中 **"🔬 数据收集Agent测试评估"** 区域
2. 检查 **"数据类型详情"** 是否显示 **"真实API"** (绿色标签)
3. 查看浏览器控制台日志，确认API调用成功
4. 检查数据中的 `apiUrl` 和 `source` 字段

---

## 🔧 常见问题

### Q: 为什么有时会使用模拟数据？
A: 可能的原因：
1. 网络问题导致API请求失败
2. API服务暂时不可用
3. CORS跨域限制（浏览器环境）
4. 调试模式下强制使用模拟数据

### Q: 如何强制使用真实API？
A: 在数据源适配器中设置 `forceMock = false`（默认就是false）

### Q: 数据新鲜度是如何计算的？
A: 根据 `collectionTime` 和当前时间的差值计算：
- &lt;1小时: 🟢 非常新鲜
- 1-6小时: 🟢 新鲜
- 6-24小时: 🟡 可接受
- &gt;24小时: 🟠 较旧
- &gt;30天: 🔴 过期（会被自动过滤）

### Q: 如何添加更多的数据源？
A: 继承 `BaseDataSourceAdapter` 类，实现对应的方法即可。系统会自动按照优先级选择。

---

## 📞 技术支持

如有问题，请检查：
1. 浏览器控制台日志 (F12)
2. 网络请求面板 (Network tab)
3. 本文档的测试流程部分

---

**文档版本**: 1.0.0  
**最后更新**: 2026-05-27  
**维护者**: A股热点轮动交易系统开发团队

