const fs = require('fs');
const path = require('path');

// Railway environment configuration
const railwayConfig = {
  // Server Configuration
  NODE_ENV: 'production',
  PORT: '5000',
  
  // Frontend URL (Railway will provide this)
  FRONTEND_URL: 'https://your-app-name.up.railway.app',
  
  // JWT Configuration
  JWT_SECRET: 'your-super-secret-jwt-key-minimum-32-characters-long',
  JWT_EXPIRE: '30d',
  
  // MongoDB Atlas (you need to update this)
  MONGODB_URI: 'mongodb+srv://username:password@cluster0.mongodb.net/createhub?retryWrites=true&w=majority',
  
  // Resend Email API
  RESEND_API_KEY: 're_your_resend_api_key_here',
  RESEND_FROM_EMAIL: 'noreply@your-domain.com',
  
  // Stripe (optional)
  STRIPE_SECRET_KEY: 'sk_test_your_stripe_secret_key_here',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_your_stripe_publishable_key_here',
  STRIPE_WEBHOOK_SECRET: 'whsec_your_webhook_secret_here',
  
  // Security
  BCRYPT_SALT_ROUNDS: '12',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100'
};

// Create Railway environment variables file
const envContent = Object.entries(railwayConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(path.join(__dirname, '.env.railway'), envContent);

console.log('✅ .env.railway file created successfully!');
console.log('\n📝 Railway Environment Variables Setup:');
console.log('1. Go to your Railway project dashboard');
console.log('2. Navigate to Variables tab');
console.log('3. Add these environment variables:');
console.log('');

Object.entries(railwayConfig).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

console.log('\n🚀 Railway Deployment Steps:');
console.log('1. Push your code to GitHub');
console.log('2. Connect Railway to your GitHub repository');
console.log('3. Configure environment variables in Railway dashboard');
console.log('4. Deploy!');
