require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { protect, authorize } = require('./src/middleware/auth-demo');
const { sanitizeInput } = require('./src/middleware/validation');

const app = express();

// ── Security Middleware ───────────────────────
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
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ── Demo API Routes ─────────────────────────────
const authController = require('./src/controllers/authController-demo');

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', protect, authController.getMe);
app.put('/api/auth/password', protect, authController.updatePassword);

// Mock data endpoints
app.get('/api/products/public', (req, res) => {
  res.json({
    success: true,
    products: []
  });
});

app.get('/api/products', protect, (req, res) => {
  res.json({
    success: true,
    products: []
  });
});

app.get('/api/orders', protect, (req, res) => {
  res.json({
    success: true,
    orders: []
  });
});

app.get('/api/analytics/my-stats', protect, (req, res) => {
  res.json({
    success: true,
    stats: {
      totalProducts: 0,
      totalSales: 0,
      totalRevenue: 0,
      avgProductPrice: 0
    }
  });
});

app.get('/api/analytics/platform', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalCreators: 0,
      totalProducts: 0,
      totalRevenue: 0,
      avgOrderValue: 0
    }
  });
});

app.get('/api/notifications', protect, (req, res) => {
  res.json({
    success: true,
    notifications: []
  });
});

app.put('/api/notifications/read-all', protect, (req, res) => {
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// Admin routes
app.get('/api/admin/overview', protect, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    stats: {
      totalUsers: 1,
      totalCreators: 1,
      totalRevenue: 0,
      pendingKYC: 0
    }
  });
});

app.get('/api/kyc/pending', protect, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    pendingKYC: []
  });
});

// ── Health Check ──────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CreateHub API running (Demo Mode)', version: '1.0.0' });
});

// ── Serve Frontend (SPA catch-all) ───────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// ── Start Server ──────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 CreateHub API running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend:    http://localhost:${PORT}`);
  console.log(`🛡️  Security:    Enhanced with helmet, rate limiting, input sanitization`);
  console.log(`👤 Admin:       nicholasmbaluka05@gmail.com`);
  console.log(`🔑 Password:    Nisuchondey2702#\n`);
});

module.exports = app;
