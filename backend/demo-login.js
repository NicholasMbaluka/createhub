// Demo Admin Login - No Database Required
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Demo admin credentials
const ADMIN = {
  email: 'nicholasmbaluka05@gmail.com',
  password: 'Nisuchondey2702#',
  role: 'admin',
  firstName: 'Nicholas',
  lastName: 'Baluka'
};

// Demo authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === ADMIN.email && password === ADMIN.password) {
    res.json({
      success: true,
      token: 'demo-jwt-token-admin',
      user: ADMIN
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: ADMIN
  });
});

// Admin overview
app.get('/api/admin/overview', (req, res) => {
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CreateHub Demo API running',
    version: '1.0.0'
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 CreateHub Demo Server running on http://localhost:${PORT}`);
  console.log(`👤 Admin Email: ${ADMIN.email}`);
  console.log(`🔑 Admin Password: ${ADMIN.password}`);
  console.log(`📱 Open browser and go to http://localhost:${PORT}`);
  console.log(`🔐 Login with admin credentials above\n`);
});
