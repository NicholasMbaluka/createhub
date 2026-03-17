const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');

// @desc  Get creator earnings dashboard
// @route GET /api/revenue/dashboard
// @access Private (creator)
const getRevenueDashboard = async (req, res) => {
  try {
    const creatorId = req.user._id;
    const { period = '30d' } = req.query;

    const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get completed orders
    const orders = await Order.find({ 
      creator: creatorId, 
      status: 'completed', 
      createdAt: { $gte: since } 
    }).populate('product', 'name type pricing.amount');

    // Get active subscriptions
    const subscriptions = await Subscription.find({ 
      creator: creatorId, 
      status: 'active' 
    });

    // Calculate earnings
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.subtotal, 0);
    const subscriptionRevenue = subscriptions.reduce((sum, sub) => sum + sub.pricing.amount, 0);
    const totalEarnings = totalRevenue + subscriptionRevenue;

    // Build daily revenue chart
    const revenueByDay = {};
    orders.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + order.pricing.subtotal;
    });

    const chartData = Object.entries(revenueByDay)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get top products
    const productSales = {};
    orders.forEach(order => {
      const productId = order.product._id.toString();
      if (!productSales[productId]) {
        productSales[productId] = {
          name: order.product.name,
          type: order.product.type,
          sales: 0,
          revenue: 0
        };
      }
      productSales[productId].sales += 1;
      productSales[productId].revenue += order.pricing.subtotal;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get recent transactions
    const recentTransactions = orders
      .slice(-10)
      .reverse()
      .map(order => ({
        id: order._id,
        product: order.product.name,
        amount: order.pricing.subtotal,
        date: order.createdAt,
        type: 'sale'
      }));

    res.json({
      success: true,
      dashboard: {
        totalEarnings,
        totalRevenue,
        subscriptionRevenue,
        totalSales: orders.length,
        activeSubscriptions: subscriptions.length,
        chartData,
        topProducts,
        recentTransactions,
        period
      }
    });

  } catch (error) {
    console.error('Revenue dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get payout methods
// @route GET /api/revenue/payout-methods
// @access Private (creator)
const getPayoutMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('payoutMethods');
    
    res.json({
      success: true,
      payoutMethods: user.payoutMethods || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Add payout method
// @route POST /api/revenue/payout-methods
// @access Private (creator)
const addPayoutMethod = async (req, res) => {
  try {
    const { type, details } = req.body;
    
    // Validate payout method
    if (type === 'bank') {
      const { accountNumber, routingNumber, accountHolderName } = details;
      if (!accountNumber || !routingNumber || !accountHolderName) {
        return res.status(400).json({ success: false, message: 'Missing required bank details' });
      }
    }

    const user = await User.findById(req.user._id);
    if (!user.payoutMethods) user.payoutMethods = [];

    const newMethod = {
      id: new Date().getTime().toString(),
      type,
      details,
      isDefault: user.payoutMethods.length === 0,
      createdAt: new Date()
    };

    user.payoutMethods.push(newMethod);
    await user.save();

    res.json({
      success: true,
      message: 'Payout method added successfully',
      payoutMethod: newMethod
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Request payout
// @route POST /api/revenue/request-payout
// @access Private (creator)
const requestPayout = async (req, res) => {
  try {
    const { amount, payoutMethodId } = req.body;
    const creatorId = req.user._id;

    // Validate minimum payout amount (e.g., $10)
    if (amount < 10) {
      return res.status(400).json({ success: false, message: 'Minimum payout amount is $10' });
    }

    // Calculate available balance (simplified)
    const orders = await Order.find({ 
      creator: creatorId, 
      status: 'completed' 
    });

    const availableBalance = orders.reduce((sum, order) => sum + order.pricing.subtotal, 0);

    if (amount > availableBalance) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Create payout request (simplified - in production use Stripe Connect)
    const payout = {
      id: new Date().getTime().toString(),
      amount,
      status: 'pending',
      createdAt: new Date(),
      payoutMethodId
    };

    // In production, integrate with Stripe Connect here
    res.json({
      success: true,
      message: 'Payout request submitted successfully',
      payout
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getRevenueDashboard,
  getPayoutMethods,
  addPayoutMethod,
  requestPayout
};
