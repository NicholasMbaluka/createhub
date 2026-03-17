// Test Revenue Dashboard API
const testRevenueDashboard = async () => {
  console.log('🧪 Testing Revenue Dashboard API...');
  
  try {
    // Test with a mock creator user
    const testResponse = await fetch('http://localhost:5000/api/revenue/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await testResponse.json();
    
    console.log('✅ Revenue Dashboard Response:', {
      status: testResponse.status,
      success: data.success,
      hasData: !!data.dashboard,
      features: [
        'totalEarnings' in (data.dashboard || {}),
        'chartData' in (data.dashboard || {}),
        'topProducts' in (data.dashboard || {}),
        'recentTransactions' in (data.dashboard || {})
      ]
    });
    
    return data.success;
    
  } catch (error) {
    console.log('❌ Revenue Dashboard Test Failed:', error.message);
    return false;
  }
};

// Test Payout Methods
const testPayoutMethods = async () => {
  console.log('🧪 Testing Payout Methods API...');
  
  try {
    // Test adding payout method
    const addResponse = await fetch('http://localhost:5000/api/revenue/payout-methods', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'bank',
        details: {
          accountNumber: '123456789',
          routingNumber: '987654321',
          accountHolderName: 'Test User'
        }
      })
    });
    
    const addData = await addResponse.json();
    
    // Test getting payout methods
    const getResponse = await fetch('http://localhost:5000/api/revenue/payout-methods', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    const getData = await getResponse.json();
    
    console.log('✅ Payout Methods Response:', {
      addStatus: addResponse.status,
      addSuccess: addData.success,
      getStatus: getResponse.status,
      getSuccess: getData.success,
      hasMethods: Array.isArray(getData.payoutMethods)
    });
    
    return addData.success && getData.success;
    
  } catch (error) {
    console.log('❌ Payout Methods Test Failed:', error.message);
    return false;
  }
};

// Test Product Delivery
const testProductDelivery = async () => {
  console.log('🧪 Testing Product Delivery API...');
  
  try {
    // Test getting purchased products
    const productsResponse = await fetch('http://localhost:5000/api/delivery/my-products', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    const productsData = await productsResponse.json();
    
    // Test getting product content (with mock order ID)
    const contentResponse = await fetch('http://localhost:5000/api/delivery/product/507f1f77bcf86cd799439011', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    const contentData = await contentResponse.json();
    
    console.log('✅ Product Delivery Response:', {
      productsStatus: productsResponse.status,
      productsSuccess: productsData.success,
      hasProducts: Array.isArray(productsData.products),
      contentStatus: contentResponse.status,
      contentSuccess: contentData.success,
      hasContent: !!contentData.content
    });
    
    return productsData.success && contentData.success;
    
  } catch (error) {
    console.log('❌ Product Delivery Test Failed:', error.message);
    return false;
  }
};

// Test Storefront
const testStorefront = async () => {
  console.log('🧪 Testing Storefront API...');
  
  try {
    // Test public storefront
    const publicResponse = await fetch('http://localhost:5000/api/storefront/testcreator', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const publicData = await publicResponse.json();
    
    // Test storefront customization
    const customResponse = await fetch('http://localhost:5000/api/storefront/customization', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    const customData = await customResponse.json();
    
    // Test slug generation
    const slugResponse = await fetch('http://localhost:5000/api/storefront/generate-slug', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Creator'
      })
    });
    
    const slugData = await slugResponse.json();
    
    console.log('✅ Storefront Response:', {
      publicStatus: publicResponse.status,
      publicSuccess: publicData.success,
      hasCreator: !!publicData.storefront?.creator,
      customStatus: customResponse.status,
      customSuccess: customData.success,
      hasCustomization: !!customData.customization,
      slugStatus: slugResponse.status,
      slugSuccess: slugData.success,
      hasSlug: !!slugData.slug
    });
    
    return publicData.success && customData.success && slugData.success;
    
  } catch (error) {
    console.log('❌ Storefront Test Failed:', error.message);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting CreateHub Feature Tests...\n');
  
  const results = {
    revenueDashboard: await testRevenueDashboard(),
    payoutMethods: await testPayoutMethods(),
    productDelivery: await testProductDelivery(),
    storefront: await testStorefront()
  };
  
  console.log('\n🎯 Test Results Summary:');
  console.log('================================');
  console.log(`Revenue Dashboard: ${results.revenueDashboard ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Payout Methods: ${results.payoutMethods ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Product Delivery: ${results.productDelivery ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Storefront: ${results.storefront ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🏆 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All critical features are working!');
  } else {
    console.log('⚠️  Some features need attention.');
  }
  
  return results;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testCreateHub = runAllTests;
  console.log('🧪 Test functions loaded! Run testCreateHub() in console to test all features.');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testRevenueDashboard, testPayoutMethods, testProductDelivery, testStorefront };
}
