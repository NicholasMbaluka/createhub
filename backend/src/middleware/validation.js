const mongoSanitize = require('express-mongo-sanitize');
const validator = require('validator');

// Simple XSS protection (custom implementation since xss package might not be available)
const sanitizeXSS = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize all request body fields
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove any MongoDB operators
        req.body[key] = mongoSanitize.sanitize(req.body[key]);
        // Remove XSS attacks
        req.body[key] = sanitizeXSS(req.body[key]);
        // Trim whitespace
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = mongoSanitize.sanitize(req.query[key]);
        req.query[key] = sanitizeXSS(req.query[key]);
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

// Email validation middleware
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (email && !validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }
  next();
};

// Password strength validation
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  if (password) {
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      });
    }
  }
  next();
};

// Admin access validation
const validateAdminAccess = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = {
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateAdminAccess,
};
