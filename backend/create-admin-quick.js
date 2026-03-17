// Quick Admin Creation Script
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/createhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  status: String
});

const User = mongoose.model('User', userSchema);

// Create admin function
async function createAdmin() {
  try {
    console.log('🔑 Creating admin account...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'nicholasmbaluka05@gmail.com' });
    if (existingAdmin) {
      console.log('✅ Admin account already exists!');
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Nisuchondey2702#', 12);
    
    // Create admin
    const admin = new User({
      firstName: 'Nicholas',
      lastName: 'Baluka',
      email: 'nicholasmbaluka05@gmail.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    });
    
    await admin.save();
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: nicholasmbaluka05@gmail.com');
    console.log('🔑 Password: Nisuchondey2702#');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

// Run the function
createAdmin();
