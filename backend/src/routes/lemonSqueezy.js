// Lemon Squeezy Routes - Handle Lemon Squeezy integration
const express = require('express');
const router = express.Router();
const LemonSqueezySubscriptionController = require('../controllers/lemonSqueezySubscriptionController');
const LemonSqueezyWebhookController = require('../controllers/lemonSqueezyWebhookController');
const { protect, authorize } = require('../middleware/auth');

// Platform subscription routes
router.get('/platform/plans', LemonSqueezySubscriptionController.getPlatformPlans);
router.post('/platform/checkout', protect, authorize('creator'), LemonSqueezySubscriptionController.createPlatformSubscriptionCheckout);

// Creator subscription offers for customers
router.get('/creator/:creatorId/offers', LemonSqueezySubscriptionController.getCreatorSubscriptionOffers);
router.post('/creator/:creatorId/checkout', protect, LemonSqueezySubscriptionController.createCustomerSubscriptionCheckout);

// User subscription management
router.get('/user/subscriptions', protect, LemonSqueezySubscriptionController.getUserSubscriptions);
router.delete('/subscription/:subscriptionId', protect, LemonSqueezySubscriptionController.cancelSubscription);

// Creator subscription analytics
router.get('/creator/analytics', protect, authorize('creator'), LemonSqueezySubscriptionController.getSubscriptionAnalytics);

// Webhook endpoint (no auth required - Lemon Squeezy calls this)
router.post('/webhook', LemonSqueezyWebhookController.handleWebhook);

module.exports = router;
