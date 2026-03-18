const fs = require('fs');
const path = require('path');

// Production environment configuration
const prodConfig = {
  // Server Configuration
  NODE_ENV: 'production',
  PORT: '5000',
  
  // Frontend URL (update with your deployed URL)
  FRONTEND_URL: 'https://your-app-name.vercel.app',
  
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

// Create production .env file
const envContent = Object.entries(prodConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(path.join(__dirname, '.env.production'), envContent);

console.log('✅ .env.production file created successfully!');
console.log('\n📝 IMPORTANT: Update these values for production:');
console.log('1. FRONTEND_URL - Set to your actual Vercel URL');
console.log('2. RESEND_API_KEY - Set to your production Resend API key');
console.log('3. MONGODB_URI - Set to your production MongoDB Atlas URI');
console.log('4. JWT_SECRET - Generate a strong production secret key');
console.log('5. STRIPE_* - Add your Stripe keys if using payments');
console.log('\n🚀 Ready for deployment!');
