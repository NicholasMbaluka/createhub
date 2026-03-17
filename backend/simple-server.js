// Simple Admin Login Test - No Dependencies Required
const http = require('http');
const fs = require('fs');
const path = require('path');

// Admin credentials
const ADMIN = {
  email: 'nicholasmbaluka05@gmail.com',
  password: 'Nisuchondey2702#',
  role: 'admin',
  firstName: 'Nicholas',
  lastName: 'Baluka'
};

// Create simple HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Parse URL
  const url = req.url;
  
  // Handle API routes
  if (url.startsWith('/api/')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      
      // Login endpoint
      if (url === '/api/auth/login' && req.method === 'POST') {
        try {
          const { email, password } = JSON.parse(body);
          
          if (email === ADMIN.email && password === ADMIN.password) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              token: 'demo-admin-token',
              user: ADMIN
            }));
          } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              message: 'Invalid credentials'
            }));
          }
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid request'
          }));
        }
        return;
      }
      
      // Get current user
      if (url === '/api/auth/me' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          user: ADMIN
        }));
        return;
      }
      
      // Admin overview
      if (url === '/api/admin/overview' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          stats: {
            totalUsers: 1,
            totalCreators: 1,
            totalRevenue: 0,
            pendingKYC: 0
          }
        }));
        return;
      }
      
      // Health check
      if (url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'CreateHub Simple API running',
          version: '1.0.0'
        }));
        return;
      }
      
      // Default API response
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'API endpoint not found'
      }));
    });
    return;
  }
  
  // Serve frontend files
  if (url === '/') {
    const indexPath = path.join(__dirname, '../frontend/public/index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
      return;
    }
  }
  
  // Default response
  res.writeHead(404);
  res.end('Not Found');
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 CreateHub Simple Server running on http://localhost:${PORT}`);
  console.log(`👤 Admin Email: ${ADMIN.email}`);
  console.log(`🔑 Admin Password: ${ADMIN.password}`);
  console.log(`📱 Open browser and go to http://localhost:${PORT}`);
  console.log(`🔐 Login with admin credentials above`);
  console.log(`\n✅ This server works without any dependencies!`);
  console.log(`🎯 Perfect for testing admin login functionality\n`);
});
