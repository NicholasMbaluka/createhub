require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');
const { sanitizeInput } = require('./middleware/validation');

const app = express();

// ── Connect Database ──────────────────────────
connectDB();

// ── Enhanced Security Middleware ───────────────
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true,
}));

// ── Rate Limiting ─────────────────────────────
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ── Input Sanitization ─────────────────────────
app.use(sanitizeInput);

// ── Body Parsing ──────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────
app.use(morgan('combined'));

// ── Static Files ──────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// ── API Routes ────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/email', require('./routes/email'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/revenue', require('./routes/revenue'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/storefront', require('./routes/storefront'));
app.use('/api/lemon-squeezy', require('./routes/lemonSqueezy'));

// ── Health Check ──────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CreateHub API is running', version: '1.0.0' });
});

// ── Serve Frontend (SPA catch-all) ───────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});

// ── Global Error Handler ──────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start Server ──────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`\n🚀 CreateHub API running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend:    http://localhost:${PORT}\n`);
  
  // Create admin account on startup
  try {
    const createAdmin = require('./utils/createAdmin');
    await createAdmin();
  } catch (error) {
    console.log('⚠️  Admin account creation skipped (may already exist)');
  }
});

module.exports = app;
