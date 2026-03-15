const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

// Create admin user directly using the existing connection
async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'nicholasmbaluka05@gmail.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash the password with high security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('Nisuchondey2702#', saltRounds);

    // Create admin user
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
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: nicholasmbaluka05@gmail.com');
    console.log('🔑 Role: admin');
    console.log('🛡️ Password encrypted with bcrypt (12 salt rounds)');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
}

module.exports = createAdmin;
