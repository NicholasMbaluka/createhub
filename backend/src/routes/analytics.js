const express = require('express');
const router = express.Router();
const {
  getCreatorAnalytics,
  getAdminAnalytics,
  getMyStats,
  getPlatformStats,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// User stats
router.get('/my-stats', protect, getMyStats);

// Creator analytics
router.get('/creator', protect, authorize('creator'), getCreatorAnalytics);

// Admin analytics
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

// Public platform stats
router.get('/platform', getPlatformStats);

module.exports = router;
