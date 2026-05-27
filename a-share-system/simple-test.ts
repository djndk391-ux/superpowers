
import { DataCollectorAgent } from './src/agents/dataCollectorAgent';

console.log('========================================');
console.log('数据收集Agent 独立测试');
console.log('========================================');
console.log('测试时间:', new Date().toLocaleString('zh-CN'));
console.log('');

async function runTest() {
  try {
    console.log('1. 初始化数据收集Agent...');
    const agent = new DataCollectorAgent((progress) =&gt; {
      console.log(`   [${progress.progressPercent}%] ${progress.currentStep}`);
    });

    console.log('');
    console.log('2. 开始收集市场数据...');
    console.log('');

    const startTime = Date.now();
    const snapshot = await agent.collectMarketData();
    const endTime = Date.now();

    console.log('');
    console.log('========================================');
    console.log('测试结果报告');
    console.log('========================================');
    console.log('');

    console.log('【基本信息】');
    console.log('- 执行耗时:', (endTime - startTime).toFixed(2), 'ms');
    console.log('- Snapshot ID:', snapshot.id);
    console.log('- 版本:', snapshot.version);
    console.log('');

    console.log('【数据源信息】');
    console.log('- 当前数据源:', snapshot.dataSource);
    console.log('- 活跃数据源:', snapshot.activeDataSource || snapshot.dataSource);
    if (snapshot.allDataSources) {
      console.log('- 所有数据源:');
      snapshot.allDataSources.forEach((ds, i) =&gt; {
        const status = ds.isAvailable ? '可用' : '不可用';
        console.log(`  ${i + 1}. ${ds.name} (优先级${ds.priority}) - ${status}`);
      });
    }
    console.log('');

    console.log('【数据时间评估】');
    const currentTime = new Date();
    const collectionTime = new Date(snapshot.collectionTime);
    const timeDiffMinutes = (currentTime.getTime() - collectionTime.getTime()) / 1000 / 60;
    const timeDiffHours = timeDiffMinutes / 60;
    
    console.log('- 系统当前时间:', currentTime.toLocaleString('zh-CN'));
    console.log('- 数据采集时间:', collectionTime.toLocaleString('zh-CN'));
    console.log('- 数据延迟:', timeDiffMinutes.toFixed(2), '分钟 (', timeDiffHours.toFixed(2), '小时)');
    
    if (timeDiffHours < 1) {
      console.log('- 新鲜度: 🟢 非常新鲜');
    } else if (timeDiffHours < 6) {
      console.log('- 新鲜度: 🟢 新鲜');
    } else if (timeDiffHours < 24) {
      console.log('- 新鲜度: 🟡 可接受');
    } else {
      console.log('- 新鲜度: 🟠 较旧');
    }
    console.log('');

    console.log('【数据内容统计】');
    console.log('- 板块数据:', snapshot.rawData.sectors ? snapshot.rawData.sectors.length : 0, '个');
    console.log('- 股票数据:', snapshot.rawData.stocks ? snapshot.rawData.stocks.length : 0, '只');
    console.log('- 新闻数据:', snapshot.rawData.news ? snapshot.rawData.news.length : 0, '条');
    console.log('');

    if (snapshot.rawData.sectors && snapshot.rawData.sectors.length > 0) {
      console.log('【板块数据详情】');
      snapshot.rawData.sectors.forEach((sector, i) =&gt; {
        const timeStr = sector.timestamp ? new Date(sector.timestamp).toLocaleString('zh-CN') : '无时间戳';
        console.log(`  ${i + 1}. ${sector.name || '未知'}: 时间=${timeStr}`);
      });
      console.log('');
    }

    if (snapshot.rawData.news && snapshot.rawData.news.length > 0) {
      console.log('【新闻数据详情】');
      snapshot.rawData.news.forEach((news, i) =&gt; {
        const time = news.timestamp || news.time;
        const timeStr = time ? new Date(time).toLocaleString('zh-CN') : '无时间戳';
        const title = (news.title || '无标题').substring(0, 40);
        console.log(`  ${i + 1}. ${title}...: ${timeStr}`);
      });
      console.log('');
    }

    console.log('【市场特征】');
    if (snapshot.features && snapshot.features.length > 0) {
      snapshot.features.forEach((feature, i) => {
        console.log(`  ${i + 1}. ${feature.name}: ${feature.value}`);
      });
    }
    console.log('');

    console.log('【市场状态摘要】');
    if (snapshot.summary) {
      console.log('- 市场方向:', snapshot.summary.marketDirection);
      console.log('- 主导板块:', snapshot.summary.dominantSector);
      console.log('- 热门股票:', snapshot.summary.hotStocks ? snapshot.summary.hotStocks.join(', ') : '无');
      console.log('- 情绪评分:', snapshot.summary.sentimentScore);
    }
    console.log('');

    console.log('【数据新鲜度报告】');
    if (snapshot.dataFreshnessReport) {
      console.log('- 采集时间:', new Date(snapshot.dataFreshnessReport.collectionTime).toLocaleString('zh-CN'));
      console.log('- 过滤统计:', snapshot.dataFreshnessReport.staleDataFiltered.staleItems, '/', snapshot.dataFreshnessReport.staleDataFiltered.totalItems, '条过期数据被过滤');
    }
    console.log('');

    console.log('========================================');
    console.log('【总体评估】');
    
    const isRealDataSource = snapshot.dataSource === '东方财富' || snapshot.dataSource === '同花顺';
    const isFresh = timeDiffHours < 24;
    
    if (isRealDataSource && isFresh) {
      console.log('✅ 优秀！使用真实数据源，数据新鲜');
    } else if (isRealDataSource) {
      console.log('⚠️ 良好！使用真实数据源，但数据可能不是最新');
    } else if (isFresh) {
      console.log('⚠️ 良好！数据新鲜，但使用备用数据源');
    } else {
      console.log('⚠️ 需改进！使用备用数据源且数据可能不是最新');
    }
    
    console.log('');
    console.log('✅ 测试完成！');
    console.log('========================================');

  } catch (error) {
    console.error('');
    console.error('❌ 测试失败！');
    console.error('错误:', error);
    console.error('');
  }
}

runTest();
