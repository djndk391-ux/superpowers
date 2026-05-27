import { DataCollectorAgent } from './src/agents/dataCollectorAgent';
import { MarketSnapshot } from './src/types';

console.log('='.repeat(80));
console.log('📊 A股数据收集Agent - 独立测试评估');
console.log('='.repeat(80));
console.log(`测试时间: ${new Date().toLocaleString('zh-CN')}`);
console.log('');

async function testDataCollector() {
  try {
    console.log('🚀 初始化数据收集Agent...');
    const agent = new DataCollectorAgent((progress) => {
      console.log(`  [${progress.progressPercent}%] ${progress.currentStep}: ${progress.stepDescription}`);
    });

    console.log('');
    console.log('📥 开始收集市场数据...');
    console.log('');

    const startTime = Date.now();
    const snapshot: MarketSnapshot = await agent.collectMarketData();
    const endTime = Date.now();

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ 数据收集完成 - 评估报告');
    console.log('='.repeat(80));
    console.log('');

    // 1. 基本信息评估
    console.log('📋 一、基本信息');
    console.log('─'.repeat(80));
    console.log(`• 执行耗时: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`• Snapshot ID: ${snapshot.id}`);
    console.log(`• 版本: ${snapshot.version}`);
    console.log('');

    // 2. 数据源评估
    console.log('🌐 二、数据源评估');
    console.log('─'.repeat(80));
    console.log(`• 当前使用数据源: ${snapshot.dataSource}`);
    console.log(`• 活跃数据源: ${snapshot.activeDataSource || snapshot.dataSource}`);
    
    if (snapshot.allDataSources && snapshot.allDataSources.length > 0) {
      console.log(`• 所有可用数据源:`);
      snapshot.allDataSources.forEach((ds, idx) =&gt; {
        const status = ds.isAvailable ? '✅ 可用' : '❌ 不可用';
        console.log(`  ${idx + 1}. ${ds.name} - 优先级: ${ds.priority} - ${status}`);
      });
    }
    console.log('');

    // 3. 数据时间评估
    console.log('⏰ 三、数据时间评估');
    console.log('─'.repeat(80));
    const currentTime = new Date();
    const collectionTime = new Date(snapshot.collectionTime);
    const snapshotTime = new Date(snapshot.timestamp);
    
    console.log(`• 系统当前时间: ${currentTime.toLocaleString('zh-CN')}`);
    console.log(`• 数据采集时间: ${collectionTime.toLocaleString('zh-CN')}`);
    console.log(`• Snapshot时间: ${snapshotTime.toLocaleString('zh-CN')}`);
    
    const timeDiffMinutes = (currentTime.getTime() - collectionTime.getTime()) / 1000 / 60;
    const timeDiffHours = timeDiffMinutes / 60;
    const timeDiffDays = timeDiffHours / 24;
    
    console.log(`• 数据延迟: ${timeDiffMinutes.toFixed(2)}分钟 (${timeDiffHours.toFixed(2)}小时)`);
    
    if (timeDiffHours &lt; 1) {
      console.log(`• 新鲜度评级: 🟢 非常新鲜 (1小时内)`);
    } else if (timeDiffHours &lt; 6) {
      console.log(`• 新鲜度评级: 🟢 新鲜 (6小时内)`);
    } else if (timeDiffHours &lt; 24) {
      console.log(`• 新鲜度评级: 🟡 可接受 (当天内)`);
    } else if (timeDiffDays &lt; 7) {
      console.log(`• 新鲜度评级: 🟡 较旧 (1周内)`);
    } else if (timeDiffDays &lt; 30) {
      console.log(`• 新鲜度评级: 🟠 过时 (1个月内)`);
    } else {
      console.log(`• 新鲜度评级: 🔴 过期 (超过1个月)`);
    }
    console.log('');

    // 4. 数据新鲜度报告
    if (snapshot.dataFreshnessReport) {
      console.log('📈 四、数据新鲜度详细报告');
      console.log('─'.repeat(80));
      console.log(`• 采集时间: ${new Date(snapshot.dataFreshnessReport.collectionTime).toLocaleString('zh-CN')}`);
      console.log(`• 系统报告时间: ${new Date(snapshot.dataFreshnessReport.systemTime).toLocaleString('zh-CN')}`);
      
      if (snapshot.dataFreshnessReport.dataSources &amp;&amp; snapshot.dataFreshnessReport.dataSources.length &gt; 0) {
        snapshot.dataFreshnessReport.dataSources.forEach((ds, idx) =&gt; {
          console.log(`• 数据源 ${idx + 1} - ${ds.name}:`);
          console.log(`  - 更新频率: ${ds.updateFrequency}`);
          console.log(`  - 数据新鲜度评分: ${ds.dataFreshness}`);
          console.log(`  - 最后更新: ${new Date(ds.lastUpdate).toLocaleString('zh-CN')}`);
        });
      }
      
      console.log(`• 过滤统计: ${snapshot.dataFreshnessReport.staleDataFiltered.staleItems}/${snapshot.dataFreshnessReport.staleDataFiltered.totalItems} 条过期数据被过滤`);
      
      if (snapshot.dataFreshnessReport.warnings &amp;&amp; snapshot.dataFreshnessReport.warnings.length &gt; 0) {
        console.log(`• 警告:`);
        snapshot.dataFreshnessReport.warnings.forEach(warning =&gt; {
          console.log(`  ⚠️ ${warning}`);
        });
      }
      console.log('');
    }

    // 5. 市场数据内容评估
    console.log('📊 五、市场数据内容评估');
    console.log('─'.repeat(80));
    console.log(`• 板块数据: ${snapshot.rawData.sectors?.length || 0} 个`);
    console.log(`• 股票数据: ${snapshot.rawData.stocks?.length || 0} 只`);
    console.log(`• 新闻数据: ${snapshot.rawData.news?.length || 0} 条`);
    
    if (snapshot.rawData.sectors &amp;&amp; snapshot.rawData.sectors.length &gt; 0) {
      console.log('• 板块数据时间戳检查:');
      snapshot.rawData.sectors.forEach((sector, idx) =&gt; {
        const sectorTime = sector.timestamp ? new Date(sector.timestamp) : '无时间戳';
        console.log(`  ${idx + 1}. ${sector.name || '未知板块'}: ${typeof sectorTime === 'object' ? sectorTime.toLocaleString('zh-CN') : sectorTime}`);
      });
    }
    
    if (snapshot.rawData.news &amp;&amp; snapshot.rawData.news.length &gt; 0) {
      console.log('• 新闻数据时间戳检查:');
      snapshot.rawData.news.forEach((news, idx) =&gt; {
        const newsTime = news.timestamp || news.time ? new Date(news.timestamp || news.time) : '无时间戳';
        console.log(`  ${idx + 1}. ${(news.title || '无标题').substring(0, 30)}...: ${typeof newsTime === 'object' ? newsTime.toLocaleString('zh-CN') : newsTime}`);
      });
    }
    console.log('');

    // 6. 市场特征评估
    if (snapshot.features &amp;&amp; snapshot.features.length &gt; 0) {
      console.log('📉 六、市场特征评估');
      console.log('─'.repeat(80));
      console.log(`• 特征数量: ${snapshot.features.length} 个`);
      snapshot.features.forEach((feature, idx) =&gt; {
        console.log(`  ${idx + 1}. [${feature.type.toUpperCase()}] ${feature.name}: ${feature.value} - ${feature.description}`);
      });
      console.log('');
    }

    // 7. 市场事件评估
    console.log('⚡ 七、市场事件评估');
    console.log('─'.repeat(80));
    console.log(`• 市场事件: ${snapshot.events?.length || 0} 个`);
    console.log(`• 实时事件: ${snapshot.realtimeEvents?.length || 0} 个`);
    
    if (snapshot.events &amp;&amp; snapshot.events.length &gt; 0) {
      snapshot.events.forEach((event, idx) =&gt; {
        const severityIcon = event.severity === 'high' ? '🔴' : event.severity === 'medium' ? '🟡' : '🟢';
        console.log(`  ${idx + 1}. ${severityIcon} [${event.type}] ${event.title}`);
      });
    }
    
    if (snapshot.realtimeEvents &amp;&amp; snapshot.realtimeEvents.length &gt; 0) {
      console.log('• 实时事件详情:');
      snapshot.realtimeEvents.forEach((event, idx) =&gt; {
        const severityIcon = event.severity === 'critical' ? '🔴' : event.severity === 'high' ? '🟠' : event.severity === 'medium' ? '🟡' : '🟢';
        console.log(`  ${idx + 1}. ${severityIcon} [${event.type}] ${event.title} (${event.source}) - ${new Date(event.timestamp).toLocaleString('zh-CN')}`);
      });
    }
    console.log('');

    // 8. 市场摘要评估
    if (snapshot.summary) {
      console.log('🎯 八、市场状态摘要');
      console.log('─'.repeat(80));
      const directionIcon = snapshot.summary.marketDirection === 'bullish' ? '📈 看涨' : snapshot.summary.marketDirection === 'bearish' ? '📉 看跌' : '➡️ 中性';
      console.log(`• 市场方向: ${directionIcon}`);
      console.log(`• 主导板块: ${snapshot.summary.dominantSector}`);
      console.log(`• 热门股票: ${snapshot.summary.hotStocks?.join(', ') || '无'}`);
      console.log(`• 情绪评分: ${snapshot.summary.sentimentScore.toFixed(2)}`);
      console.log(`• 波动率评分: ${snapshot.summary.volatilityScore.toFixed(2)}`);
      if (snapshot.summary.liquidityScore !== undefined) {
        console.log(`• 流动性评分: ${snapshot.summary.liquidityScore.toFixed(2)}`);
      }
      console.log('');
    }

    // 9. 总体评估结论
    console.log('📋 九、总体评估结论');
    console.log('─'.repeat(80));
    
    let overallRating = '🟢 优秀';
    let overallComments = [];
    
    // 数据源评级
    if (snapshot.dataSource === '东方财富' || snapshot.dataSource === '同花顺') {
      overallComments.push(`✅ 使用真实数据源: ${snapshot.dataSource}`);
    } else {
      overallRating = '🟡 良好';
      overallComments.push(`⚠️ 使用备用数据源: ${snapshot.dataSource}`);
    }
    
    // 时间新鲜度评级
    if (timeDiffHours &gt; 24) {
      overallRating = overallRating === '🟢 优秀' ? '🟡 良好' : '🟠 需改进';
      overallComments.push(`⚠️ 数据时间超过24小时，可能不是最新数据`);
    }
    
    // 数据完整性评级
    if (!snapshot.rawData.sectors || snapshot.rawData.sectors.length === 0) {
      overallRating = overallRating === '🟢 优秀' ? '🟡 良好' : '🟠 需改进';
      overallComments.push(`⚠️ 缺少板块数据`);
    }
    
    if (!snapshot.rawData.stocks || snapshot.rawData.stocks.length === 0) {
      overallRating = overallRating === '🟢 优秀' ? '🟡 良好' : '🟠 需改进';
      overallComments.push(`⚠️ 缺少股票数据`);
    }
    
    console.log(`• 总体评级: ${overallRating}`);
    console.log(`• 评估意见:`);
    if (overallComments.length === 0) {
      console.log(`  ✅ 数据收集Agent运行正常，数据质量良好！`);
    } else {
      overallComments.forEach(comment =&gt; {
        console.log(`  ${comment}`);
      });
    }
    console.log('');
    
    console.log('='.repeat(80));
    console.log('✅ 测试完成！');
    console.log('='.repeat(80));
    
    return { success: true, snapshot };
    
  } catch (error) {
    console.error('');
    console.error('❌ 测试失败！');
    console.error('─'.repeat(80));
    console.error('错误详情:', error);
    console.error('');
    console.error('='.repeat(80));
    
    return { success: false, error };
  }
}

// 执行测试
testDataCollector().then(result =&gt; {
  process.exit(result.success ? 0 : 1);
});
