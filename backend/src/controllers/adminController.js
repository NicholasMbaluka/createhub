const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { createNotification } = require('../utils/notifications');

// @desc  Get all users (with filters)
// @route GET /api/admin/users
// @access Private (admin)
const getAllUsers = async (req, res) => {
  try {
    const { role, status, kyc, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role)   query.role = role;
    if (status) query.status = status;
    if (kyc)    query['kyc.status'] = kyc;
    if (search) query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
    ];

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get single user detail
// @route GET /api/admin/users/:id
// @access Private (admin)
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const products = await Product.find({ creator: user._id }).select('name status pricing.amount stats');
    const orders   = await Order.find({ $or: [{ buyer: user._id }, { creator: user._id }] })
      .limit(20).sort({ createdAt: -1 });

    res.json({ success: true, user: user.toPublic(), products, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Suspend or activate user
// @route PUT /api/admin/users/:id/status
// @access Private (admin)
const updateUserStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (status === 'suspended') {
      await createNotification(user._id, {
        type: 'system',
        title: 'Account suspended',
        body: reason || 'Your account has been suspended. Contact support@createhub.io.',
      });
    }

    res.json({ success: true, message: `User ${status}`, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Update user role
// @route PUT /api/admin/users/:id/role
// @access Private (admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['public', 'creator', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Role updated', user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Platform stats summary
// @route GET /api/admin/stats
// @access Private (admin)
const getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, creators, admins, activeUsers, pendingKYC, totalProducts, activeProducts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'creator' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ 'kyc.status': 'pending' }),
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.subtotal' }, fees: { $sum: '$pricing.platformFee' }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, creators, admins, active: activeUsers, pendingKYC },
        products: { total: totalProducts, active: activeProducts },
        revenue: {
          total: revenueAgg[0]?.total || 0,
          fees: revenueAgg[0]?.fees || 0,
          transactions: revenueAgg[0]?.count || 0,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllUsers, getUserDetail, updateUserStatus, updateUserRole, getPlatformStats };
