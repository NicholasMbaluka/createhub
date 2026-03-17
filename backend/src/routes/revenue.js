const express = require('express');
const router = express.Router();
const {
  getRevenueDashboard,
  getPayoutMethods,
  addPayoutMethod,
  requestPayout
} = require('../controllers/revenueController');
const { protect, authorize } = require('../middleware/auth');

// Creator revenue routes
router.get('/dashboard', protect, authorize('creator'), getRevenueDashboard);
router.get('/payout-methods', protect, authorize('creator'), getPayoutMethods);
router.post('/payout-methods', protect, authorize('creator'), addPayoutMethod);
router.post('/request-payout', protect, authorize('creator'), requestPayout);

module.exports = router;
