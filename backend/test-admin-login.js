// Test admin user existence and login
require('dotenv').config({ path: './.env.development' });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/createhub');
    console.log('✅ Database connected');
    
    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'nicholasmbaluka05@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found in database');
      console.log('🔧 Creating admin user...');
      
      // Create admin user
      const admin = await User.create({
        firstName: 'Nicholas',
        lastName: 'Baluka',
        email: 'nicholasmbaluka05@gmail.com',
        password: 'Nisuchondey2702#',
        role: 'admin'
      });
      
      console.log('✅ Admin user created:', admin.email);
      console.log('🔑 Role:', admin.role);
    } else {
      console.log('✅ Admin user found:', adminUser.email);
      console.log('🔑 Role:', adminUser.role);
      console.log('🔐 Password matches:', await adminUser.matchPassword('Nisuchondey2702#'));
    }
    
    // Test login logic
    const testUser = await User.findOne({ email: 'nicholasmbaluka05@gmail.com' }).select('+password');
    if (testUser) {
      const isMatch = await testUser.matchPassword('Nisuchondey2702#');
      console.log('🔐 Login test result:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
}

testAdminLogin();
