const express = require('express');
const { sendEmail } = require('../services/emailService');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Test email sending
// @route   POST /api/email/test
// @access  Private (Admin only)
router.post('/test', protect, authorize('admin'), async (req, res) => {
  try {
    const { to, template, data } = req.body;
    
    if (!to || !template) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email recipient and template are required' 
      });
    }

    const result = await sendEmail(to, template, data || {});
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully',
        data: result.data 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Email failed to send',
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @desc    Send welcome email
// @route   POST /api/email/welcome
// @access  Private (Admin only)
router.post('/welcome', protect, authorize('admin'), async (req, res) => {
  try {
    const { to, firstName, lastName } = req.body;
    
    if (!to || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, first name, and last name are required' 
      });
    }

    const result = await sendEmail(to, 'welcome', { firstName, lastName });
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Welcome email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Welcome email failed',
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
