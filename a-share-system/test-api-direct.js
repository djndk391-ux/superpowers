
// 测试真实API的脚本
import fetch from 'node-fetch';

console.log('='.repeat(80));
console.log('🧪 测试A股热点轮动交易系统 - 真实API');
console.log('='.repeat(80));
console.log('');

// 测试 /api/real-market-data 接口
async function testRealMarketDataAPI() {
  console.log('📍 测试真实数据接口: /api/real-market-data');
  console.log('');
  
  try {
    const response = await fetch('http://localhost:3001/api/real-market-data');
    const result = await response.json();
    
    if (result.success) {
      const data = result.data;
      
      console.log('✅ API调用成功！');
      console.log('');
      
      console.log('📊 数据来源信息:');
      console.log(`   • 数据源: ${data.dataSource}`);
      console.log(`   • 数据类型: ${data.dataType}`);
      console.log(`   • 采集时间: ${data.collectionTime}`);
      console.log('');
      
      console.log('📈 板块数据:');
      if (data.sectors && data.sectors.length > 0) {
        data.sectors.slice(0, 6).forEach((sector, idx) => {
          const changeSign = sector.changePercent >= 0 ? '+' : '';
          const changeColor = sector.changePercent >= 0 ? '📗' : '📕';
          console.log(`   ${idx + 1}. ${sector.name}`);
          console.log(`      ${changeColor} 涨跌幅: ${changeSign}${sector.changePercent.toFixed(2)}%`);
          console.log(`      💰 成交额: ${(sector.volume / 100000000).toFixed(1)}亿`);
          console.log(`      📋 数据类型: ${sector.dataType || '未标记'}`);
          console.log('');
        });
      } else {
        console.log('   ⚠️ 暂无板块数据');
        console.log('');
      }
      
      console.log('📊 个股数据:');
      if (data.stocks && data.stocks.length > 0) {
        data.stocks.slice(0, 5).forEach((stock, idx) => {
          const changeSign = stock.changePercent >= 0 ? '+' : '';
          const changeColor = stock.changePercent >= 0 ? '📗' : '📕';
          console.log(`   ${idx + 1}. ${stock.name} (${stock.code})`);
          console.log(`      💵 当前价格: ${stock.price.toFixed(2)}元`);
          console.log(`      ${changeColor} 涨跌幅: ${changeSign}${stock.changePercent.toFixed(2)}%`);
          console.log(`      💰 成交量: ${(stock.volume / 100000000).toFixed(2)}亿`);
          console.log(`      📋 数据类型: ${stock.dataType || '未标记'}`);
          console.log('');
        });
      } else {
        console.log('   ⚠️ 暂无个股数据');
        console.log('');
      }
      
      console.log('📄 完整数据示例 (JSON):');
      console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
      
    } else {
      console.log('❌ API调用失败:');
      console.log(`   ${result.error}`);
    }
    
  } catch (error) {
    console.log('❌ 发生错误:');
    console.log(`   ${error.message}`);
  }
  
  console.log('');
  console.log('='.repeat(80));
}

// 测试 /api/market-data 接口（自动降级）
async function testMarketDataAPI() {
  console.log('📍 测试通用数据接口: /api/market-data');
  console.log('');
  
  try {
    const response = await fetch('http://localhost:3001/api/market-data');
    const result = await response.json();
    
    if (result.success) {
      const data = result.data;
      
      console.log('✅ API调用成功！');
      console.log('');
      
      console.log('📊 数据来源信息:');
      console.log(`   • 数据源: ${data.dataSource}`);
      console.log(`   • 数据类型: ${data.dataType}`);
      console.log(`   • 采集时间: ${data.collectionTime}`);
      console.log('');
      
      // 检查是否有真实API数据
      const hasRealSectorData = data.sectors && data.sectors[0]?.dataType === '真实API';
      const hasRealStockData = data.stocks && data.stocks[0]?.dataType === '真实API';
      
      if (hasRealSectorData || hasRealStockData) {
        console.log('🎉 太好了！成功获取到真实API数据！');
        console.log(`   板块数据: ${hasRealSectorData ? '✅ 真实' : '❌ 模拟'}`);
        console.log(`   个股数据: ${hasRealStockData ? '✅ 真实' : '❌ 模拟'}`);
      } else {
        console.log('⚠️ 当前使用的是模拟数据');
      }
      
    } else {
      console.log('❌ API调用失败:');
      console.log(`   ${result.error}`);
    }
    
  } catch (error) {
    console.log('❌ 发生错误:');
    console.log(`   ${error.message}`);
  }
  
  console.log('');
  console.log('='.repeat(80));
}

// 运行所有测试
async function runAllTests() {
  await testRealMarketDataAPI();
  console.log('\n\n');
  await testMarketDataAPI();
  
  console.log('\n✅ 所有测试完成！');
  console.log('📖 下一步建议:');
  console.log('   1. 查看 Dashboard 页面（http://localhost:5173/）');
  console.log('   2. 点击 "⚡ 快速测试" 按钮');
  console.log('   3. 观察 "🔬 数据收集Agent测试评估" 区域');
  console.log('='.repeat(80));
}

runAllTests().catch(console.error);
