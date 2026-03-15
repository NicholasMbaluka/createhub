const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

// Create secure admin account
async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/createhub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'nicholasmbaluka05@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user with strong password
    const adminUser = new User({
      firstName: 'Nicholas',
      lastName: 'Baluka',
      email: 'nicholasmbaluka05@gmail.com',
      password: 'Nisuchondey2702#', // Will be hashed automatically
      role: 'admin',
      status: 'active',
      emailVerified: true, // Auto-verify admin
      subscription: {
        plan: 'premium',
        status: 'active'
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: nicholasmbaluka05@gmail.com');
    console.log('🔑 Role: admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminUser();
