// Create admin user manually - no network dependencies
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    // Connect to local MongoDB
    await mongoose.connect('mongodb://localhost:27017/createhub');
    console.log('✅ Connected to MongoDB');

    // Define User schema inline
    const UserSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, default: 'public' },
      status: { type: String, default: 'active' }
    });

    // Add password hashing middleware
    UserSchema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();
      this.password = await bcrypt.hash(this.password, 12);
      next();
    });

    UserSchema.methods.matchPassword = async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };

    const User = mongoose.model('User', UserSchema);

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'nicholasmbaluka05@gmail.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('🔑 Email:', existingAdmin.email);
      console.log('🔐 Role:', existingAdmin.role);
      
      // Test password
      const isMatch = await existingAdmin.matchPassword('Nisuchondey2702#');
      console.log('🔐 Password test:', isMatch ? '✅ Correct' : '❌ Incorrect');
    } else {
      // Create admin user
      const admin = await User.create({
        firstName: 'Nicholas',
        lastName: 'Baluka',
        email: 'nicholasmbaluka05@gmail.com',
        password: 'Nisuchondey2702#',
        role: 'admin',
        status: 'active'
      });
      
      console.log('✅ Admin user created successfully');
      console.log('🔑 Email:', admin.email);
      console.log('🔐 Role:', admin.role);
    }

    // Test login
    const testUser = await User.findOne({ email: 'nicholasmbaluka05@gmail.com' });
    if (testUser) {
      const loginTest = await testUser.matchPassword('Nisuchondey2702#');
      console.log('🔐 Login test result:', loginTest ? '✅ SUCCESS' : '❌ FAILED');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdminUser();
