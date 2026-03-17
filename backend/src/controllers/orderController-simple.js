const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');
const { v4: uuidv4 } = require('uuid');
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

    const subtotal = product.pricing.amount;
    const order = await Order.create({
      buyer:   req.user._id,
      creator: product.creator._id,
      product: productId,
      status: product.pricing.isFree ? 'completed' : 'pending',
      pricing: { subtotal },
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
        // Delete: order since payment failed
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
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Finalize order (for free products)
// Helper function
const finalizeOrder = async (order, product) => {
  // Notify creator
  await createNotification(product.creator._id, {
    type: 'sale',
    title: `New sale: ${product.name}`,
    body: `${req.user.firstName} ${req.user.lastName} purchased your product "${product.name}".`,
  });

  // Mark order as completed
  order.status = 'completed';
  order.completedAt = new Date();
  await order.save();
};

// @desc  Get user orders
// @route GET /api/orders
// @access Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('product', 'name pricing amount')
      .populate('creator', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get order details
// @route GET /api/orders/:id
// @access Private (owns order)
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id })
      .populate('product', 'name pricing amount')
      .populate('creator', 'firstName lastName avatar');

    if (!order || order.buyer.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Confirm payment (webhook)
// @route POST /api/orders/confirm
// @access Private (Stripe webhook)
const confirmPayment = async (req, res) => {
  try {
    const event = req.body;
    
    // Handle payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
      
      if (order) {
        order.status = 'completed';
        order.completedAt = new Date();
        await order.save();

        // Get product and creator details
        const populatedOrder = await Order.findById(order._id)
          .populate('product', 'name creator')
          .populate('creator', 'firstName lastName email');

        // Notify creator
        await createNotification(populatedOrder.product.creator._id, {
          type: 'sale',
          title: `Payment completed: ${populatedOrder.product.name}`,
          body: `${populatedOrder.creator.firstName} ${populatedOrder.creator.lastName}, you received a payment of $${(populatedOrder.product.pricing.amount / 100).toFixed(2)} for "${populatedOrder.product.name}".`,
        });

        // Notify buyer
        await createNotification(order.buyer, {
          type: 'purchase',
          title: `Purchase confirmed: ${populatedOrder.product.name}`,
          body: `Your purchase of "${populatedOrder.product.name}" has been confirmed. You now have access to the product.`,
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ received: false });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  confirmPayment,
};
