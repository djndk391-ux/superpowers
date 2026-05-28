
import http from 'http';
import https from 'https';

console.log('='.repeat(80));
console.log('A股数据源API - 全面测试');
console.log('='.repeat(80));
console.log('当前时间:', new Date().toLocaleString('zh-CN'));
console.log('');

// 测试的API列表
const apiTestList = [
  {
    name: '1. 东方财富 - 板块数据',
    url: 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=5&po=1&np=1&fltt=2&fid=f3&fs=m:90+t:2+f:!50&fields=f1,f2,f3,f4,f12,f14',
    desc: '获取A股板块行情数据'
  },
  {
    name: '2. 东方财富 - 个股数据',
    url: 'https://push2.eastmoney.com/api/qt/stock/get?secid=0.300223&fields=f43,f44,f47,f57,f58,f170',
    desc: '获取寒武纪(300223)个股数据'
  },
  {
    name: '3. 新浪财经 - 个股实时',
    url: 'http://hq.sinajs.cn/list=sz300223',
    desc: '新浪免费实时行情'
  },
  {
    name: '4. 网络测试 - 百度',
    url: 'https://www.baidu.com',
    desc: '测试基本网络连接'
  },
  {
    name: '5. 网络测试 - GitHub',
    url: 'https://api.github.com',
    desc: '测试外部API连接'
  }
];

function testApi(name: string, url: string): Promise<any> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const client = url.startsWith('https') ? https : http;
    const timeout = 8000;
    let done = false;
    
    const timeoutId = setTimeout(() => {
      if (!done) {
        done = true;
        const time = Date.now() - startTime;
        console.log('   ❌ 超时 (' + time + 'ms)');
        resolve({ success: false, name: name, time: time, error: 'timeout' });
      }
    }, timeout);
    
    try {
      const req = client.get(url, (res) => {
        if (done) return;
        clearTimeout(timeoutId);
        done = true;
        
        const time = Date.now() - startTime;
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const hasData = data && data.length > 0;
          const isOk = res.statusCode && res.statusCode >= 200 && res.statusCode < 300;
          
          if (isOk && hasData) {
            console.log('   ✅ 成功 (' + time + 'ms) - 状态: ' + res.statusCode);
            console.log('      数据长度: ' + data.length);
            resolve({ success: true, name: name, time: time, status: res.statusCode });
          } else {
            console.log('   ⚠️ 响应异常 (' + time + 'ms) - 状态: ' + res.statusCode);
            resolve({ success: false, name: name, time: time, status: res.statusCode });
          }
        });
      });
      
      req.on('error', (err) => {
        if (done) return;
        clearTimeout(timeoutId);
        done = true;
        const time = Date.now() - startTime;
        console.log('   ❌ 错误: ' + err.message);
        resolve({ success: false, name: name, time: time, error: err.message });
      });
      
      req.end();
    } catch (e: any) {
      if (!done) {
        clearTimeout(timeoutId);
        done = true;
        console.log('   ❌ 异常: ' + e.message);
        resolve({ success: false, name: name, time: 0, error: e.message });
      }
    }
  });
}

async function runAllTests() {
  console.log('开始测试', apiTestList.length, '个数据源...');
  console.log('');
  
  const results = [];
  
  for (let i = 0; i < apiTestList.length; i++) {
    const api = apiTestList[i];
    console.log('测试: ' + api.name);
    console.log('      ' + api.desc);
    console.log('      URL: ' + api.url.substring(0, 60) + (api.url.length > 60 ? '...' : ''));
    
    const result = await testApi(api.name, api.url);
    results.push(result);
    console.log('');
    
    if (i < apiTestList.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('='.repeat(80));
  console.log('测试结果总结');
  console.log('='.repeat(80));
  
  const successCount = results.filter(r => r.success).length;
  console.log('');
  console.log('成功: ' + successCount + '/' + results.length);
  console.log('失败: ' + (results.length - successCount) + '/' + results.length);
  console.log('');
  
  console.log('详细结果:');
  for (let j = 0; j < results.length; j++) {
    const r = results[j];
    const icon = r.success ? '✅' : '❌';
    console.log('   ' + icon + ' ' + r.name);
  }
  console.log('');
  
  if (successCount > 0) {
    console.log('可以使用的API:');
    const working = results.filter(r => r.success);
    for (let k = 0; k < working.length; k++) {
      console.log('   ' + (k + 1) + '. ' + working[k].name);
    }
  } else {
    console.log('❌ 当前环境网络受限，所有外部API都无法访问');
    console.log('💡 建议在您自己的网络环境中部署');
    console.log('📖 查看: 网络API解决方案.md');
  }
  
  console.log('');
  console.log('='.repeat(80));
  console.log('测试完成');
  console.log('='.repeat(80));
}

runAllTests().catch(console.error);
