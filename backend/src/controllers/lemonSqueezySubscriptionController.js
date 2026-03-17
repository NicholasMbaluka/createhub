// Updated Subscription Controller - Lemon Squeezy Integration
const LemonSqueezyService = require('../services/lemonSqueezyService');
const { LemonSubscription } = require('../models/LemonSqueezy');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

class LemonSqueezySubscriptionController {
  
  // Get platform subscription plans
  static async getPlatformPlans(req, res) {
    try {
      // These would be your Lemon Squeezy variant IDs for platform plans
      const plans = [
        {
          id: 'free-plan-variant-id',
          name: 'Starter',
          price: 0,
          interval: 'month',
          features: [
            'Basic creator page',
            'Up to 5 products',
            'Basic analytics',
            'CreateHub branding'
          ],
          lemonVariantId: process.env.LEMON_SQUEEZY_STARTER_VARIANT_ID,
          popular: false
        },
        {
          id: 'pro-plan-variant-id',
          name: 'Pro',
          price: 9,
          interval: 'month',
          features: [
            'Unlimited products',
            'Remove CreateHub branding',
            'Custom themes',
            'Advanced analytics',
            'Priority support'
          ],
          lemonVariantId: process.env.LEMON_SQUEEZY_PRO_VARIANT_ID,
          popular: true
        },
        {
          id: 'business-plan-variant-id',
          name: 'Business',
          price: 19,
          interval: 'month',
          features: [
            'Everything in Pro',
            'Advanced analytics',
            'Email capture tools',
            'Custom domain support',
            'Marketing integrations'
          ],
          lemonVariantId: process.env.LEMON_SQUEEZY_BUSINESS_VARIANT_ID,
          popular: false
        },
        {
          id: 'premium-plan-variant-id',
          name: 'Premium',
          price: 39,
          interval: 'month',
          features: [
            'Everything in Business',
            'API access',
            'Premium themes',
            'Automation tools',
            'White-label options'
          ],
          lemonVariantId: process.env.LEMON_SQUEEZY_PREMIUM_VARIANT_ID,
          popular: false
        }
      ];
      
      res.json({
        success: true,
        plans
      });
      
    } catch (error) {
      console.error('Get platform plans error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch plans' });
    }
  }
  
  // Create platform subscription checkout
  static async createPlatformSubscriptionCheckout(req, res) {
    try {
      const { planId } = req.body;
      const userId = req.user._id;
      
      // Get user details
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Get plan details
      const plans = await LemonSqueezySubscriptionController.getPlatformPlansData();
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
      }
      
      // Create Lemon Squeezy checkout
      const lemonService = new LemonSqueezyService();
      const result = await lemonService.createCreatorSubscriptionCheckout(
        plan.lemonVariantId,
        user.email,
        userId
      );
      
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error });
      }
      
      res.json({
        success: true,
        checkoutUrl: result.checkoutUrl,
        checkoutId: result.checkoutId,
        plan: {
          name: plan.name,
          price: plan.price,
          interval: plan.interval
        }
      });
      
    } catch (error) {
      console.error('Create platform subscription checkout error:', error);
      res.status(500).json({ success: false, message: 'Failed to create checkout' });
    }
  }
  
  // Get creator subscription offers for customers
  static async getCreatorSubscriptionOffers(req, res) {
    try {
      const { creatorId } = req.params;
      
      // Get creator details
      const creator = await User.findById(creatorId);
      if (!creator || creator.role !== 'creator') {
        return res.status(404).json({ success: false, message: 'Creator not found' });
      }
      
      // Get creator's subscription offers (these would be configured in Lemon Squeezy)
      const offers = [
        {
          id: 'basic-support',
          name: 'Basic Support',
          price: 5,
          interval: 'month',
          features: [
            'Access to exclusive content',
            'Monthly Q&A sessions',
            'Community Discord access'
          ],
          lemonVariantId: creator.lemonSqueezy?.basicVariantId || process.env.LEMON_SQUEEZY_BASIC_SUPPORT_VARIANT_ID,
          popular: false
        },
        {
          id: 'premium-support',
          name: 'Premium Support',
          price: 20,
          interval: 'month',
          features: [
            'Everything in Basic',
            '1-on-1 monthly calls',
            'Early access to content',
            'Exclusive tutorials'
          ],
          lemonVariantId: creator.lemonSqueezy?.premiumVariantId || process.env.LEMON_SQUEEZY_PREMIUM_SUPPORT_VARIANT_ID,
          popular: true
        }
      ];
      
      res.json({
        success: true,
        creator: {
          id: creator._id,
          firstName: creator.firstName,
          lastName: creator.lastName,
          bio: creator.bio,
          avatar: creator.avatar
        },
        offers
      });
      
    } catch (error) {
      console.error('Get creator subscription offers error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch offers' });
    }
  }
  
  // Create customer subscription checkout
  static async createCustomerSubscriptionCheckout(req, res) {
    try {
      const { creatorId, offerId } = req.body;
      const customerId = req.user._id;
      
      // Get creator and customer details
      const [creator, customer] = await Promise.all([
        User.findById(creatorId),
        User.findById(customerId)
      ]);
      
      if (!creator || creator.role !== 'creator') {
        return res.status(404).json({ success: false, message: 'Creator not found' });
      }
      
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
      
      // Get offer details
      const offers = await LemonSqueezySubscriptionController.getCreatorOffersData(creatorId);
      const offer = offers.find(o => o.id === offerId);
      
      if (!offer) {
        return res.status(404).json({ success: false, message: 'Offer not found' });
      }
      
      // Create Lemon Squeezy checkout
      const lemonService = new LemonSqueezyService();
      const result = await lemonService.createCustomerSubscriptionCheckout(
        offer.lemonVariantId,
        customer.email,
        creatorId,
        customerId
      );
      
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error });
      }
      
      res.json({
        success: true,
        checkoutUrl: result.checkoutUrl,
        checkoutId: result.checkoutId,
        offer: {
          name: offer.name,
          price: offer.price,
          interval: offer.interval
        }
      });
      
    } catch (error) {
      console.error('Create customer subscription checkout error:', error);
      res.status(500).json({ success: false, message: 'Failed to create checkout' });
    }
  }
  
  // Get user's active subscriptions
  static async getUserSubscriptions(req, res) {
    try {
      const userId = req.user._id;
      
      // Get platform subscription
      const platformSub = await LemonSubscription.findOne({
        creatorId: userId,
        type: 'creator_platform',
        status: 'active'
      });
      
      // Get customer subscriptions (subscriptions to other creators)
      const customerSubs = await LemonSubscription.find({
        customerId: userId,
        type: 'customer_creator',
        status: 'active'
      }).populate('creatorId', 'firstName lastName avatar bio');
      
      res.json({
        success: true,
        platformSubscription: platformSub ? {
          id: platformSub._id,
          plan: platformSub.metadata.planName,
          status: platformSub.status,
          amount: platformSub.amount,
          interval: platformSub.interval,
          renewsAt: platformSub.renewsAt
        } : null,
        customerSubscriptions: customerSubs.map(sub => ({
          id: sub._id,
          creator: {
            id: sub.creatorId._id,
            firstName: sub.creatorId.firstName,
            lastName: sub.creatorId.lastName,
            avatar: sub.creatorId.avatar,
            bio: sub.creatorId.bio
          },
          offer: sub.metadata.planName,
          amount: sub.amount,
          interval: sub.interval,
          renewsAt: sub.renewsAt
        }))
      });
      
    } catch (error) {
      console.error('Get user subscriptions error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch subscriptions' });
    }
  }
  
  // Cancel subscription
  static async cancelSubscription(req, res) {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user._id;
      
      // Get subscription
      const subscription = await LemonSubscription.findOne({
        _id: subscriptionId,
        $or: [
          { creatorId: userId },
          { customerId: userId }
        ]
      });
      
      if (!subscription) {
        return res.status(404).json({ success: false, message: 'Subscription not found' });
      }
      
      // Cancel via Lemon Squeezy
      const lemonService = new LemonSqueezyService();
      const result = await lemonService.cancelSubscription(subscription.lemonSubscriptionId);
      
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error });
      }
      
      // Update local record
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      await subscription.save();
      
      // Update user subscription if it's platform subscription
      if (subscription.type === 'creator_platform') {
        await User.findByIdAndUpdate(userId, {
          'subscription.status': 'cancelled',
          'subscription.cancelledAt': new Date()
        });
      }
      
      // Notify user
      await createNotification(userId, {
        type: 'subscription_cancelled',
        title: 'Subscription Cancelled',
        body: `Your subscription has been cancelled. You'll continue to have access until the end of the billing period.`,
        metadata: { subscriptionId: subscription._id }
      });
      
      res.json({
        success: true,
        message: 'Subscription cancelled successfully'
      });
      
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ success: false, message: 'Failed to cancel subscription' });
    }
  }
  
  // Get subscription analytics for creator
  static async getSubscriptionAnalytics(req, res) {
    try {
      const creatorId = req.user._id;
      const { period = '30d' } = req.query;
      
      const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // Get customer subscriptions
      const subscriptions = await LemonSubscription.find({
        creatorId,
        type: 'customer_creator',
        status: 'active',
        createdAt: { $gte: since }
      });
      
      // Calculate metrics
      const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.totalRevenue || 0), 0);
      const activeSubscribers = subscriptions.length;
      const averageRevenue = activeSubscribers > 0 ? totalRevenue / activeSubscribers : 0;
      
      // Monthly revenue trend
      const monthlyRevenue = {};
      subscriptions.forEach(sub => {
        const month = sub.createdAt.toISOString().slice(0, 7);
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + sub.amount;
      });
      
      const chartData = Object.entries(monthlyRevenue)
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => a.month.localeCompare(b.month));
      
      res.json({
        success: true,
        analytics: {
          totalRevenue,
          activeSubscribers,
          averageRevenue,
          chartData,
          period
        }
      });
      
    } catch (error) {
      console.error('Get subscription analytics error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
  }
  
  // Helper method to get platform plans data
  static async getPlatformPlansData() {
    return [
      {
        id: 'free-plan-variant-id',
        name: 'Starter',
        price: 0,
        interval: 'month',
        lemonVariantId: process.env.LEMON_SQUEEZY_STARTER_VARIANT_ID
      },
      {
        id: 'pro-plan-variant-id',
        name: 'Pro',
        price: 9,
        interval: 'month',
        lemonVariantId: process.env.LEMON_SQUEEZY_PRO_VARIANT_ID
      },
      {
        id: 'business-plan-variant-id',
        name: 'Business',
        price: 19,
        interval: 'month',
        lemonVariantId: process.env.LEMON_SQUEEZY_BUSINESS_VARIANT_ID
      },
      {
        id: 'premium-plan-variant-id',
        name: 'Premium',
        price: 39,
        interval: 'month',
        lemonVariantId: process.env.LEMON_SQUEEZY_PREMIUM_VARIANT_ID
      }
    ];
  }
  
  // Helper method to get creator offers data
  static async getCreatorOffersData(creatorId) {
    // This would typically come from database or Lemon Squeezy API
    return [
      {
        id: 'basic-support',
        name: 'Basic Support',
        price: 5,
        interval: 'month',
        lemonVariantId: process.env.LEMON_SQUEEZY_BASIC_SUPPORT_VARIANT_ID
      },
      {
        id: 'premium-support',
        name: 'Premium Support',
        price: 20,
        interval: 'month',
        lemonVariantId: process.env.LEMON_SQUEEZY_PREMIUM_SUPPORT_VARIANT_ID
      }
    ];
  }
}

module.exports = LemonSqueezySubscriptionController;
