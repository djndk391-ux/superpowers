
const http = require('http');

console.log('================================================================================');
console.log('🧪 测试后端API - 真实数据获取');
console.log('================================================================================');
console.log('📅 当前日期:', new Date().toISOString());

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      timeout: 30000
    };
    
    console.log(`\n🔍 请求: ${path}`);
    const startTime = Date.now();
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) =&gt; {
        data += chunk;
      });
      
      res.on('end', () =&gt; {
        const time = Date.now() - startTime;
        console.log(`✅ 响应成功 (${time}ms) - 状态码: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });
    
    req.on('error', (error) =&gt; {
      console.log(`❌ 请求失败: ${error.message}`);
      reject(error);
    });
    
    req.on('timeout', () =&gt; {
      console.log('❌ 请求超时');
      req.destroy();
      reject(new Error('timeout'));
    });
    
    req.end();
  });
}

function displayResults(data) {
  console.log('\n📊 数据来源信息:');
  console.log(`   • 数据源: ${data.dataSource || '未知'}`);
  console.log(`   • 数据类型: ${data.dataType || '未知'}`);
  console.log(`   • 采集时间: ${data.collectionTime || '未知'}`);
  
  if (data.sectors &amp;&amp; data.sectors.length &gt; 0) {
    console.log('\n📈 板块数据 (前3个):');
    data.sectors.slice(0, 3).forEach((sector, idx) =&gt; {
      const sign = sector.changePercent &gt;= 0 ? '+' : '';
      const color = sector.changePercent &gt;= 0 ? '📗' : '📕';
      console.log(`   ${idx + 1}. ${sector.name || '未知板块'}`);
      console.log(`      ${color} 涨跌幅: ${sign}${(sector.changePercent || 0).toFixed(2)}%`);
      console.log(`      💰 成交额: ${((sector.volume || 0) / 100000000).toFixed(1)}亿`);
      console.log(`      📋 数据类型: ${sector.dataType || '未标记'}`);
    });
  }
}

async function runTests() {
  try {
    console.log('\n================================================================================');
    console.log('1️⃣ 测试 /api/real-market-data (真实API专享)');
    console.log('================================================================================');
    
    const realData = await makeRequest('/api/real-market-data');
    if (realData.success &amp;&amp; realData.data) {
      displayResults(realData.data);
      if (realData.data.dataType === '真实API') {
        console.log('\n🎉 太棒了！成功获取真实API数据！');
      }
    } else {
      console.log('\n⚠️ 无法获取真实API数据:', realData.error || '未知错误');
    }
    
    console.log('\n================================================================================');
    console.log('2️⃣ 测试 /api/market-data (智能降级)');
    console.log('================================================================================');
    
    const marketData = await makeRequest('/api/market-data');
    if (marketData.success &amp;&amp; marketData.data) {
      displayResults(marketData.data);
    }
    
    console.log('\n================================================================================');
    console.log('🎯 总结');
    console.log('================================================================================');
    
    const hasRealData = marketData.data &amp;&amp; marketData.data.dataType === '真实API';
    if (hasRealData) {
      console.log('\n✅ 成功！现在可以获取真实API数据了！');
      console.log('📖 详细文档: REAL_API_INTEGRATION.md');
    } else {
      console.log('\n⚠️ 当前使用模拟数据，但系统已准备好');
      console.log('💡 在有网络的环境中会自动获取真实数据');
      console.log('📖 详细文档: REAL_API_INTEGRATION.md');
    }
    console.log('================================================================================');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  }
}

runTests();

