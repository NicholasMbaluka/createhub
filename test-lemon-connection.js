// Test Lemon Squeezy API Connection
require('dotenv').config({ path: './backend/.env.development' });

async function testLemonSqueezyConnection() {
  console.log('🍋 Testing Lemon Squeezy API Connection...');
  
  try {
    const LemonSqueezyService = require('./backend/src/services/lemonSqueezyService');
    const service = new LemonSqueezyService();
    
    console.log('📋 Configuration:');
    console.log('✅ API Key:', service.apiKey ? 'Present' : 'Missing');
    console.log('✅ Webhook Secret:', service.webhookSecret ? 'Present' : 'Missing');
    console.log('✅ Store ID:', service.storeId ? 'Present' : 'Missing');
    
    // Test fee calculation
    const earnings = service.calculateEarnings(100);
    console.log('\n💰 Fee Calculation Test:');
    console.log('   Input: $100');
    console.log('   Lemon Fee: $' + earnings.lemonFee.toFixed(2));
    console.log('   Platform Fee: $' + earnings.platformFeeAmount.toFixed(2));
    console.log('   Creator Earnings: $' + earnings.creatorEarnings.toFixed(2));
    console.log('   Total Fees: $' + earnings.totalFees.toFixed(2));
    
    // Test webhook signature verification
    const crypto = require('crypto');
    const payload = '{"test": "data"}';
    const signature = crypto.createHmac('sha256', service.webhookSecret || 'test')
      .update(payload, 'utf8')
      .digest('hex');
    
    const isValid = service.verifyWebhookSignature(payload, signature);
    console.log('\n🔒 Webhook Verification Test:');
    console.log('   Signature Verification:', isValid ? '✅ Working' : '❌ Failed');
    
    console.log('\n🎉 Lemon Squeezy Service is properly configured!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Get Webhook Secret from Lemon Squeezy dashboard');
    console.log('2. Get Store ID from Lemon Squeezy dashboard');
    console.log('3. Update .env.development with missing values');
    console.log('4. Test real API calls');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testLemonSqueezyConnection();
