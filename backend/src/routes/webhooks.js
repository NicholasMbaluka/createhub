const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

// @desc  Handle Stripe webhooks
// @route POST /api/webhooks/stripe
// @access Public (webhook signature verification)
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

const handlePaymentSucceeded = async (paymentIntent) => {
  const { orderId } = paymentIntent.metadata;
  
  if (!orderId) {
    console.error('Payment intent missing orderId metadata');
    return;
  }

  const order = await Order.findById(orderId).populate('product');
  if (!order) {
    console.error('Order not found for payment intent:', paymentIntent.id);
    return;
  }

  if (order.status === 'completed') {
    console.log('Order already completed:', orderId);
    return;
  }

  // Update order status
  order.status = 'completed';
  order.payment.provider = 'stripe';
  order.payment.chargeId = paymentIntent.charges.data[0]?.id;
  order.payment.receiptUrl = paymentIntent.charges.data[0]?.receipt_url;
  order.payment.paidAt = new Date();
  await order.save();

  // Update product stats
  await Product.findByIdAndUpdate(order.product._id, {
    $inc: { 'stats.sales': 1, 'stats.revenue': order.pricing.creatorNet },
  });

  // Update creator stats
  await User.findByIdAndUpdate(order.creator, {
    $inc: { 'stats.totalSales': 1, 'stats.totalRevenue': order.pricing.creatorNet },
  });

  // Notify creator
  await createNotification(order.creator, {
    type: 'sale',
    title: `New sale: ${order.product.name}`,
    body: `You earned $${order.pricing.creatorNet.toFixed(2)}`,
    metadata: { orderId: order._id, amount: order.pricing.creatorNet },
  });

  console.log(`Payment succeeded for order ${orderId}`);
};

const handlePaymentFailed = async (paymentIntent) => {
  const { orderId } = paymentIntent.metadata;
  
  if (!orderId) return;

  const order = await Order.findById(orderId);
  if (!order) return;

  order.status = 'failed';
  await order.save();

  console.log(`Payment failed for order ${orderId}`);
};

const handlePaymentCanceled = async (paymentIntent) => {
  const { orderId } = paymentIntent.metadata;
  
  if (!orderId) return;

  const order = await Order.findById(orderId);
  if (!order) return;

  order.status = 'canceled';
  await order.save();

  console.log(`Payment canceled for order ${orderId}`);
};

router.post('/stripe', handleStripeWebhook);

module.exports = router;
