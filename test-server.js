// Test script to verify all routes work correctly
const http = require('http');

const tests = [
  { name: 'Homepage', url: 'http://localhost:3000/' },
  { name: 'TikTok Tool', url: 'http://localhost:3000/tools/tiktok-title.html' },
  { name: 'Instagram Tool', url: 'http://localhost:3000/tools/instagram-caption.html' },
  { name: 'Password Tool', url: 'http://localhost:3000/tools/password-generator.html' },
  { name: 'CSS File', url: 'http://localhost:3000/css/style.css' },
  { name: 'JS File', url: 'http://localhost:3000/js/main.js' },
  { name: 'Health API', url: 'http://localhost:3000/api/health' },
];

function testUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          length: data.length,
          preview: data.substring(0, 50).replace(/\n/g, ' ')
        });
      });
    }).on('error', (err) => {
      reject(err.message);
    });
  });
}

async function runTests() {
  console.log('🧪 Testing Server Routes...\n');
  
  for (const test of tests) {
    try {
      const result = await testUrl(test.url);
      const status = result.status === 200 ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Type: ${result.contentType || 'N/A'}`);
      console.log(`   Size: ${result.length} bytes`);
      console.log(`   Preview: ${result.preview}...\n`);
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error}\n`);
    }
  }
  
  console.log('📋 Test Summary:');
  console.log('   If all tests show ✅, server is working correctly.');
  console.log('   If you see ❌, check the error messages above.');
  console.log('\n🌐 Open in browser: http://localhost:3000');
}

runTests();

