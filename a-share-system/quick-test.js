
const http = require('http');

console.log('Testing backend API...\n');

function testApi(path, callback) {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: path,
    method: 'GET',
    timeout: 30000
  };
  
  console.log('Testing: ' + path);
  
  const req = http.request(options, (res) =&gt; {
    let data = '';
    res.on('data', (chunk) =&gt; { data += chunk; });
    res.on('end', () =&gt; {
      try {
        const json = JSON.parse(data);
        callback(null, json);
      } catch (e) {
        callback(null, { raw: data });
      }
    });
  });
  
  req.on('error', (e) =&gt; { callback(e, null); });
  req.end();
}

console.log('1. Testing /api/market-data...');
testApi('/api/market-data', (err, result) =&gt; {
  if (err) {
    console.log('Error:', err.message);
    return;
  }
  
  if (result.success &amp;&amp; result.data) {
    console.log('\n=== Data Source Info ===');
    console.log('Source:', result.data.dataSource);
    console.log('Type:', result.data.dataType);
    console.log('Time:', result.data.collectionTime);
    
    if (result.data.sectors &amp;&amp; result.data.sectors.length &gt; 0) {
      console.log('\n=== Top Sectors ===');
      for (let i = 0; i &lt; Math.min(3, result.data.sectors.length); i++) {
        const s = result.data.sectors[i];
        const sign = s.changePercent &gt;= 0 ? '+' : '';
        console.log((i+1) + '. ' + s.name + ' | ' + sign + s.changePercent.toFixed(2) + '% | ' + (s.volume/100000000).toFixed(1) + '亿');
        console.log('   Data type:', s.dataType || 'N/A');
      }
    }
    
    const isReal = result.data.dataType === '真实API';
    console.log('\n=== Summary ===');
    if (isReal) {
      console.log('SUCCESS: Got real API data!');
    } else {
      console.log('Using mock data, but system is ready.');
    }
  } else {
    console.log('Result:', result);
  }
  
  console.log('\nDone.');
});

