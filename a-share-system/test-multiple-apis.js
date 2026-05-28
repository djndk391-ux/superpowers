
const http = require('http');
const https = require('https');

console.log('='.repeat(80));
console.log('🌐 A股数据源API - 全面测试');
console.log('='.repeat(80));
console.log('📅 当前时间:', new Date().toLocaleString('zh-CN'));
console.log('');

// 定义要测试的API列表
const apiTestList = [
  {
    name: '东方财富 - 板块数据',
    url: 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&amp;pz=10&amp;po=1&amp;np=1&amp;fltt=2&amp;fid=f3&amp;fs=m:90+t:2+f:!50&amp;fields=f1,f2,f3,f4,f5,f6,f12,f14',
    description: '获取A股板块行情数据'
  },
  {
    name: '东方财富 - 个股数据',
    url: 'https://push2.eastmoney.com/api/qt/stock/get?secid=0.300223&amp;fields=f43,f44,f47,f57,f58,f170',
    description: '获取寒武纪(300223)个股数据'
  },
  {
    name: '新浪财经 - 个股实时',
    url: 'http://hq.sinajs.cn/list=sz300223',
    description: '新浪免费实时行情'
  },
  {
    name: '腾讯财经 - 个股数据',
    url: 'http://qt.gtimg.cn/q=s_sz300223',
    description: '腾讯免费行情接口'
  },
  {
    name: '网络测试 - 百度',
    url: 'https://www.baidu.com',
    description: '测试基本网络连接'
  },
  {
    name: '网络测试 - GitHub',
    url: 'https://api.github.com',
    description: '测试外部API连接'
  },
  {
    name: '新浪财经 - 板块列表',
    url: 'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?page=1&amp;num=10&amp;sort=symbol&amp;asc=1&amp;node=hs_a',
    description: '新浪板块数据API'
  }
];

function makeRequest(apiInfo) {
  return new Promise((resolve) =&gt; {
    const startTime = Date.now();
    const client = apiInfo.url.startsWith('https') ? https : http;
    const timeout = 10000; // 10秒超时
    
    let timedOut = false;
    const timeoutId = setTimeout(() =&gt; {
      timedOut = true;
      const time = Date.now() - startTime;
      console.log(`   ❌ 超时 (${time}ms)`);
      resolve({
        success: false,
        name: apiInfo.name,
        error: 'Request timeout',
        time: time
      });
    }, timeout);

    try {
      const req = client.get(apiInfo.url, { timeout }, (res) =&gt; {
        if (timedOut) return;
        clearTimeout(timeoutId);
        
        const time = Date.now() - startTime;
        let data = '';
        
        res.on('data', (chunk) =&gt; {
          data += chunk;
        });
        
        res.on('end', () =&gt; {
          const hasData = data &amp;&amp; data.length &gt; 0;
          const success = res.statusCode &gt;= 200 &amp;&amp; res.statusCode &lt; 300 &amp;&amp; hasData;
          
          if (success) {
            console.log(`   ✅ 成功 (${time}ms) - 状态: ${res.statusCode}`);
            console.log(`      📄 返回数据长度: ${data.length} 字符`);
            // 显示数据预览
            try {
              const parsed = JSON.parse(data);
              console.log(`      📊 数据结构: ${typeof parsed}`);
            } catch (e) {
              console.log(`      📊 数据格式: ${data.substring(0, 50)}...`);
            }
          } else {
            console.log(`   ⚠️ 响应但状态异常 (${time}ms) - 状态: ${res.statusCode}`);
            if (data &amp;&amp; data.length &gt; 0) {
              console.log(`      响应: ${data.substring(0, 100)}...`);
            }
          }
          
          resolve({
            success: success,
            name: apiInfo.name,
            statusCode: res.statusCode,
            data: hasData ? data.substring(0, 200) : null,
            time: time
          });
        });
      });
      
      req.on('error', (error) =&gt; {
        if (timedOut) return;
        clearTimeout(timeoutId);
        const time = Date.now() - startTime;
        console.log(`   ❌ 错误 (${time}ms): ${error.message}`);
        resolve({
          success: false,
          name: apiInfo.name,
          error: error.message,
          time: time
        });
      });
      
      req.end();
    } catch (error) {
      if (!timedOut) {
        clearTimeout(timeoutId);
        const time = Date.now() - startTime;
        console.log(`   ❌ 异常: ${error.message}`);
        resolve({
          success: false,
          name: apiInfo.name,
          error: error.message,
          time: time
        });
      }
    }
  });
}

async function runAllTests() {
  console.log('开始测试', apiTestList.length, '个数据源...');
  console.log('='.repeat(80));
  console.log('');
  
  const results = [];
  
  for (let i = 0; i &lt; apiTestList.length; i++) {
    const api = apiTestList[i];
    console.log(`[${i + 1}/${apiTestList.length}] 🧪 ${api.name}`);
    console.log(`   📝 ${api.description}`);
    console.log(`   🔗 ${api.url}`);
    
    const result = await makeRequest(api);
    results.push(result);
    console.log('');
    
    // 每个测试间隔1秒，避免触发限流
    if (i &lt; apiTestList.length - 1) {
      await new Promise(resolve =&gt; setTimeout(resolve, 1000));
    }
  }
  
  // 生成总结报告
  console.log('='.repeat(80));
  console.log('📊 测试结果总结');
  console.log('='.repeat(80));
  
  const successCount = results.filter(r =&gt; r.success).length;
  console.log(`\n📈 成功: ${successCount}/${results.length}`);
  console.log(`📉 失败: ${results.length - successCount}/${results.length}`);
  
  console.log('\n🔍 详细结果:');
  results.forEach((result, index) =&gt; {
    const statusIcon = result.success ? '✅' : '❌';
    console.log(`   ${statusIcon} [${index + 1}] ${result.name}`);
  });
  
  // 推荐可行的方案
  console.log('\n🎯 推荐方案:');
  const workingApis = results.filter(r =&gt; r.success);
  if (workingApis.length &gt; 0) {
    console.log(`   以下 ${workingApis.length} 个API可以使用:`);
    workingApis.forEach((api, index) =&gt; {
      console.log(`   ${index + 1}. ${api.name}`);
    });
  } else {
    console.log('   ❌ 当前环境网络受限，所有外部API都无法访问');
    console.log('   💡 建议在您自己的网络环境中部署');
    console.log('   📖 查看: 网络API解决方案.md');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('测试完成！');
  console.log('='.repeat(80));
}

// 运行测试
runAllTests().catch(console.error);
