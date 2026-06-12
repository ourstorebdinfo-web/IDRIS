const http = require('http');

async function testUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function findActivePort() {
  const ports = [3000, 3001, 3002];
  for (const port of ports) {
    const url = `http://localhost:${port}/api/site-settings`;
    const res = await testUrl(url);
    if (!res.error && res.statusCode === 200) {
      return port;
    }
  }
  // Try homepage fallback
  for (const port of ports) {
    const url = `http://localhost:${port}/`;
    const res = await testUrl(url);
    if (!res.error) {
      return port;
    }
  }
  return null;
}

async function runTests() {
  console.log('Detecting active local server port...');
  const port = await findActivePort();
  if (!port) {
    console.error('Error: Could not find a running dev server on port 3000, 3001, or 3002. Please ensure the dev server is active.');
    process.exit(1);
  }
  console.log(`Active server detected on port: ${port}\n`);

  const tests = [
    { name: 'Homepage (HTML)', path: '/' },
    { name: 'Categories List Page (HTML)', path: '/categories' },
    { name: 'Shop Page (HTML)', path: '/shop' },
    { name: 'Site Settings API', path: '/api/site-settings', checkJson: (data) => data.siteSetting !== undefined },
    { name: 'Products API', path: '/api/products', checkJson: (data) => Array.isArray(data.products) }
  ];

  let passedCount = 0;
  const productIds = [];
  const categorySlugs = [];

  for (const test of tests) {
    const url = `http://localhost:${port}${test.path}`;
    const res = await testUrl(url);
    if (res.error) {
      console.log(`❌ ${test.name}: FAILED (Error: ${res.error})`);
      continue;
    }

    if (res.statusCode !== 200) {
      console.log(`❌ ${test.name}: FAILED (HTTP Status Code: ${res.statusCode})`);
      continue;
    }

    if (test.checkJson) {
      try {
        const json = JSON.parse(res.data);
        if (test.checkJson(json)) {
          console.log(`✅ ${test.name}: PASSED`);
          passedCount++;
          // Extract data for dynamic testing
          if (test.path === '/api/products' && json.products.length > 0) {
            json.products.slice(0, 2).forEach(p => {
              productIds.push(p.id);
              if (p.category) categorySlugs.push(p.category.toLowerCase().replace(/\s+/g, '-'));
            });
          }
        } else {
          console.log(`❌ ${test.name}: FAILED (JSON structure check failed)`);
        }
      } catch (e) {
        console.log(`❌ ${test.name}: FAILED (Could not parse JSON response)`);
      }
    } else {
      console.log(`✅ ${test.name}: PASSED`);
      passedCount++;
    }
  }

  // Dynamic checks for individual products and categories
  if (productIds.length > 0) {
    const pId = productIds[0];
    const test = { name: `Product Detail API (ID: ${pId})`, path: `/api/products/${pId}`, checkJson: (data) => data.id === pId };
    const url = `http://localhost:${port}${test.path}`;
    const res = await testUrl(url);
    if (!res.error && res.statusCode === 200) {
      try {
        const json = JSON.parse(res.data);
        if (test.checkJson(json)) {
          console.log(`✅ ${test.name}: PASSED`);
          passedCount++;
        } else {
          console.log(`❌ ${test.name}: FAILED (JSON structure check failed)`);
        }
      } catch (e) {
        console.log(`❌ ${test.name}: FAILED (JSON parse error)`);
      }
    } else {
      console.log(`❌ ${test.name}: FAILED (HTTP ${res.statusCode || 'Error'})`);
    }
  }

  if (categorySlugs.length > 0) {
    const slug = categorySlugs[0];
    const test = { name: `Category Page HTML (Slug: ${slug})`, path: `/category/${slug}` };
    const url = `http://localhost:${port}${test.path}`;
    const res = await testUrl(url);
    if (!res.error && res.statusCode === 200) {
      console.log(`✅ ${test.name}: PASSED`);
      passedCount++;
    } else {
      console.log(`❌ ${test.name}: FAILED (HTTP ${res.statusCode || 'Error'})`);
    }
  }

  console.log(`\nVerification Summary: Passed ${passedCount} tests.`);
}

runTests();
