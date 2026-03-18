const fs = require('fs');
const path = require('path');

// Configuration script for CreateHub environment variables
const config = {
  // Basic development configuration
  NODE_ENV: 'development',
  PORT: '5000',
  FRONTEND_URL: 'http://localhost:3000',
  
  // JWT Configuration
  JWT_SECRET: 'your-super-secret-jwt-key-minimum-32-characters-long',
  JWT_EXPIRE: '30d',
  
  // Email Configuration (Resend)
  RESEND_API_KEY: 're_your_resend_api_key_here',
  RESEND_FROM_EMAIL: 'noreply@your-domain.com',
  
  // MongoDB (you need to update this)
  MONGODB_URI: 'mongodb+srv://username:password@cluster0.mongodb.net/createhub?retryWrites=true&w=majority',
  
  // Security
  BCRYPT_SALT_ROUNDS: '12',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100'
};

// Create .env file
const envContent = Object.entries(config)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(path.join(__dirname, '.env'), envContent);

console.log('✅ .env file created successfully!');
console.log('\n📝 IMPORTANT: Update these values in your .env file:');
console.log('1. RESEND_API_KEY - Get from https://resend.com/dashboard');
console.log('2. MONGODB_URI - Get from MongoDB Atlas');
console.log('3. JWT_SECRET - Generate a strong secret key');
console.log('4. FRONTEND_URL - Update with your actual frontend URL');
