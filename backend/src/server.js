// Polyfill for Node.js < 18
if (!globalThis.Headers) {
  const { Headers } = require('undici');
  globalThis.Headers = Headers;
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');

// Add try-catch for middleware loading
let sanitizeInput;
try {
  ({ sanitizeInput } = require('./middleware/validation'));
} catch (error) {
  console.log('⚠️  Validation middleware not available, skipping');
  sanitizeInput = (req, res, next) => next();
}

const app = express();

// ── Connect Database ──────────────────────────
connectDB();

// ── Enhanced Security Middleware ───────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000']
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Rate Limiting ─────────────────────────────
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
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
// Load routes with error handling to prevent crashes
const loadRoute = (routePath, routeName) => {
  try {
    app.use(`/api/${routeName}`, require(routePath));
    console.log(`✅ Loaded route: /api/${routeName}`);
  } catch (error) {
    console.log(`⚠️  Failed to load route /api/${routeName}: ${error.message}`);
  }
};

loadRoute('./routes/auth', 'auth');
loadRoute('./routes/users', 'users');
loadRoute('./routes/products', 'products');
loadRoute('./routes/orders', 'orders');
loadRoute('./routes/analytics', 'analytics');
loadRoute('./routes/notifications', 'notifications');
loadRoute('./routes/subscriptions', 'subscriptions');
loadRoute('./routes/kyc', 'kyc');
loadRoute('./routes/admin', 'admin');
loadRoute('./routes/email', 'email');
loadRoute('./routes/webhooks', 'webhooks');
loadRoute('./routes/revenue', 'revenue');
loadRoute('./routes/delivery', 'delivery');
loadRoute('./routes/storefront', 'storefront');
loadRoute('./routes/lemonSqueezy', 'lemon-squeezy');

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
  console.log(`\n🚀 CreateHub API running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend:    ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`);
  
  // Create admin account on startup
  try {
    const createAdmin = require('./utils/createAdmin');
    await createAdmin();
  } catch (error) {
    console.log('⚠️  Admin account creation skipped (may already exist)');
  }
});

module.exports = app;
