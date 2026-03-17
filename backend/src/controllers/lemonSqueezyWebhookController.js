// Lemon Squeezy Webhook Controller - Handle all webhook events
const crypto = require('crypto');
const LemonSqueezyService = require('../services/lemonSqueezyService');
const { 
  LemonSubscription, 
  LemonOrder, 
  BalanceLedger, 
  PayoutRequest,
  ProductIntegration 
} = require('../models/LemonSqueezy');
const User = require('../models/User');
const Product = require('../models/Product');
const { createNotification } = require('../utils/notifications');

class LemonSqueezyWebhookController {
  
  // Handle incoming webhooks
  static async handleWebhook(req, res) {
    try {
      const signature = req.headers['x-lemon-squeezy-signature'];
      const payload = req.body;
      
      // Verify webhook signature
      const lemonService = new LemonSqueezyService();
      if (!lemonService.verifyWebhookSignature(JSON.stringify(payload), signature)) {
        return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
      }
      
      // Get event name
      const eventName = payload.meta.event_name;
      console.log(`🍋 Lemon Squeezy webhook: ${eventName}`);
      
      // Handle different event types
      switch (eventName) {
        
        // Creator Platform Subscription Events
        case 'subscription_created':
          await LemonSqueezyWebhookController.handleSubscriptionCreated(payload);
          break;
          
        case 'subscription_payment_success':
          await LemonSqueezyWebhookController.handleSubscriptionPaymentSuccess(payload);
          break;
          
        case 'subscription_payment_failed':
          await LemonSqueezyWebhookController.handleSubscriptionPaymentFailed(payload);
          break;
          
        case 'subscription_cancelled':
          await LemonSqueezyWebhookController.handleSubscriptionCancelled(payload);
          break;
          
        case 'subscription_expired':
          await LemonSqueezyWebhookController.handleSubscriptionExpired(payload);
          break;
          
        // Product Purchase Events
        case 'order_created':
          await LemonSqueezyWebhookController.handleOrderCreated(payload);
          break;
          
        case 'order_payment_success':
          await LemonSqueezyWebhookController.handleOrderPaymentSuccess(payload);
          break;
          
        case 'order_refunded':
          await LemonSqueezyWebhookController.handleOrderRefunded(payload);
          break;
          
        default:
          console.log(`Unhandled webhook event: ${eventName}`);
      }
      
      res.json({ success: true, message: 'Webhook processed successfully' });
      
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
  }
  
  // Handle subscription created (creator platform or customer creator)
  static async handleSubscriptionCreated(payload) {
    const subscription = payload.data;
    const customData = subscription.attributes.custom_data;
    
    try {
      // Determine subscription type from custom data
      const subscriptionType = customData.type;
      
      if (subscriptionType === 'creator_subscription') {
        // Creator platform subscription
        await LemonSqueezyWebhookController.createCreatorSubscription(subscription, customData);
      } else if (subscriptionType === 'customer_subscription') {
        // Customer subscribing to creator
        await LemonSqueezyWebhookController.createCustomerSubscription(subscription, customData);
      }
      
    } catch (error) {
      console.error('Subscription creation error:', error);
    }
  }
  
  // Create creator platform subscription
  static async createCreatorSubscription(subscription, customData) {
    const creatorId = customData.creator_id;
    
    // Update creator's subscription status
    const creator = await User.findById(creatorId);
    if (!creator) return;
    
    // Map Lemon Squeezy variant to plan
    const planMap = {
      'free': 'starter',
      'pro': 'pro', 
      'business': 'business',
      'premium': 'premium'
    };
    
    const plan = planMap[subscription.attributes.variant_name.toLowerCase()] || 'starter';
    
    // Update user subscription
    creator.subscription = {
      plan,
      status: 'active',
      lemonSubscriptionId: subscription.id,
      lemonCustomerId: subscription.attributes.customer_id,
      currentPeriodStart: new Date(subscription.attributes.created_at),
      currentPeriodEnd: new Date(subscription.attributes.renews_at),
      cancelledAt: null
    };
    
    await creator.save();
    
    // Create subscription record
    await LemonSubscription.create({
      lemonSubscriptionId: subscription.id,
      lemonCustomerId: subscription.attributes.customer_id,
      lemonVariantId: subscription.attributes.variant_id,
      creatorId,
      type: 'creator_platform',
      status: 'active',
      amount: subscription.attributes.total / 100, // Convert from cents
      interval: subscription.attributes.interval,
      startsAt: new Date(subscription.attributes.created_at),
      renewsAt: new Date(subscription.attributes.renews_at),
      metadata: {
        planName: subscription.attributes.variant_name,
        planFeatures: []
      }
    });
    
    // Notify creator
    await createNotification(creatorId, {
      type: 'subscription_activated',
      title: 'Subscription Activated',
      body: `Your ${plan} plan has been activated successfully!`,
      metadata: { subscriptionId: subscription.id }
    });
    
    console.log(`✅ Creator ${creatorId} subscription activated: ${plan}`);
  }
  
  // Create customer creator subscription
  static async createCustomerSubscription(subscription, customData) {
    const { creator_id, customer_id } = customData;
    
    // Create subscription record
    const lemonSub = await LemonSubscription.create({
      lemonSubscriptionId: subscription.id,
      lemonCustomerId: subscription.attributes.customer_id,
      lemonVariantId: subscription.attributes.variant_id,
      creatorId,
      customerId,
      type: 'customer_creator',
      status: 'active',
      amount: subscription.attributes.total / 100,
      interval: subscription.attributes.interval,
      startsAt: new Date(subscription.attributes.created_at),
      renewsAt: new Date(subscription.attributes.renews_at),
      metadata: {
        planName: subscription.attributes.variant_name,
        planFeatures: []
      }
    });
    
    // Update creator's subscriber count
    await User.findByIdAndUpdate(creatorId, {
      $inc: { 'stats.totalSubscribers': 1 }
    });
    
    // Notify creator
    await createNotification(creatorId, {
      type: 'new_subscriber',
      title: 'New Subscriber!',
      body: `Someone just subscribed to your content!`,
      metadata: { subscriptionId: lemonSub._id }
    });
    
    console.log(`✅ Customer ${customer_id} subscribed to creator ${creator_id}`);
  }
  
  // Handle subscription payment success
  static async handleSubscriptionPaymentSuccess(payload) {
    const subscription = payload.data;
    
    try {
      // Update subscription record
      const lemonSub = await LemonSubscription.findOneAndUpdate(
        { lemonSubscriptionId: subscription.id },
        { 
          status: 'active',
          renewsAt: new Date(subscription.attributes.renews_at),
          updatedAt: new Date()
        }
      );
      
      if (!lemonSub) return;
      
      // Calculate earnings and update balance
      const paymentAmount = subscription.attributes.total / 100;
      const earnings = LemonSqueezyService.calculateEarnings(paymentAmount);
      
      // Update creator balance ledger
      const currentBalance = await LemonSqueezyWebhookController.getCreatorBalance(lemonSub.creatorId);
      
      await BalanceLedger.create({
        creatorId: lemonSub.creatorId,
        type: 'subscription_payment',
        relatedId: lemonSub._id,
        relatedType: 'subscription',
        amount: earnings.creatorEarnings,
        runningBalance: currentBalance + earnings.creatorEarnings,
        description: `Subscription payment - ${lemonSub.metadata.planName}`,
        status: 'confirmed',
        confirmedAt: new Date(),
        metadata: {
          customerName: 'Subscriber',
          subscriptionType: lemonSub.type,
          lemonSubscriptionId: subscription.id
        }
      });
      
      // Update total revenue
      await LemonSubscription.findByIdAndUpdate(lemonSub._id, {
        $inc: { totalRevenue: paymentAmount, renewalCount: 1 }
      });
      
      // Notify creator
      await createNotification(lemonSub.creatorId, {
        type: 'payment_received',
        title: 'Payment Received',
        body: `You earned $${earnings.creatorEarnings.toFixed(2)} from a subscription payment`,
        metadata: { subscriptionId: lemonSub._id }
      });
      
      console.log(`💰 Creator ${lemonSub.creatorId} earned $${earnings.creatorEarnings.toFixed(2)}`);
      
    } catch (error) {
      console.error('Subscription payment success error:', error);
    }
  }
  
  // Handle subscription payment failed
  static async handleSubscriptionPaymentFailed(payload) {
    const subscription = payload.data;
    
    try {
      // Update subscription status
      await LemonSubscription.findOneAndUpdate(
        { lemonSubscriptionId: subscription.id },
        { 
          status: 'past_due',
          updatedAt: new Date()
        }
      );
      
      // Find and notify creator
      const lemonSub = await LemonSubscription.findOne({ lemonSubscriptionId: subscription.id });
      if (lemonSub) {
        await createNotification(lemonSub.creatorId, {
          type: 'payment_failed',
          title: 'Payment Failed',
          body: 'A subscription payment failed. Please check your account.',
          metadata: { subscriptionId: lemonSub._id }
        });
      }
      
      console.log(`❌ Subscription payment failed: ${subscription.id}`);
      
    } catch (error) {
      console.error('Subscription payment failed error:', error);
    }
  }
  
  // Handle order created (product purchase)
  static async handleOrderCreated(payload) {
    const order = payload.data;
    const customData = order.attributes.custom_data;
    
    try {
      const { creator_id, customer_id, product_id, type } = customData;
      
      if (type !== 'product_purchase') return;
      
      // Create order record
      const lemonOrder = await LemonOrder.create({
        lemonOrderId: order.id,
        lemonCustomerId: order.attributes.customer_id,
        creatorId,
        customerId,
        productId,
        status: 'pending',
        amount: order.attributes.total / 100,
        orderedAt: new Date(order.attributes.created_at),
        metadata: {
          customerEmail: order.attributes.user_email,
          productName: 'Product'
        }
      });
      
      console.log(`📦 Order created: ${order.id} for product ${product_id}`);
      
    } catch (error) {
      console.error('Order creation error:', error);
    }
  }
  
  // Handle order payment success (product purchase completed)
  static async handleOrderPaymentSuccess(payload) {
    const order = payload.data;
    
    try {
      // Update order record
      const lemonOrder = await LemonOrder.findOneAndUpdate(
        { lemonOrderId: order.id },
        { 
          status: 'paid',
          paidAt: new Date(order.attributes.created_at),
          updatedAt: new Date()
        }
      ).populate('productId');
      
      if (!lemonOrder) return;
      
      // Calculate earnings
      const paymentAmount = order.attributes.total / 100;
      const earnings = LemonSqueezyService.calculateEarnings(paymentAmount);
      
      // Update creator balance ledger
      const currentBalance = await LemonSqueezyWebhookController.getCreatorBalance(lemonOrder.creatorId);
      
      await BalanceLedger.create({
        creatorId: lemonOrder.creatorId,
        type: 'product_sale',
        relatedId: lemonOrder._id,
        relatedType: 'order',
        amount: earnings.creatorEarnings,
        runningBalance: currentBalance + earnings.creatorEarnings,
        description: `Product sale - ${lemonOrder.metadata.productName}`,
        status: 'confirmed',
        confirmedAt: new Date(),
        metadata: {
          customerName: lemonOrder.metadata.customerEmail,
          productName: lemonOrder.metadata.productName,
          lemonOrderId: order.id
        }
      });
      
      // Grant product access
      lemonOrder.accessGranted = true;
      lemonOrder.accessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      lemonOrder.accessExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      lemonOrder.lemonFee = earnings.lemonFee;
      lemonOrder.platformFee = earnings.platformFeeAmount;
      lemonOrder.creatorEarnings = earnings.creatorEarnings;
      await lemonOrder.save();
      
      // Notify creator
      await createNotification(lemonOrder.creatorId, {
        type: 'product_sold',
        title: 'Product Sold!',
        body: `You earned $${earnings.creatorEarnings.toFixed(2)} from ${lemonOrder.metadata.productName}`,
        metadata: { orderId: lemonOrder._id }
      });
      
      // Notify customer
      await createNotification(lemonOrder.customerId, {
        type: 'purchase_completed',
        title: 'Purchase Completed',
        body: `Your purchase of ${lemonOrder.metadata.productName} is now available in your library`,
        metadata: { orderId: lemonOrder._id }
      });
      
      console.log(`💰 Product sold: ${lemonOrder.metadata.productName} - Creator earned $${earnings.creatorEarnings.toFixed(2)}`);
      
    } catch (error) {
      console.error('Order payment success error:', error);
    }
  }
  
  // Handle order refunded
  static async handleOrderRefunded(payload) {
    const order = payload.data;
    
    try {
      // Update order record
      const lemonOrder = await LemonOrder.findOneAndUpdate(
        { lemonOrderId: order.id },
        { 
          status: 'refunded',
          refundedAt: new Date(),
          updatedAt: new Date()
        }
      );
      
      if (!lemonOrder) return;
      
      // Remove product access
      lemonOrder.accessGranted = false;
      await lemonOrder.save();
      
      // Update creator balance ledger (negative entry)
      const currentBalance = await LemonSqueezyWebhookController.getCreatorBalance(lemonOrder.creatorId);
      
      await BalanceLedger.create({
        creatorId: lemonOrder.creatorId,
        type: 'refund',
        relatedId: lemonOrder._id,
        relatedType: 'order',
        amount: -lemonOrder.creatorEarnings, // Negative amount for refund
        runningBalance: currentBalance - lemonOrder.creatorEarnings,
        description: `Refund - ${lemonOrder.metadata.productName}`,
        status: 'confirmed',
        confirmedAt: new Date(),
        metadata: {
          customerName: lemonOrder.metadata.customerEmail,
          productName: lemonOrder.metadata.productName,
          lemonOrderId: order.id
        }
      });
      
      // Notify creator
      await createNotification(lemonOrder.creatorId, {
        type: 'refund_issued',
        title: 'Refund Issued',
        body: `A refund was issued for ${lemonOrder.metadata.productName}`,
        metadata: { orderId: lemonOrder._id }
      });
      
      console.log(`💸 Refund processed: ${lemonOrder.metadata.productName}`);
      
    } catch (error) {
      console.error('Order refund error:', error);
    }
  }
  
  // Handle subscription cancelled
  static async handleSubscriptionCancelled(payload) {
    const subscription = payload.data;
    
    try {
      // Update subscription record
      const lemonSub = await LemonSubscription.findOneAndUpdate(
        { lemonSubscriptionId: subscription.id },
        { 
          status: 'cancelled',
          cancelledAt: new Date(),
          updatedAt: new Date()
        }
      );
      
      if (!lemonSub) return;
      
      // Update user subscription if it's creator platform subscription
      if (lemonSub.type === 'creator_platform') {
        await User.findByIdAndUpdate(lemonSub.creatorId, {
          'subscription.status': 'cancelled',
          'subscription.cancelledAt': new Date()
        });
      }
      
      // Update subscriber count if customer subscription
      if (lemonSub.type === 'customer_creator') {
        await User.findByIdAndUpdate(lemonSub.creatorId, {
          $inc: { 'stats.totalSubscribers': -1 }
        });
      }
      
      console.log(`🚫 Subscription cancelled: ${subscription.id}`);
      
    } catch (error) {
      console.error('Subscription cancellation error:', error);
    }
  }
  
  // Handle subscription expired
  static async handleSubscriptionExpired(payload) {
    const subscription = payload.data;
    
    try {
      // Update subscription record
      const lemonSub = await LemonSubscription.findOneAndUpdate(
        { lemonSubscriptionId: subscription.id },
        { 
          status: 'expired',
          updatedAt: new Date()
        }
      );
      
      if (!lemonSub) return;
      
      // Update user subscription if it's creator platform subscription
      if (lemonSub.type === 'creator_platform') {
        await User.findByIdAndUpdate(lemonSub.creatorId, {
          'subscription.status': 'expired'
        });
      }
      
      // Update subscriber count if customer subscription
      if (lemonSub.type === 'customer_creator') {
        await User.findByIdAndUpdate(lemonSub.creatorId, {
          $inc: { 'stats.totalSubscribers': -1 }
        });
      }
      
      console.log(`⏰ Subscription expired: ${subscription.id}`);
      
    } catch (error) {
      console.error('Subscription expiration error:', error);
    }
  }
  
  // Helper method to get creator balance
  static async getCreatorBalance(creatorId) {
    const latestLedger = await BalanceLedger.findOne({ creatorId })
      .sort({ createdAt: -1 });
    
    return latestLedger ? latestLedger.runningBalance : 0;
  }
}

module.exports = LemonSqueezyWebhookController;
