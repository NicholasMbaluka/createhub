const mongoose = require('mongoose');
const User = require('../models/User');

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

/**
 * Waits until Mongoose readyState is 1 (connected), polling every intervalMs.
 * Rejects after maxWaitMs if the connection never arrives.
 */
const waitForDB = (maxWaitMs = 30000, intervalMs = 500) => {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) return resolve();

    const deadline = Date.now() + maxWaitMs;
    const timer = setInterval(() => {
      if (mongoose.connection.readyState === 1) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() >= deadline) {
        clearInterval(timer);
        reject(new Error('Database connection not ready in time'));
      }
    }, intervalMs);
  });
};

const createAdmin = async () => {
  // Resolve credentials with safe defaults so required fields are never empty
  const adminEmail     = (process.env.ADMIN_EMAIL     || 'admin@createhub.io').trim();
  const adminPassword  = (process.env.ADMIN_PASSWORD  || 'ChangeMe#2024!').trim();
  const adminFirstName = (process.env.ADMIN_FIRST_NAME || 'Admin').trim()  || 'Admin';
  const adminLastName  = (process.env.ADMIN_LAST_NAME  || 'User').trim()   || 'User';

  if (!adminEmail || !adminPassword) {
    console.warn('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin creation');
    return;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Ensure the DB connection is live before touching the model
      await waitForDB();

      const existing = await User.findOne({ email: adminEmail }).lean();
      if (existing) {
        console.log('✅ Admin user already exists');
        return;
      }

      // Let the pre-save hook handle password hashing — do NOT pre-hash here
      const admin = new User({
        firstName: adminFirstName,
        lastName:  adminLastName,
        email:     adminEmail,
        password:  adminPassword,
        role:      'admin',
        status:    'active',
        emailVerified: true,
      });

      await admin.save();
      console.log(`✅ Admin user created successfully (${adminEmail})`);
      return;

    } catch (error) {
      const isLastAttempt = attempt === MAX_RETRIES;
      console.error(`❌ Admin creation attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);

      if (error.name === 'ValidationError') {
        // Log each failing field so it is easy to diagnose
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, err]) => {
            console.error(`   • ${field}: ${err.message}`);
          });
        }
        // Validation errors won't be fixed by retrying — bail out early
        console.warn('⚠️  Admin creation skipped due to validation error. App will continue.');
        return;
      }

      if (isLastAttempt) {
        console.warn('⚠️  Admin creation failed after all retries. App will continue.');
        return;
      }

      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1); // exponential backoff
      console.log(`⏳ Retrying admin creation in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = createAdmin;
