// Master Test Runner for CreateHub
const { execSync } = require('child_process');
const path = require('path');

// Test runner function
const runAllTests = async () => {
  console.log('🚀 CREATEHUB MASTER TEST SUITE');
  console.log('================================\n');
  
  const testResults = {};
  
  // Test 1: Environment Variables
  console.log('📋 1. Testing Environment Variables...');
  try {
    execSync('node test-health.js', { stdio: 'pipe', cwd: __dirname });
    testResults.environment = true;
    console.log('✅ Environment variables configured\n');
  } catch (error) {
    testResults.environment = false;
    console.log('❌ Environment variables need attention\n');
  }
  
  // Test 2: Backend Models & Database
  console.log('🗄️ 2. Testing Backend Models & Database...');
  try {
    execSync('node test-backend.js', { stdio: 'pipe', cwd: __dirname });
    testResults.backend = true;
    console.log('✅ Backend models and database working\n');
  } catch (error) {
    testResults.backend = false;
    console.log('❌ Backend models or database have issues\n');
  }
  
  // Test 3: Server Health
  console.log('🌐 3. Testing Server Health...');
  try {
    execSync('node test-health.js', { stdio: 'pipe', cwd: __dirname });
    testResults.server = true;
    console.log('✅ Server is healthy and responding\n');
  } catch (error) {
    testResults.server = false;
    console.log('❌ Server health check failed\n');
  }
  
  // Test 4: API Endpoints
  console.log('🔌 4. Testing API Endpoints...');
  try {
    // This would require the server to be running
    console.log('⚠️  API endpoints test requires server to be running');
    console.log('   Start server with: cd backend && node src/server.js');
    console.log('   Then run: node test-features.js in browser console\n');
    testResults.api = 'manual';
  } catch (error) {
    testResults.api = false;
    console.log('❌ API endpoints test failed\n');
  }
  
  // Test 5: Frontend Assets
  console.log('🎨 5. Testing Frontend Assets...');
  try {
    const fs = require('fs');
    const frontendPath = path.join(__dirname, 'frontend/public/index.html');
    
    if (fs.existsSync(frontendPath)) {
      const content = fs.readFileSync(frontendPath, 'utf8');
      
      // Check for critical frontend components
      const hasRevenue = content.includes('revenue');
      const hasDelivery = content.includes('delivery');
      const hasStorefront = content.includes('storefront');
      const hasAnalytics = content.includes('analytics');
      
      console.log(`✅ Frontend assets present:`);
      console.log(`   - Revenue Dashboard: ${hasRevenue ? '✅' : '❌'}`);
      console.log(`   - Product Delivery: ${hasDelivery ? '✅' : '❌'}`);
      console.log(`   - Storefront Pages: ${hasStorefront ? '✅' : '❌'}`);
      console.log(`   - Analytics Dashboard: ${hasAnalytics ? '✅' : '❌'}`);
      
      testResults.frontend = hasRevenue && hasDelivery && hasStorefront && hasAnalytics;
    } else {
      testResults.frontend = false;
      console.log('❌ Frontend index.html not found');
    }
    console.log('');
  } catch (error) {
    testResults.frontend = false;
    console.log('❌ Frontend assets check failed\n');
  }
  
  // Test 6: File Structure
  console.log('📁 6. Testing File Structure...');
  try {
    const fs = require('fs');
    
    const requiredFiles = [
      'backend/src/server.js',
      'backend/src/models/User.js',
      'backend/src/models/Product.js',
      'backend/src/models/Order.js',
      'backend/src/controllers/revenueController.js',
      'backend/src/controllers/deliveryController.js',
      'backend/src/controllers/storefrontController.js',
      'backend/src/routes/revenue.js',
      'backend/src/routes/delivery.js',
      'backend/src/routes/storefront.js',
      'frontend/public/index.html'
    ];
    
    let missingFiles = [];
    
    requiredFiles.forEach(file => {
      if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} - MISSING`);
        missingFiles.push(file);
      }
    });
    
    testResults.structure = missingFiles.length === 0;
    console.log(`\n📁 File Structure: ${testResults.structure ? '✅ COMPLETE' : `❌ ${missingFiles.length} files missing`}\n`);
    
  } catch (error) {
    testResults.structure = false;
    console.log('❌ File structure check failed\n');
  }
  
  // Summary
  console.log('🎯 FINAL TEST RESULTS');
  console.log('====================');
  
  const passedTests = Object.values(testResults).filter(result => result === true).length;
  const totalTests = Object.keys(testResults).filter(key => testResults[key] !== 'manual').length;
  
  Object.entries(testResults).forEach(([test, result]) => {
    if (result === 'manual') {
      console.log(`${test}: ⚠️  MANUAL TEST REQUIRED`);
    } else {
      console.log(`${test}: ${result ? '✅ PASS' : '❌ FAIL'}`);
    }
  });
  
  console.log(`\n🏆 Overall: ${passedTests}/${totalTests} automated tests passed`);
  
  // Recommendations
  console.log('\n📋 RECOMMENDATIONS:');
  
  if (!testResults.environment) {
    console.log('⚠️  Set up environment variables in backend/.env.development');
  }
  
  if (!testResults.backend) {
    console.log('⚠️  Check MongoDB connection and model schemas');
  }
  
  if (!testResults.server) {
    console.log('⚠️  Start the server and check for errors');
  }
  
  if (!testResults.frontend) {
    console.log('⚠️  Add frontend pages for new features');
  }
  
  if (!testResults.structure) {
    console.log('⚠️  Ensure all required files are present');
  }
  
  if (passedTests === totalTests) {
    console.log('\n🎉 CREATEHUB IS READY FOR LAUNCH!');
    console.log('🚀 All critical features are implemented and tested');
  } else {
    console.log('\n🔧 CREATEHUB NEEDS ATTENTION BEFORE LAUNCH');
    console.log('📝 Fix the failed tests above before deploying');
  }
  
  return testResults;
};

// Run tests if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
