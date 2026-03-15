const express = require('express');
const router = express.Router();
const { 
  subscribe, 
  cancelSubscription, 
  getMySubscriptions, 
  getMySubscribers,
  getSubscriptionPlans,
  upgradeSubscription,
  cancelPlatformSubscription,
  getSubscriptionStatus
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

// Creator subscriptions (followers subscribing to creators)
router.post('/',                  protect, subscribe);
router.put('/:id/cancel',         protect, cancelSubscription);
router.get('/mine',               protect, getMySubscriptions);
router.get('/subscribers',        protect, authorize('creator', 'admin'), getMySubscribers);

// Platform subscription plans (CreateHub plans)
router.get('/plans',              getSubscriptionPlans);
router.get('/status',             protect, getSubscriptionStatus);
router.post('/upgrade',           protect, authorize('creator'), upgradeSubscription);
router.post('/cancel',            protect, authorize('creator'), cancelPlatformSubscription);

module.exports = router;
