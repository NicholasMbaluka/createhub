const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @desc  Get purchased product content
// @route GET /api/delivery/product/:orderId
// @access Private
const getProductContent = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    // Verify order belongs to user and is completed
    const order = await Order.findOne({ 
      _id: orderId, 
      buyer: userId, 
      status: 'completed' 
    }).populate('product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not completed' });
    }

    const product = order.product;

    // Check if access is still valid
    if (order.accessExpires && new Date() > order.accessExpires) {
      return res.status(403).json({ success: false, message: 'Access expired' });
    }

    // Return product content based on type
    let content = {};

    switch (product.type) {
      case 'digital':
        content = {
          type: 'digital',
          downloadUrl: product.content?.downloadUrl,
          fileName: product.content?.fileName,
          fileSize: product.content?.fileSize,
          accessKey: order.accessToken,
          downloadCount: order.downloadCount || 0,
          maxDownloads: product.content?.maxDownloads || -1
        };
        break;

      case 'course':
        content = {
          type: 'course',
          lessons: product.content?.lessons || [],
          progress: order.progress || {},
          totalLessons: product.content?.lessons?.length || 0,
          completedLessons: Object.values(order.progress || {}).filter(Boolean).length
        };
        break;

      case 'membership':
        content = {
          type: 'membership',
          accessLevel: product.content?.accessLevel || 'basic',
          features: product.content?.features || [],
          validUntil: order.accessExpires
        };
        break;

      case 'service':
        content = {
          type: 'service',
          instructions: product.content?.instructions,
          contactInfo: product.content?.contactInfo,
          bookingLink: product.content?.bookingLink,
          status: order.serviceStatus || 'pending'
        };
        break;

      default:
        content = {
          type: 'general',
          description: product.description,
          instructions: product.content?.instructions
        };
    }

    res.json({
      success: true,
      order: {
        id: order._id,
        createdAt: order.createdAt,
        accessExpires: order.accessExpires
      },
      product: {
        id: product._id,
        name: product.name,
        type: product.type,
        description: product.description
      },
      content
    });

  } catch (error) {
    console.error('Get product content error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Download digital product
// @route GET /api/delivery/download/:orderId
// @access Private
const downloadProduct = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ 
      _id: orderId, 
      buyer: userId, 
      status: 'completed' 
    }).populate('product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not completed' });
    }

    const product = order.product;

    if (product.type !== 'digital') {
      return res.status(400).json({ success: false, message: 'Product is not downloadable' });
    }

    // Check download limits
    const maxDownloads = product.content?.maxDownloads || -1;
    if (maxDownloads > 0 && (order.downloadCount || 0) >= maxDownloads) {
      return res.status(403).json({ success: false, message: 'Download limit exceeded' });
    }

    // Check if access is still valid
    if (order.accessExpires && new Date() > order.accessExpires) {
      return res.status(403).json({ success: false, message: 'Access expired' });
    }

    // Increment download count
    await Order.findByIdAndUpdate(orderId, { 
      $inc: { downloadCount: 1 },
      lastDownloadAt: new Date()
    });

    // For demo purposes, return a download URL
    // In production, serve the actual file
    const downloadUrl = product.content?.downloadUrl;
    if (downloadUrl) {
      res.json({
        success: true,
        downloadUrl,
        fileName: product.content?.fileName || 'product.zip',
        remainingDownloads: maxDownloads > 0 ? maxDownloads - (order.downloadCount || 0) - 1 : 'unlimited'
      });
    } else {
      res.status(404).json({ success: false, message: 'Download file not available' });
    }

  } catch (error) {
    console.error('Download product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Update course progress
// @route PUT /api/delivery/progress/:orderId
// @access Private
const updateProgress = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { lessonId, completed } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ 
      _id: orderId, 
      buyer: userId, 
      status: 'completed' 
    }).populate('product');

    if (!order || order.product.type !== 'course') {
      return res.status(404).json({ success: false, message: 'Course order not found' });
    }

    // Update progress
    if (!order.progress) order.progress = {};
    order.progress[lessonId] = completed;
    await order.save();

    const totalLessons = order.product.content?.lessons?.length || 0;
    const completedLessons = Object.values(order.progress).filter(Boolean).length;
    const progressPercentage = (completedLessons / totalLessons) * 100;

    res.json({
      success: true,
      progress: {
        lessonId,
        completed,
        completedLessons,
        totalLessons,
        progressPercentage
      }
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get user's purchased products
// @route GET /api/delivery/my-products
// @access Private
const getMyPurchasedProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const orders = await Order.find({ 
      buyer: userId, 
      status: 'completed' 
    })
    .populate('product', 'name type description thumbnail createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

    const products = orders.map(order => ({
      orderId: order._id,
      product: order.product,
      purchasedAt: order.createdAt,
      accessExpires: order.accessExpires,
      downloadCount: order.downloadCount || 0,
      progress: order.progress || {},
      status: order.accessExpires && new Date() > order.accessExpires ? 'expired' : 'active'
    }));

    const total = await Order.countDocuments({ buyer: userId, status: 'completed' });

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get purchased products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProductContent,
  downloadProduct,
  updateProgress,
  getMyPurchasedProducts
};
