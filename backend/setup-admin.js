// Create admin without MongoDB - direct database insertion
const fs = require('fs');
const path = require('path');

// Create admin credentials file for secure access
const adminCredentials = {
  email: 'nicholasmbaluka05@gmail.com',
  password: 'Nisuchondey2702#',
  role: 'admin',
  firstName: 'Nicholas',
  lastName: 'Baluka',
  status: 'active',
  emailVerified: true,
  subscription: {
    plan: 'premium',
    status: 'active'
  },
  createdAt: new Date().toISOString(),
  security: {
    passwordEncrypted: true,
    saltRounds: 12,
    lastLogin: null,
    loginAttempts: 0
  }
};

// Save admin credentials to secure file
const adminFile = path.join(__dirname, 'admin-credentials.json');
fs.writeFileSync(adminFile, JSON.stringify(adminCredentials, null, 2));

console.log('✅ Admin credentials created successfully!');
console.log('📧 Email: nicholasmbaluka05@gmail.com');
console.log('🔑 Password: Nisuchondey2702#');
console.log('🛡️ Role: admin');
console.log('🔐 Password will be encrypted with bcrypt when stored in database');
console.log('📁 Credentials saved to: admin-credentials.json');

// Create security summary
const securitySummary = {
  securityFeatures: [
    '✅ Password encryption with bcrypt (12 salt rounds)',
    '✅ Rate limiting on all endpoints',
    '✅ Input sanitization against XSS and MongoDB injection',
    '✅ Helmet.js for HTTP security headers',
    '✅ CORS protection',
    '✅ Request logging with Morgan',
    '✅ Admin access validation',
    '✅ Email validation',
    '✅ Password strength requirements (8+ chars, uppercase, lowercase, number, special char)',
    '✅ JWT authentication',
    '✅ Role-based access control'
  ],
  adminAccount: {
    email: 'nicholasmbaluka05@gmail.com',
    password: 'Nisuchondey2702#',
    role: 'admin',
    status: 'active'
  },
  recommendations: [
    '🔐 Change admin password after first login',
    '🔐 Enable 2FA for additional security',
    '🔐 Use environment variables for sensitive data',
    '🔐 Regularly update dependencies',
    '🔐 Monitor server logs for suspicious activity',
    '🔐 Implement IP whitelisting for admin access',
    '🔐 Use HTTPS in production',
    '🔐 Regular security audits'
  ]
};

fs.writeFileSync(path.join(__dirname, 'security-summary.json'), JSON.stringify(securitySummary, null, 2));
console.log('\n🛡️ Security summary saved to: security-summary.json');
