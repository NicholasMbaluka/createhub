const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/createhub';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('❌ All MongoDB connection attempts exhausted. Exiting.');
        console.log('⚠️  Please ensure MongoDB is running or set MONGODB_URI environment variable');
        process.exit(1);
      }
    }
  }
};

/**
 * Returns true once Mongoose reports readyState === 1 (connected).
 * Polls up to `maxWaitMs` milliseconds before giving up.
 */
const waitForConnection = (maxWaitMs = 30000, intervalMs = 500) => {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) return resolve();

    const deadline = Date.now() + maxWaitMs;
    const timer = setInterval(() => {
      if (mongoose.connection.readyState === 1) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() >= deadline) {
        clearInterval(timer);
        reject(new Error(`MongoDB not ready after ${maxWaitMs / 1000}s`));
      }
    }, intervalMs);
  });
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

module.exports = connectDB;
module.exports.waitForConnection = waitForConnection;
