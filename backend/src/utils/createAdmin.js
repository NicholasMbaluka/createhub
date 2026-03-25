const mongoose = require('mongoose');
const User = require('../models/User');

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

// Hard-coded fallbacks — these are used when env vars are absent or empty.
const DEFAULTS = {
  email:     'admin@createhub.io',
  password:  'ChangeMe#2024!',
  firstName: 'Admin',
  lastName:  'User',
};

/**
 * Coerce a raw env-var string into a guaranteed non-empty value.
 * Trims whitespace, then falls back to `fallback` if the result is empty.
 */
const safeStr = (raw, fallback) => {
  const trimmed = (raw || '').trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

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
  // Resolve every credential through safeStr so empty env vars never reach Mongoose.
  const adminEmail     = safeStr(process.env.ADMIN_EMAIL,      DEFAULTS.email);
  const adminPassword  = safeStr(process.env.ADMIN_PASSWORD,   DEFAULTS.password);
  const adminFirstName = safeStr(process.env.ADMIN_FIRST_NAME, DEFAULTS.firstName);
  const adminLastName  = safeStr(process.env.ADMIN_LAST_NAME,  DEFAULTS.lastName);

  console.log('🔧 Admin creation config:');
  console.log(`   email:     ${adminEmail}`);
  console.log(`   firstName: ${adminFirstName}`);
  console.log(`   lastName:  ${adminLastName}`);
  console.log(`   password:  ${'*'.repeat(adminPassword.length)}`);

  // Final sanity-check — these should never be empty after safeStr, but be explicit.
  if (!adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
    console.error('❌ Admin credentials are incomplete after applying defaults — this should not happen.');
    console.error(`   email="${adminEmail}" firstName="${adminFirstName}" lastName="${adminLastName}"`);
    return;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Ensure the DB connection is live before touching the model.
      await waitForDB();

      const existing = await User.findOne({ email: adminEmail }).lean();
      if (existing) {
        console.log(`✅ Admin user already exists (${adminEmail})`);
        return;
      }

      // Build the document explicitly — no spreading, no ambiguity.
      const adminData = {
        firstName:     adminFirstName,
        lastName:      adminLastName,
        email:         adminEmail,
        password:      adminPassword,
        role:          'admin',
        status:        'active',
        emailVerified: true,
      };

      console.log(`🔧 Creating admin document with firstName="${adminData.firstName}" lastName="${adminData.lastName}"`);

      // Let the pre-save hook handle password hashing — do NOT pre-hash here.
      const admin = new User(adminData);

      // Run validation manually first so we get a clear error before attempting save.
      const validationError = admin.validateSync();
      if (validationError) {
        console.error('❌ Admin document failed pre-save validation:');
        Object.entries(validationError.errors).forEach(([field, err]) => {
          console.error(`   • ${field}: ${err.message} (value: "${admin[field]}")`);
        });
        // Attempt save anyway — the pre-validate hook in the schema may still fix it.
      }

      await admin.save();
      console.log(`✅ Admin user created successfully (${adminEmail})`);
      return;

    } catch (error) {
      const isLastAttempt = attempt === MAX_RETRIES;
      console.error(`❌ Admin creation attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);

      if (error.name === 'ValidationError') {
        // Log each failing field with its actual value for easy diagnosis.
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, err]) => {
            console.error(`   • ${field}: ${err.message}`);
          });
        }
        console.error(`   firstName="${adminFirstName}" lastName="${adminLastName}" email="${adminEmail}"`);
        // Validation errors won't be fixed by retrying — bail out early.
        console.warn('⚠️  Admin creation skipped due to validation error. App will continue.');
        return;
      }

      if (isLastAttempt) {
        console.warn('⚠️  Admin creation failed after all retries. App will continue.');
        return;
      }

      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1); // exponential back-off
      console.log(`⏳ Retrying admin creation in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = createAdmin;
