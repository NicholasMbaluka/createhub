const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');

// @desc  Get creator analytics dashboard
// @route GET /api/analytics/creator
// @access Private (creator)
const getCreatorAnalytics = async (req, res) => {
  try {
    const creatorId = req.user._id;
    const { period = '30d' } = req.query;

    const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [orders, products, subs] = await Promise.all([
      Order.find({ creator: creatorId, status: 'completed', createdAt: { $gte: since } })
        .sort({ createdAt: 1 }),
      Product.find({ creator: creatorId }),
      Subscription.countDocuments({ creator: creatorId, status: 'active' }),
    ]);

    const totalRevenue = orders.reduce((s, o) => s + o.pricing.creatorNet, 0);
    const totalSales = orders.length;

    // Build daily revenue chart data
    const revenueByDay = {};
    orders.forEach(o => {
      const day = o.createdAt.toISOString().split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + o.pricing.creatorNet;
    });

    // Product breakdown
    const productRevenue = {};
    orders.forEach(o => {
      const pid = o.product.toString();
      productRevenue[pid] = (productRevenue[pid] || 0) + o.pricing.creatorNet;
    });

    const topProducts = products
      .map(p => ({ id: p._id, name: p.name, type: p.type, revenue: productRevenue[p._id.toString()] || 0, sales: p.stats.sales }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json({
      success: true,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalSales,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.status === 'active').length,
        activeSubscribers: subs,
        avgOrderValue: totalSales ? Math.round((totalRevenue / totalSales) * 100) / 100 : 0,
      },
      chart: { revenueByDay },
      topProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get admin platform analytics
// @route GET /api/analytics/admin
// @access Private (admin)
const getAdminAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalCreators, totalOrders, recentOrders] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'creator' }),
      Order.countDocuments({ status: 'completed' }),
      Order.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(10)
        .populate('buyer', 'firstName lastName')
        .populate('product', 'name'),
    ]);

    const revenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.subtotal' }, fees: { $sum: '$pricing.platformFee' } } },
    ]);

    const userGrowth = await User.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } }, { $limit: 30 },
    ]);

    res.json({
      success: true,
      summary: {
        totalUsers,
        totalCreators,
        totalOrders,
        platformRevenue: revenue[0]?.total || 0,
        platformFees: revenue[0]?.fees || 0,
      },
      userGrowth: userGrowth.reverse(),
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get user's personal stats
// @route GET /api/analytics/my-stats
// @access Private
const getMyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's products and their stats
    const products = await Product.find({ creator: userId });
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    
    // Get user's orders (sales)
    const orders = await Order.find({ creator: userId, status: 'completed' });
    const totalSales = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.creatorNet, 0);
    
    // Get user's subscriptions (if any)
    const subscriptions = await Subscription.find({ creator: userId, status: 'active' });
    const totalSubscribers = subscriptions.length;
    const monthlyRecurringRevenue = subscriptions.reduce((sum, sub) => sum + sub.pricing.amount, 0);
    
    res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        totalSales,
        totalRevenue,
        totalSubscribers,
        monthlyRecurringRevenue,
        avgProductPrice: totalProducts > 0 ? totalRevenue / totalSales : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get platform-wide stats
// @route GET /api/analytics/platform
// @access Public
const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCreators = await User.countDocuments({ role: 'creator' });
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    
    const totalOrders = await Order.countDocuments({ status: 'completed' });
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.subtotal' } } }
    ]);
    
    const platformRevenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    
    res.json({
      success: true,
      stats: {
        totalCreators,
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue: platformRevenue,
        avgOrderValue: totalOrders > 0 ? platformRevenue / totalOrders : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getCreatorAnalytics,
  getAdminAnalytics,
  getMyStats,
  getPlatformStats,
};
