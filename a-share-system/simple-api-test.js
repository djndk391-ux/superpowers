
const http = require('http');
const https = require('https');

console.log('================================================================================');
console.log('A股数据源API - 简单测试');
console.log('================================================================================');
console.log('当前时间:', new Date().toLocaleString('zh-CN'));
console.log('');

// 测试的API列表
const apis = [
  {
    name: '1. 东方财富 - 板块数据',
    url: 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&amp;pz=5&amp;po=1&amp;np=1&amp;fltt=2&amp;fid=f3&amp;fs=m:90+t:2+f:!50&amp;fields=f1,f2,f3,f4,f12,f14',
    desc: '获取板块行情数据'
  },
  {
    name: '2. 东方财富 - 个股数据',
    url: 'https://push2.eastmoney.com/api/qt/stock/get?secid=0.300223&amp;fields=f43,f44,f47,f57,f58,f170',
    desc: '获取寒武纪股票数据'
  },
  {
    name: '3. 新浪财经 - 个股',
    url: 'http://hq.sinajs.cn/list=sz300223',
    desc: '新浪免费行情'
  },
  {
    name: '4. 网络测试 - 百度',
    url: 'https://www.baidu.com',
    desc: '测试基本网络'
  },
  {
    name: '5. 网络测试 - GitHub',
    url: 'https://api.github.com',
    desc: '测试外部API'
  }
];

function testApi(name, url) {
  return new Promise((resolve) =&gt; {
    const startTime = Date.now();
    const client = url.startsWith('https') ? https : http;
    
    const timeout = 8000;
    let done = false;
    
    const timeoutId = setTimeout(() =&gt; {
      if (!done) {
        done = true;
        const time = Date.now() - startTime;
        console.log('   ❌ 超时 (' + time + 'ms)');
        resolve({ success: false, name: name, time: time, error: 'timeout' });
      }
    }, timeout);
    
    try {
      const req = client.get(url, (res) =&gt; {
        if (done) return;
        clearTimeout(timeoutId);
        done = true;
        
        const time = Date.now() - startTime;
        let data = '';
        
        res.on('data', (chunk) =&gt; {
          data += chunk;
        });
        
        res.on('end', () =&gt; {
          const hasData = data &amp;&amp; data.length &gt; 0;
          const isOk = res.statusCode &gt;= 200 &amp;&amp; res.statusCode &lt; 300;
          
          if (isOk &amp;&amp; hasData) {
            console.log('   ✅ 成功 (' + time + 'ms) - 状态: ' + res.statusCode);
            console.log('      数据长度: ' + data.length);
            resolve({ success: true, name: name, time: time, status: res.statusCode });
          } else {
            console.log('   ⚠️ 响应异常 (' + time + 'ms) - 状态: ' + res.statusCode);
            resolve({ success: false, name: name, time: time, status: res.statusCode });
          }
        });
      });
      
      req.on('error', (err) =&gt; {
        if (done) return;
        clearTimeout(timeoutId);
        done = true;
        const time = Date.now() - startTime;
        console.log('   ❌ 错误: ' + err.message);
        resolve({ success: false, name: name, time: time, error: err.message });
      });
      
      req.end();
    } catch (e) {
      if (!done) {
        clearTimeout(timeoutId);
        done = true;
        console.log('   ❌ 异常: ' + e.message);
        resolve({ success: false, name: name, time: 0, error: e.message });
      }
    }
  });
}

async function runTests() {
  console.log('开始测试', apis.length, '个数据源...');
  console.log('');
  
  const results = [];
  
  for (let i = 0; i &lt; apis.length; i++) {
    const api = apis[i];
    console.log('测试: ' + api.name);
    console.log('      ' + api.desc);
    console.log('      URL: ' + api.url.substring(0, 60) + (api.url.length &gt; 60 ? '...' : ''));
    
    const result = await testApi(api.name, api.url);
    results.push(result);
    console.log('');
    
    // 间隔1秒
    if (i &lt; apis.length - 1) {
      await new Promise((resolve) =&gt; setTimeout(resolve, 1000));
    }
  }
  
  // 总结
  console.log('================================================================================');
  console.log('测试结果总结');
  console.log('================================================================================');
  
  const successCount = results.filter(r =&gt; r.success).length;
  console.log('');
  console.log('成功: ' + successCount + '/' + results.length);
  console.log('失败: ' + (results.length - successCount) + '/' + results.length);
  console.log('');
  
  console.log('详细结果:');
  for (let j = 0; j &lt; results.length; j++) {
    const r = results[j];
    const icon = r.success ? '✅' : '❌';
    console.log('   ' + icon + ' ' + r.name);
  }
  console.log('');
  
  if (successCount &gt; 0) {
    console.log('可以使用的API:');
    const working = results.filter(r =&gt; r.success);
    for (let k = 0; k &lt; working.length; k++) {
      console.log('   ' + (k+1) + '. ' + working[k].name);
    }
  } else {
    console.log('❌ 当前环境网络受限，所有外部API都无法访问');
    console.log('💡 建议在您自己的网络环境中部署');
    console.log('📖 查看: 网络API解决方案.md');
  }
  
  console.log('');
  console.log('================================================================================');
  console.log('测试完成');
  console.log('================================================================================');
}

runTests().catch(console.error);
