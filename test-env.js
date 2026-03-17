// Quick Environment Setup Test
require('dotenv').config({ path: './backend/.env.development' });

console.log('🧪 Testing Environment Setup...\n');

// Check if .env file exists
const fs = require('fs');
const envPath = './backend/.env.development';

if (fs.existsSync(envPath)) {
  console.log('✅ .env.development file exists');
  
  // Check critical variables
  const criticalVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY'
  ];
  
  console.log('\n🔑 Critical Variables:');
  criticalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName.includes('URI') ? 'SET' : value.substring(0, 10) + '...'}`);
    } else {
      console.log(`❌ ${varName}: MISSING`);
    }
  });
  
  // Check optional variables
  console.log('\n📧 Email Variables:');
  const emailVars = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'];
  emailVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: SET`);
    } else {
      console.log(`⚠️  ${varName}: NOT SET (optional)`);
    }
  });
  
  console.log('\n🌐 Server Variables:');
  const serverVars = ['NODE_ENV', 'FRONTEND_URL', 'PORT'];
  serverVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value}`);
    } else {
      console.log(`⚠️  ${varName}: NOT SET (will use default)`);
    }
  });
  
} else {
  console.log('❌ .env.development file NOT found');
  console.log('\n📝 Create .env.development file with:');
  console.log('MONGODB_URI=mongodb://localhost:27017/createhub');
  console.log('JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum');
  console.log('STRIPE_SECRET_KEY=sk_test_...');
  console.log('RESEND_API_KEY=re_...');
  console.log('RESEND_FROM_EMAIL=onboarding@resend.dev');
  console.log('NODE_ENV=development');
  console.log('FRONTEND_URL=http://localhost:5000');
  console.log('PORT=5000');
}

console.log('\n🎯 Next Steps:');
console.log('1. Set up environment variables');
console.log('2. Start MongoDB: mongod --dbpath "C:\\data\\db"');
console.log('3. Start server: cd backend && node src/server.js');
console.log('4. Run API tests in browser console');
