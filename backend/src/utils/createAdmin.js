const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Check if User model is available
    if (!User) {
      console.log('⚠️  User model not available, skipping admin creation');
      return;
    }

    const existingAdmin = await User.findOne({ email: 'nicholasmbaluka05@gmail.com' });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Nisuchondey2702#', 10);
      
      const admin = new User({
        name: 'Admin User',
        email: 'nicholasmbaluka05@gmail.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    // Don't crash the app if admin creation fails
    console.log('⚠️  Admin creation failed, but app will continue running');
  }
};

module.exports = createAdmin;
