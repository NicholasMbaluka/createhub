const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');
const { sendEmail } = require('../services/emailService');

// Dynamic model loading - use mock if MongoDB not available
let User;
let isMockMode = false;
try {
  User = require('../models/User');
} catch (error) {
  console.log('⚠️  Using mock User model - MongoDB not available');
  const { MockUser } = require('../config/mockData');
  User = MockUser;
  isMockMode = true;
}

// @desc  Register new user
// @route POST /api/auth/register
// @access Public
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { firstName, lastName, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const allowedRoles = ['public', 'creator'];
    const userRole = allowedRoles.includes(role) ? role : 'public';

    // Hash password for mock mode (Mongoose model does this automatically)
    let userData = { firstName, lastName, email, role: userRole };
    if (isMockMode) {
      userData.password = await bcrypt.hash(password, 10);
    } else {
      userData.password = password;
    }

    const user = await User.create(userData);

    // Welcome notification
    await createNotification(user._id, {
      type: 'system',
      title: `Welcome to CreateHub, ${firstName}!`,
      body: 'Your account is ready. Complete your profile to get started.',
    });

    // Send welcome email
    if (process.env.RESEND_API_KEY) {
      try {
        await sendEmail(email, 'welcome', { firstName, lastName });
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
        // Don't fail registration if email fails
      }
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: user.toPublic(),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toPublic(),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc  Get current logged-in user
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Update password
// @route PUT /api/auth/password
// @access Private
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Password updated', token });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login, getMe, updatePassword };
