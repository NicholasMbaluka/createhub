const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');
const { v4: uuidv4 } = require('uuid');
const { calculateCommission } = require('../config/subscriptionPlans');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc  Create order (initiate purchase)
// @route POST /api/orders
// @access Private
const createOrder = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId).populate('creator');
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    // Check if already purchased
    const existing = await Order.findOne({ buyer: req.user._id, product: productId, status: 'completed' });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already own this product' });
    }

    const subtotal    = product.pricing.amount;
    const creatorPlan = product.creator.subscription?.plan || 'starter';
    const platformFee = calculateCommission(creatorPlan, subtotal);
    const creatorNet  = parseFloat((subtotal - platformFee).toFixed(2));

    const order = await Order.create({
      buyer:   req.user._id,
      creator: product.creator._id,
      product: productId,
      status:  product.pricing.isFree ? 'completed' : 'pending',
      pricing: { subtotal, platformFee, creatorNet },
      accessToken: uuidv4(),
      accessExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    // Create Stripe Payment Intent for paid products
    let paymentIntent = null;
    if (!product.pricing.isFree) {
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(subtotal * 100), // Convert to cents
          currency: 'usd',
          metadata: { 
            orderId: order._id.toString(),
            productId: productId,
            buyerId: req.user._id.toString()
          },
          automatic_payment_methods: { enabled: true }
        });
        
        // Update order with payment intent ID
        order.payment.paymentIntentId = paymentIntent.id;
        await order.save();
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // Delete the order since payment failed
        await Order.findByIdAndDelete(order._id);
        return res.status(500).json({ success: false, message: 'Payment processing failed' });
      }
    }

    // If free product, complete immediately
    if (product.pricing.isFree) {
      await finalizeOrder(order, product);
    }

    res.status(201).json({
      success: true,
      message: product.pricing.isFree ? 'Product access granted' : 'Order created — proceed to payment',
      order,
      paymentIntent: paymentIntent ? {
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      } : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Internal: finalize a completed order
const finalizeOrder = async (order, product) => {
  order.status = 'completed';
  order.payment.paidAt = new Date();
  await order.save();

  // Update product stats
  await Product.findByIdAndUpdate(product._id, {
    $inc: { 'stats.sales': 1, 'stats.revenue': order.pricing.creatorNet },
  });

  // Update creator stats
  await User.findByIdAndUpdate(order.creator, {
    $inc: { 'stats.totalSales': 1, 'stats.totalRevenue': order.pricing.creatorNet },
  });

  // Notify creator
  await createNotification(order.creator, {
    type: 'sale',
    title: `New sale: ${product.name}`,
    body: `You earned $${order.pricing.creatorNet.toFixed(2)}`,
    metadata: { orderId: order._id, amount: order.pricing.creatorNet },
  });
};

// @desc  Get my purchases
// @route GET /api/orders/purchases
// @access Private
const getMyPurchases = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id, status: 'completed' })
      .populate('product', 'name type pricing media slug')
      .populate('creator', 'firstName lastName slug')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get my sales (as creator)
// @route GET /api/orders/sales
// @access Private (creator)
const getMySales = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { creator: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('buyer', 'firstName lastName email')
      .populate('product', 'name type')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);
    res.json({ success: true, orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Request refund
// @route POST /api/orders/:id/refund
// @access Private
const requestRefund = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id, status: 'completed' });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const hoursSincePurchase = (Date.now() - order.payment.paidAt) / (1000 * 60 * 60);
    if (hoursSincePurchase > 72) {
      return res.status(400).json({ success: false, message: 'Refund window (72 hours) has passed' });
    }

    order.status = 'refunded';
    order.refund = { reason: req.body.reason, refundedAt: new Date() };
    await order.save();

    // Reverse stats
    await Product.findByIdAndUpdate(order.product, {
      $inc: { 'stats.sales': -1, 'stats.revenue': -order.pricing.creatorNet },
    });
    await User.findByIdAndUpdate(order.creator, {
      $inc: { 'stats.totalSales': -1, 'stats.totalRevenue': -order.pricing.creatorNet },
    });

    res.json({ success: true, message: 'Refund processed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Admin get all orders
// @route GET /api/orders/admin
// @access Private (admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query)
      .populate('buyer', 'firstName lastName email')
      .populate('creator', 'firstName lastName')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(query);
    res.json({ success: true, orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get user's orders (purchases)
// @route GET /api/orders
// @access Private
const getUserOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { buyer: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('product', 'name type')
      .populate('creator', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getMySales,
  requestRefund,
  getAllOrders,
  finalizeOrder,
};
