
const http = require('http');
const https = require('https');

console.log('================================================================================');
console.log('🌐 网络连接测试');
console.log('================================================================================');
console.log('📅 当前日期:', new Date().toISOString());

const testUrls = [
  { name: '东方财富API', url: 'https://push2.eastmoney.com' },
  { name: '新浪财经', url: 'https://hq.sinajs.cn' },
  { name: '百度', url: 'https://www.baidu.com' },
  { name: 'GitHub', url: 'https://api.github.com' }
];

function testUrl(test) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const client = test.url.startsWith('https') ? https : http;
    
    const timeout = 5000;
    const req = client.get(test.url, { timeout }, (res) => {
      const time = Date.now() - startTime;
      console.log(`✅ ${test.name}: 连接成功 (${time}ms) - 状态码: ${res.statusCode}`);
      resolve({ success: true, name: test.name, time, statusCode: res.statusCode });
      res.resume();
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${test.name}: 连接失败 - ${err.message}`);
      resolve({ success: false, name: test.name, error: err.message });
    });
    
    req.on('timeout', () => {
      console.log(`❌ ${test.name}: 连接超时 (${timeout}ms)`);
      req.destroy();
      resolve({ success: false, name: test.name, error: 'timeout' });
    });
  });
}

async function runTests() {
  console.log('\n开始测试网络连接...\n');
  
  const results = [];
  for (const test of testUrls) {
    const result = await testUrl(test);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n================================================================================');
  console.log('📊 测试结果总结');
  console.log('================================================================================');
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n✅ 成功连接: ${successCount}/${results.length}`);
  
  if (successCount === results.length) {
    console.log('🎉 网络连接正常！现在可以获取真实API数据了。');
  } else if (successCount &gt; 0) {
    console.log('⚠️ 部分连接成功，检查特定API是否可用。');
  } else {
    console.log('❌ 所有连接失败，网络环境仍受限。');
  }
  
  console.log('================================================================================');
}

runTests().catch(console.error);

