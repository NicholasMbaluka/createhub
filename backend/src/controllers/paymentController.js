// Payment Controller - Handle all payment operations
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const { createNotification } = require('../utils/notifications');

class PaymentController {
  
  // Create payment intent for customer purchase
  static async createPaymentIntent(req, res) {
    try {
      const { productId, paymentMethodId, customerEmail } = req.body;
      
      // Get product details
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(product.pricing.amount * 100), // Convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        customer_email: customerEmail,
        metadata: {
          productId: productId,
          creatorId: product.creator,
          buyerId: req.user._id
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        }
      });
      
      // Create payment record
      const payment = await Payment.create({
        stripePaymentIntentId: paymentIntent.id,
        productId,
        buyerId: req.user._id,
        creatorId: product.creator,
        amount: product.pricing.amount,
        status: 'pending',
        currency: 'usd'
      });
      
      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id
      });
      
    } catch (error) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ success: false, message: 'Payment processing failed' });
    }
  }
  
  // Confirm payment and create order
  static async confirmPayment(req, res) {
    try {
      const { paymentIntentId } = req.body;
      
      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ success: false, message: 'Payment not successful' });
      }
      
      // Find payment record
      const payment = await Payment.findOne({ 
        stripePaymentIntentId: paymentIntentId 
      }).populate('productId').populate('creatorId').populate('buyerId');
      
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment record not found' });
      }
      
      // Update payment status
      payment.status = 'completed';
      payment.completedAt = new Date();
      payment.stripeChargeId = paymentIntent.charges.data[0].id;
      await payment.save();
      
      // Create order
      const order = await Order.create({
        buyer: payment.buyerId._id,
        creator: payment.creatorId._id,
        product: payment.productId._id,
        status: 'completed',
        pricing: {
          subtotal: payment.amount,
          currency: payment.currency
        },
        payment: {
          provider: 'stripe',
          paymentIntentId: paymentIntentId,
          chargeId: paymentIntent.charges.data[0].id,
          receiptUrl: paymentIntent.charges.data[0].receipt_url,
          paidAt: new Date()
        },
        accessToken: `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        accessExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      });
      
      // Create transaction record
      await Transaction.create({
        paymentId: payment._id,
        orderId: order._id,
        type: 'sale',
        amount: payment.amount,
        fee: (payment.amount * 0.029) + 0.30, // Stripe fee (2.9% + $0.30)
        netAmount: payment.amount - ((payment.amount * 0.029) + 0.30),
        status: 'completed',
        createdAt: new Date()
      });
      
      // Notify creator
      await createNotification(payment.creatorId._id, {
        type: 'sale',
        title: `New sale: ${payment.productId.name}`,
        body: `You earned $${payment.amount.toFixed(2)} from ${payment.buyerId.firstName} ${payment.buyerId.lastName}`,
        metadata: { 
          orderId: order._id,
          buyerId: payment.buyerId._id 
        }
      });
      
      // Notify buyer
      await createNotification(payment.buyerId._id, {
        type: 'purchase',
        title: `Purchase confirmed: ${payment.productId.name}`,
        body: `Your order has been confirmed and is now available in your library`,
        metadata: { 
          orderId: order._id,
          productId: payment.productId._id 
        }
      });
      
      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        order: {
          id: order._id,
          productId: payment.productId._id,
          productName: payment.productId.name,
          amount: payment.amount,
          status: 'completed'
        }
      });
      
    } catch (error) {
      console.error('Payment confirmation error:', error);
      res.status(500).json({ success: false, message: 'Payment confirmation failed' });
    }
  }
  
  // Handle payment failures
  static async handlePaymentFailure(req, res) {
    try {
      const { paymentIntentId, reason } = req.body;
      
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { 
          status: 'failed',
          failureReason: reason,
          failedAt: new Date()
        }
      );
      
      if (payment) {
        // Notify buyer of failure
        await createNotification(payment.buyerId, {
          type: 'payment_failed',
          title: 'Payment failed',
          body: `Your payment for ${payment.productId} could not be processed. ${reason}`,
          metadata: { paymentId: payment._id }
        });
      }
      
      res.json({
        success: true,
        message: 'Payment failure recorded'
      });
      
    } catch (error) {
      console.error('Payment failure handling error:', error);
      res.status(500).json({ success: false, message: 'Failed to record payment failure' });
    }
  }
  
  // Process refunds
  static async processRefund(req, res) {
    try {
      const { orderId, reason } = req.body;
      
      // Get order details
      const order = await Order.findById(orderId).populate('product');
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      
      // Check if already refunded
      if (order.status === 'refunded') {
        return res.status(400).json({ success: false, message: 'Order already refunded' });
      }
      
      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: order.payment.paymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          orderId: orderId,
          refundReason: reason
        }
      });
      
      // Update order status
      order.status = 'refunded';
      order.refund = {
        reason: reason,
        refundedAt: new Date(),
        refundId: refund.id,
        amount: refund.amount / 100
      };
      await order.save();
      
      // Create transaction record
      await Transaction.create({
        orderId: orderId,
        type: 'refund',
        amount: -refund.amount / 100,
        fee: 0,
        netAmount: -refund.amount / 100,
        status: 'completed',
        createdAt: new Date()
      });
      
      // Notify both parties
      await createNotification(order.buyer, {
        type: 'refund',
        title: 'Refund processed',
        body: `Your refund for ${order.product.name} has been processed`,
        metadata: { orderId: orderId }
      });
      
      await createNotification(order.creator, {
        type: 'refund',
        title: 'Refund issued',
        body: `A refund was issued for ${order.product.name}`,
        metadata: { orderId: orderId }
      });
      
      res.json({
        success: true,
        message: 'Refund processed successfully',
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status
        }
      });
      
    } catch (error) {
      console.error('Refund processing error:', error);
      res.status(500).json({ success: false, message: 'Refund processing failed' });
    }
  }
  
  // Get payment history for creator
  static async getPaymentHistory(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const creatorId = req.user._id;
      
      const query = { creatorId };
      if (status) query.status = status;
      
      const payments = await Payment.find(query)
        .populate('productId', 'name type')
        .populate('buyerId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      
      const total = await Payment.countDocuments(query);
      
      res.json({
        success: true,
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      console.error('Payment history error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
    }
  }
  
  // Get payment analytics
  static async getPaymentAnalytics(req, res) {
    try {
      const creatorId = req.user._id;
      const { period = '30d' } = req.query;
      
      const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const payments = await Payment.find({
        creatorId,
        status: 'completed',
        createdAt: { $gte: since }
      }).populate('productId', 'name type pricing.amount');
      
      // Calculate analytics
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalSales = payments.length;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
      
      // Daily revenue chart
      const dailyRevenue = {};
      payments.forEach(payment => {
        const day = payment.createdAt.toISOString().split('T')[0];
        dailyRevenue[day] = (dailyRevenue[day] || 0) + payment.amount;
      });
      
      const chartData = Object.entries(dailyRevenue)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Top products
      const productSales = {};
      payments.forEach(payment => {
        const productId = payment.productId._id.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            name: payment.productId.name,
            type: payment.productId.type,
            sales: 0,
            revenue: 0
          };
        }
        productSales[productId].sales += 1;
        productSales[productId].revenue += payment.amount;
      });
      
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      res.json({
        success: true,
        analytics: {
          totalRevenue,
          totalSales,
          averageOrderValue,
          chartData,
          topProducts,
          period
        }
      });
      
    } catch (error) {
      console.error('Payment analytics error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payment analytics' });
    }
  }
}

module.exports = PaymentController;
