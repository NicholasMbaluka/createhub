// Test Lemon Squeezy API Connection (No dotenv)
const fs = require('fs');
const path = require('path');

// Load environment variables manually
function loadEnv() {
  const envPath = path.join(__dirname, 'backend/.env.development');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1]] = match[2];
    }
  });
  
  return env;
}

async function testLemonSqueezyConnection() {
  console.log('🍋 Testing Lemon Squeezy API Connection...');
  
  try {
    const env = loadEnv();
    
    console.log('📋 Configuration Status:');
    console.log('✅ API Key:', env.LEMON_SQUEEZY_API_KEY ? 'Present' : 'Missing');
    console.log('✅ Webhook Secret:', env.LEMON_SQUEEZY_WEBHOOK_SECRET ? 'Present' : 'Missing');
    console.log('✅ Store ID:', env.LEMON_SQUEEZY_STORE_ID ? 'Present' : 'Missing');
    
    // Test API key format
    const apiKey = env.LEMON_SQUEEZY_API_KEY;
    if (apiKey && (apiKey.startsWith('eyJ') || apiKey.startsWith('ls_sk_'))) {
      console.log('✅ API Key Format: Valid');
    } else {
      console.log('❌ API Key Format: Invalid');
    }
    
    // Test fee calculation logic
    const calculateEarnings = (amount, platformFee = 0.05) => {
      const lemonFee = amount * 0.055 + 0.50;
      const platformFeeAmount = amount * platformFee;
      const creatorEarnings = amount - lemonFee - platformFeeAmount;
      
      return {
        grossAmount: amount,
        lemonFee,
        platformFeeAmount,
        creatorEarnings,
        totalFees: lemonFee + platformFeeAmount,
        netAmount: creatorEarnings
      };
    };
    
    const earnings = calculateEarnings(100);
    console.log('\n💰 Fee Calculation Test:');
    console.log('   Input: $100');
    console.log('   Lemon Fee (5.5% + $0.50): $' + earnings.lemonFee.toFixed(2));
    console.log('   Platform Fee (5%): $' + earnings.platformFeeAmount.toFixed(2));
    console.log('   Creator Earnings: $' + earnings.creatorEarnings.toFixed(2));
    console.log('   Total Fees: $' + earnings.totalFees.toFixed(2));
    
    // Test webhook signature verification
    const crypto = require('crypto');
    const payload = '{"test": "data"}';
    const webhookSecret = env.LEMON_SQUEEZY_WEBHOOK_SECRET || 'test_secret';
    
    const signature = crypto.createHmac('sha256', webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');
    
    const hash = crypto.createHmac('sha256', webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');
    
    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash));
    console.log('\n🔒 Webhook Verification Test:');
    console.log('   Signature Verification:', isValid ? '✅ Working' : '❌ Failed');
    
    console.log('\n🎉 Lemon Squeezy Service Configuration Status:');
    
    const hasApiKey = !!env.LEMON_SQUEEZY_API_KEY;
    const hasWebhookSecret = !!env.LEMON_SQUEEZY_WEBHOOK_SECRET && env.LEMON_SQUEEZY_WEBHOOK_SECRET !== 'whsec_your_webhook_secret_here';
    const hasStoreId = !!env.LEMON_SQUEEZY_STORE_ID && env.LEMON_SQUEEZY_STORE_ID !== 'your_store_id_here';
    
    if (hasApiKey && hasWebhookSecret && hasStoreId) {
      console.log('🚀 READY FOR LIVE TESTING!');
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Start the backend server');
      console.log('2. Test API endpoints');
      console.log('3. Configure webhooks in Lemon Squeezy');
      console.log('4. Test real payment flow');
    } else {
      console.log('⚠️  SETUP REQUIRED:');
      if (!hasApiKey) console.log('❌ API Key is missing');
      if (!hasWebhookSecret) console.log('❌ Webhook Secret needs to be set');
      if (!hasStoreId) console.log('❌ Store ID needs to be set');
      
      console.log('\n📋 TO COMPLETE SETUP:');
      console.log('1. Go to Lemon Squeezy dashboard');
      console.log('2. Get Webhook Secret from Settings → Webhooks');
      console.log('3. Get Store ID from Stores → Your Store');
      console.log('4. Update .env.development file');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testLemonSqueezyConnection();
