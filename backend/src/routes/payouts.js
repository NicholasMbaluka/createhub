// Payout Routes - Handle creator payout operations
const express = require('express');
const router = express.Router();
const PayoutController = require('../controllers/payoutController');
const { protect, authorize } = require('../middleware/auth');

// Get available balance
router.get('/balance', protect, authorize('creator'), PayoutController.getAvailableBalance);

// Request payout
router.post('/request', protect, authorize('creator'), PayoutController.requestPayout);

// Get payout history
router.get('/history', protect, authorize('creator'), PayoutController.getPayoutHistory);

// Get payout methods
router.get('/methods', protect, authorize('creator'), PayoutController.getPayoutMethods);

// Add payout method
router.post('/methods', protect, authorize('creator'), PayoutController.addPayoutMethod);

// Update payout method
router.put('/methods/:methodId', protect, authorize('creator'), PayoutController.updatePayoutMethod);

// Delete payout method
router.delete('/methods/:methodId', protect, authorize('creator'), PayoutController.deletePayoutMethod);

// Get payout analytics
router.get('/analytics', protect, authorize('creator'), PayoutController.getPayoutAnalytics);

module.exports = router;
