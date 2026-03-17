// Direct admin creation script
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function createAdminAccount() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/createhub');
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'nicholasmbaluka05@gmail.com' });
    if (existingAdmin) {
      console.log('✅ Admin account already exists');
      await mongoose.disconnect();
      return;
    }

    // Create admin with encrypted password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('Nisuchondey2702#', saltRounds);

    const admin = new User({
      firstName: 'Nicholas',
      lastName: 'Baluka',
      email: 'nicholasmbaluka05@gmail.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      emailVerified: true,
      subscription: {
        plan: 'premium',
        status: 'active'
      }
    });

    await admin.save();
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: nicholasmbaluka05@gmail.com');
    console.log('🔑 Password: Nisuchondey2702#');
    console.log('🛡️ Role: admin');
    console.log('🔐 Password encrypted with 12 salt rounds');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminAccount();
