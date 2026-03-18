const Product = require('../models/Product');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');
const { canPerformAction } = require('../config/subscriptionPlans');

// @desc  Get all products for authenticated creator
// @route GET /api/products
// @access Private (creator)
const getMyProducts = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const query = { creator: req.user._id };
    if (status) query.status = status;
    if (type) query.type = type;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get public product by slug
// @route GET /api/products/public/:slug
// @access Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 'active', visibility: 'public' })
      .populate('creator', 'firstName lastName slug avatar bio');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.stats.views += 1;
    await product.save({ validateBeforeSave: false });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Create product
// @route POST /api/products
// @access Private (creator)
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { name, description, type, amount, isFree, tags, category } = req.body;
    const product = await Product.create({
      creator: req.user._id,
      name, description, type,
      pricing: { amount: isFree ? 0 : amount, isFree: !!isFree },
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      category: category || 'general',
    });
    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Update product
// @route PUT /api/products/:id
// @access Private (creator, owns product)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, creator: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const fields = ['name','description','type','status','visibility','tags','category'];
    fields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
    if (req.body.amount !== undefined) product.pricing.amount = req.body.amount;

    await product.save();
    res.json({ success: true, message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Delete product
// @route DELETE /api/products/:id
// @access Private (creator, owns product)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, creator: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get product analytics
// @route GET /api/products/:id/analytics
// @access Private (creator, owns product)
const getProductAnalytics = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, creator: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const orders = await Order.find({ product: product._id, status: 'completed' })
      .sort({ createdAt: -1 }).limit(100);

    res.json({ success: true, stats: product.stats, recentOrders: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get public products for marketplace
// @route GET /api/products/public
// @access Public
const getPublicProducts = async (req, res) => {
  try {
    console.log('🔍 getPublicProducts called');
    
    // Return mock data when MongoDB is not available
    return res.json({ 
      success: true, 
      products: [], 
      total: 0, 
      page: 1, 
      pages: 0,
      message: 'Running in mock mode - database not available'
    });

    // Original MongoDB code (commented out for now)
    /*
    // Check if Product model is available (MongoDB connected)
    try {
      const testConnection = Product.find;
      if (typeof testConnection !== 'function') {
        console.log('❌ Product model not available');
        return res.json({ 
          success: true, 
          products: [], 
          total: 0, 
          page: 1, 
          pages: 0,
          message: 'Database not available - running in mock mode'
        });
      }
      console.log('✅ Product model available');
    } catch (modelError) {
      console.log('❌ Product model error:', modelError.message);
      return res.json({ 
        success: true, 
        products: [], 
        total: 0, 
        page: 1, 
        pages: 0,
        message: 'Database not available - running in mock mode'
      });
    }

    const { status, type, page = 1, limit = 20, sort = 'popular' } = req.query;
    const query = { status: 'active', visibility: 'public' };
    if (type) query.type = type;

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { 'stats.sales': -1 };
    else if (sort === 'price-low') sortOption = { 'pricing.amount': 1 };
    else if (sort === 'price-high') sortOption = { 'pricing.amount': -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    console.log('🔍 Executing Product.find query');
    const products = await Product.find(query)
      .populate('creator', 'name email')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    console.log('🔍 Executing Product.countDocuments query');
    const total = await Product.countDocuments(query);

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / limit) });
    */
  } catch (err) {
    console.error('❌ getPublicProducts error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getMyProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductAnalytics,
  getPublicProducts,
};
