const User = require('../models/User');
const Product = require('../models/Product');

// @desc  Get my profile
// @route GET /api/users/me
// @access Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Update my profile
// @route PUT /api/users/me
// @access Private
const updateProfile = async (req, res) => {
  const allowed = ['firstName', 'lastName', 'bio', 'socialLinks'];
  try {
    const user = await User.findById(req.user._id);
    allowed.forEach(field => { if (req.body[field] !== undefined) user[field] = req.body[field]; });
    if (req.body.slug && req.user.role === 'creator') user.slug = req.body.slug;
    await user.save();
    res.json({ success: true, message: 'Profile updated', user: user.toPublic() });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Slug already taken' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get public creator profile
// @route GET /api/users/creator/:slug
// @access Public
const getCreatorProfile = async (req, res) => {
  try {
    const creator = await User.findOne({ slug: req.params.slug, role: 'creator', status: 'active' })
      .select('firstName lastName bio avatar slug socialLinks stats');
    if (!creator) return res.status(404).json({ success: false, message: 'Creator not found' });

    const products = await Product.find({ creator: creator._id, status: 'active', visibility: 'public' })
      .select('name slug type pricing stats media').limit(20);

    res.json({ success: true, creator, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, getCreatorProfile };
