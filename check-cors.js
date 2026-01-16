// Script สำหรับตรวจสอบ CORS issues
const fetch = require('node-fetch');

async function checkCORS() {
  const testUrls = [
    'https://backend-smart-condo.onrender.com',
  ];

  const apiUrl = 'https://backend-smart-condo.onrender.com/api/health';
  const token = '66122519026';

  console.log('🔍 ตรวจสอบ CORS Issues');
  console.log('='.repeat(50));

  for (const origin of testUrls) {
    console.log(`\nTesting from origin: ${origin}`);

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'X-API-Token': token,
          'Origin': origin
        }
      });

      console.log(`  Status: ${response.status} ${response.statusText}`);
      console.log(`  Headers:`);
      response.headers.forEach((value, key) => {
        if (key.toLowerCase().includes('access-control')) {
          console.log(`    ${key}: ${value}`);
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`  Response:`, data);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ การตรวจสอบ CORS เสร็จสิ้น');
}

checkCORS();