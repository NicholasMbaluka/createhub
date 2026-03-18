const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/createhub');
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Don't exit process - continue with mock data for development
    console.log('⚠️  Running in mock mode - some features may be limited');
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

module.exports = connectDB;
