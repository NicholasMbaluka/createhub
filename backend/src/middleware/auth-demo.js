const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Load admin credentials
const adminCredentialsPath = path.join(__dirname, '../admin-credentials.json');
let adminCredentials = null;

try {
  adminCredentials = JSON.parse(fs.readFileSync(adminCredentialsPath, 'utf8'));
} catch (error) {
  console.warn('Admin credentials file not found');
}

// Mock user database for demo (replace with real MongoDB in production)
const mockUsers = new Map();

// Add admin to mock database if credentials exist
if (adminCredentials) {
  mockUsers.set(adminCredentials.email, {
    ...adminCredentials,
    _id: 'admin_' + Date.now(),
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Find user in mock database (replace with MongoDB query in production)
    let user = null;
    for (const [email, userData] of mockUsers.entries()) {
      if (userData._id === decoded.id) {
        user = { ...userData, email };
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Mock password comparison (replace with bcrypt in production)
const matchPassword = async (enteredPassword, storedPassword) => {
  // For demo: simple comparison (in production use bcrypt.compare)
  return enteredPassword === storedPassword;
};

module.exports = {
  protect,
  authorize,
  generateToken,
  matchPassword,
  mockUsers,
  adminCredentials
};
