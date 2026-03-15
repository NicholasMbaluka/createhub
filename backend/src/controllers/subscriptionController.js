const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');
const { getPlanFeatures, calculateCommission } = require('../config/subscriptionPlans');

// @desc  Subscribe to a creator
// @route POST /api/subscriptions
// @access Private
const subscribe = async (req, res) => {
  try {
    const { creatorId, plan } = req.body;
    const creator = await User.findOne({ _id: creatorId, role: 'creator', status: 'active' });
    if (!creator) return res.status(404).json({ success: false, message: 'Creator not found' });
    if (creator._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot subscribe to yourself' });
    }

    const existing = await Subscription.findOne({ subscriber: req.user._id, creator: creatorId, status: 'active' });
    if (existing) return res.status(409).json({ success: false, message: 'Already subscribed' });

    const amount = plan === 'annual' ? 290 : 29;
    const now = new Date();
    const periodEnd = new Date(now);
    plan === 'annual' ? periodEnd.setFullYear(periodEnd.getFullYear() + 1) : periodEnd.setMonth(periodEnd.getMonth() + 1);

    const sub = await Subscription.create({
      subscriber: req.user._id,
      creator: creatorId,
      plan,
      pricing: { amount },
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    });

    await User.findByIdAndUpdate(creatorId, { $inc: { 'stats.totalSubscribers': 1 } });
    await createNotification(creatorId, {
      type: 'subscriber',
      title: `New subscriber: ${req.user.firstName} ${req.user.lastName}`,
      body: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan — $${amount}`,
      metadata: { subscriberId: req.user._id },
    });

    res.status(201).json({ success: true, message: 'Subscribed successfully', subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Cancel subscription
// @route PUT /api/subscriptions/:id/cancel
// @access Private
const cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, subscriber: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    sub.status = 'cancelled';
    sub.cancelledAt = new Date();
    await sub.save();
    await User.findByIdAndUpdate(sub.creator, { $inc: { 'stats.totalSubscribers': -1 } });
    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get my subscriptions (as subscriber)
// @route GET /api/subscriptions/mine
// @access Private
const getMySubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ subscriber: req.user._id })
      .populate('creator', 'firstName lastName slug avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, subscriptions: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get my subscribers (as creator)
// @route GET /api/subscriptions/subscribers
// @access Private (creator)
const getMySubscribers = async (req, res) => {
  try {
    const subs = await Subscription.find({ creator: req.user._id, status: 'active' })
      .populate('subscriber', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });
    const mrr = subs.reduce((s, sub) => s + (sub.plan === 'annual' ? sub.pricing.amount / 12 : sub.pricing.amount), 0);
    res.json({ success: true, subscribers: subs, total: subs.length, mrr: Math.round(mrr * 100) / 100 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get available subscription plans
// @route GET /api/subscriptions/plans
// @access Public
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = {};
    const planNames = ['starter', 'pro', 'business', 'premium'];
    
    planNames.forEach(planName => {
      plans[planName] = getPlanFeatures(planName);
    });
    
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Upgrade/Change CreateHub subscription plan
// @route POST /api/subscriptions/upgrade
// @access Private (creator)
const upgradeSubscription = async (req, res) => {
  try {
    const { plan, paymentMethodId } = req.body;
    
    if (!['starter', 'pro', 'business', 'premium'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }
    
    const user = await User.findById(req.user._id);
    const currentPlan = user.subscription?.plan || 'starter';
    
    if (currentPlan === plan) {
      return res.status(400).json({ success: false, message: 'Already on this plan' });
    }
    
    // TODO: Integrate with Stripe for actual payment processing
    // For now, we'll simulate the upgrade
    
    const planDetails = getPlanFeatures(plan);
    
    // Update user subscription
    user.subscription = {
      plan,
      status: 'active',
      stripeSubscriptionId: `sub_${Date.now()}`, // Mock ID
      stripeCustomerId: `cus_${Date.now()}`, // Mock ID
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelledAt: null,
      trialEndDate: null
    };
    
    await user.save();
    
    await createNotification(req.user._id, {
      type: 'subscription',
      title: `Upgraded to ${planDetails.name}`,
      body: `Your subscription has been successfully upgraded.`,
      metadata: { plan, amount: planDetails.price }
    });
    
    res.json({ 
      success: true, 
      message: 'Subscription upgraded successfully',
      subscription: user.subscription
    });
  } catch (err) {
    console.error('Subscription upgrade error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Cancel CreateHub subscription
// @route POST /api/subscriptions/cancel
// @access Private (creator)
const cancelPlatformSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.subscription || user.subscription.plan === 'starter') {
      return res.status(400).json({ success: false, message: 'No active subscription to cancel' });
    }
    
    // TODO: Integrate with Stripe for actual cancellation
    
    user.subscription.status = 'cancelled';
    user.subscription.cancelledAt = new Date();
    
    await user.save();
    
    await createNotification(req.user._id, {
      type: 'subscription',
      title: 'Subscription cancelled',
      body: 'Your subscription will remain active until the end of the current billing period.',
      metadata: { cancelledAt: user.subscription.cancelledAt }
    });
    
    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get current user's subscription status
// @route GET /api/subscriptions/status
// @access Private
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription');
    const planDetails = getPlanFeatures(user.subscription?.plan || 'starter');
    
    res.json({ 
      success: true, 
      subscription: user.subscription,
      planDetails
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { 
  subscribe, 
  cancelSubscription, 
  getMySubscriptions, 
  getMySubscribers,
  getSubscriptionPlans,
  upgradeSubscription,
  cancelPlatformSubscription,
  getSubscriptionStatus
};
