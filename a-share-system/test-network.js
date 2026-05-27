
// 测试网络连接
import fetch from 'node-fetch';

console.log('🌐 测试网络连接...');
console.log('='.repeat(60));

const testUrls = [
  'https://api.github.com',
  'https://httpbin.org/get',
  'https://push2.eastmoney.com',
  'https://hq.sinajs.cn'
];

for (const url of testUrls) {
  console.log(`\n🔍 测试: ${url}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const start = Date.now();
    const response = await fetch(url, {
      signal: controller.signal
    });
    const time = Date.now() - start;
    clearTimeout(timeoutId);
    
    console.log(`   ✅ 连接成功 (${time}ms)`);
    console.log(`   📡 状态码: ${response.status}`);
  } catch (error) {
    console.log(`   ❌ 连接失败:`, error.message);
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ 网络测试完成');
