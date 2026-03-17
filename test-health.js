// Server Health Check Script
const http = require('http');

// Test server connectivity
const testServerHealth = async () => {
  console.log('🧪 Testing Server Health...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const healthData = JSON.parse(data);
          console.log('✅ Server Health Response:', {
            status: res.statusCode,
            success: healthData.success,
            message: healthData.message,
            version: healthData.version
          });
          resolve(res.statusCode === 200 && healthData.success);
        } catch (error) {
          console.log('❌ Invalid health response:', error.message);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Server Health Check Failed:', error.message);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('❌ Server Health Check Timed Out');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
};

// Test API endpoints
const testAPIEndpoints = async () => {
  console.log('🧪 Testing API Endpoints...');
  
  const endpoints = [
    { path: '/api/health', method: 'GET', auth: false },
    { path: '/api/auth/register', method: 'POST', auth: false },
    { path: '/api/products/public', method: 'GET', auth: false },
    { path: '/api/users/me', method: 'GET', auth: true },
    { path: '/api/revenue/dashboard', method: 'GET', auth: true },
    { path: '/api/storefront/test', method: 'GET', auth: false }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const success = await testEndpoint(endpoint);
      results[endpoint.path] = success;
      console.log(`${success ? '✅' : '❌'} ${endpoint.method} ${endpoint.path}`);
    } catch (error) {
      results[endpoint.path] = false;
      console.log(`❌ ${endpoint.method} ${endpoint.path} - ${error.message}`);
    }
  }
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 API Endpoints: ${passedTests}/${totalTests} reachable`);
  
  return passedTests === totalTests;
};

// Test individual endpoint
const testEndpoint = (endpoint) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint.path,
      method: endpoint.method,
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (endpoint.auth) {
      options.headers['Authorization'] = 'Bearer test-token';
    }
    
    const req = http.request(options, (res) => {
      resolve(res.statusCode < 500); // Consider 4xx as reachable
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    if (endpoint.method === 'POST') {
      req.write(JSON.stringify({ test: true }));
    }
    
    req.end();
  });
};

// Test required environment variables
const testEnvironmentVariables = () => {
  console.log('🧪 Testing Environment Variables...');
  
  require('dotenv').config({ path: './backend/.env.development' });
  
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'RESEND_API_KEY'
  ];
  
  const optionalVars = [
    'RESEND_FROM_EMAIL',
    'FRONTEND_URL',
    'NODE_ENV'
  ];
  
  const results = {};
  
  console.log('\nRequired Variables:');
  requiredVars.forEach(varName => {
    const exists = !!process.env[varName];
    results[varName] = exists;
    console.log(`${exists ? '✅' : '❌'} ${varName} ${exists ? 'SET' : 'MISSING'}`);
  });
  
  console.log('\nOptional Variables:');
  optionalVars.forEach(varName => {
    const exists = !!process.env[varName];
    results[varName] = exists;
    console.log(`${exists ? '✅' : '⚠️'} ${varName} ${exists ? 'SET' : 'NOT SET'}`);
  });
  
  const requiredSet = requiredVars.filter(v => !!process.env[v]).length;
  const requiredTotal = requiredVars.length;
  
  console.log(`\n🎯 Environment: ${requiredSet}/${requiredTotal} required variables set`);
  
  return requiredSet === requiredTotal;
};

// Run complete health check
const runCompleteHealthCheck = async () => {
  console.log('🚀 Starting Complete Health Check...\n');
  
  const results = {
    server: await testServerHealth(),
    endpoints: await testAPIEndpoints(),
    environment: testEnvironmentVariables()
  };
  
  console.log('\n🎯 Complete Health Check Results:');
  console.log('=====================================');
  console.log(`Server Health: ${results.server ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Endpoints: ${results.endpoints ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Environment: ${results.environment ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(Boolean);
  
  console.log(`\n🏆 Overall Health: ${allPassed ? '✅ HEALTHY' : '⚠️ NEEDS ATTENTION'}`);
  
  if (allPassed) {
    console.log('🎉 CreateHub is ready for launch!');
  } else {
    console.log('🔧 Some components need fixing before launch.');
  }
  
  return results;
};

// Run if called directly
if (require.main === module) {
  runCompleteHealthCheck();
}

module.exports = { runCompleteHealthCheck, testServerHealth, testAPIEndpoints, testEnvironmentVariables };
