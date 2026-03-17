// Payment Routes - Handle all payment operations
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Create payment intent
router.post('/create-intent', protect, PaymentController.createPaymentIntent);

// Confirm payment
router.post('/confirm', protect, PaymentController.confirmPayment);

// Handle payment failure
router.post('/failure', protect, PaymentController.handlePaymentFailure);

// Process refunds
router.post('/refund', protect, PaymentController.processRefund);

// Get payment history
router.get('/history', protect, authorize('creator'), PaymentController.getPaymentHistory);

// Get payment analytics
router.get('/analytics', protect, authorize('creator'), PaymentController.getPaymentAnalytics);

module.exports = router;
