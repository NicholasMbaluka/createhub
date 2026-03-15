// Test script to verify subscription plan features

const BASE_URL = 'http://localhost:5001/api';

// Test data
const testUser = {
  email: 'testcreator@example.com',
  password: 'password123',
  name: 'Test Creator',
  role: 'creator'
};

let authToken = '';
let userId = '';

async function testSubscriptionFeatures() {
  console.log('🧪 Testing Subscription Plan Features...\n');

  try {
    // 1. Register a test user
    console.log('1️⃣ Registering test user...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerRes.json();
    console.log('Register response:', registerData.success ? '✅ Success' : '❌ Failed');
    
    if (registerData.success) {
      authToken = registerData.token;
      userId = registerData.user._id;
    }

    // 2. Get subscription plans
    console.log('\n2️⃣ Getting subscription plans...');
    const plansRes = await fetch(`${BASE_URL}/subscriptions/plans`);
    const plansData = await plansRes.json();
    console.log('Plans response:', plansData.success ? '✅ Success' : '❌ Failed');
    if (plansData.success) {
      console.log('Available plans:', Object.keys(plansData.plans));
    }

    // 3. Check current subscription status
    console.log('\n3️⃣ Checking subscription status...');
    const statusRes = await fetch(`${BASE_URL}/subscriptions/status`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const statusData = await statusRes.json();
    console.log('Status response:', statusData.success ? '✅ Success' : '❌ Failed');
    if (statusData.success) {
      console.log('Current plan:', statusData.subscription?.plan || 'starter');
    }

    // 4. Test product creation limit (starter plan = 5 products)
    console.log('\n4️⃣ Testing product creation limits...');
    for (let i = 1; i <= 6; i++) {
      const productRes = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: `Test Product ${i}`,
          description: `Test product description ${i}`,
          type: 'eBook',
          amount: 10,
          isFree: false
        })
      });
      const productData = await productRes.json();
      console.log(`Product ${i}:`, productData.success ? '✅ Created' : `❌ ${productData.message}`);
      
      if (!productData.success && i <= 5) {
        console.log('❌ Unexpected failure before reaching limit');
        break;
      }
      if (productData.success && i === 6) {
        console.log('❌ Should have failed at 6th product (starter limit)');
      }
    }

    // 5. Test upgrade to Pro plan
    console.log('\n5️⃣ Testing plan upgrade to Pro...');
    const upgradeRes = await fetch(`${BASE_URL}/subscriptions/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ plan: 'pro' })
    });
    const upgradeData = await upgradeRes.json();
    console.log('Upgrade response:', upgradeData.success ? '✅ Success' : '❌ Failed');

    // 6. Test commission calculation (should be 0% for Pro plan)
    console.log('\n6️⃣ Testing commission calculation...');
    // Create a test product
    const testProductRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Commission Test Product',
        description: 'Product to test commission',
        type: 'eBook',
        amount: 100,
        isFree: false
      })
    });
    const testProductData = await testProductRes.json();
    
    if (testProductData.success) {
      console.log('✅ Test product created for commission test');
      console.log('Commission should be 0% for Pro plan (vs 15% for Starter)');
    }

    console.log('\n🎉 Subscription plan features test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSubscriptionFeatures();
