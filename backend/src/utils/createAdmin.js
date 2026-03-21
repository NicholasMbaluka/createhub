const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Check if User model is available
    if (!User) {
      console.log('⚠️  User model not available, skipping admin creation');
      return;
    }

    // Use environment variables for admin credentials (more secure)
    const adminEmail = process.env.ADMIN_EMAIL || 'nicholasmbaluka05@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Nisuchondey2702#';
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Nicholas';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'Mbaluka';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const admin = new User({
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
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
