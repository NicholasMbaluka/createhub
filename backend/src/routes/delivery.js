const express = require('express');
const router = express.Router();
const {
  getProductContent,
  downloadProduct,
  updateProgress,
  getMyPurchasedProducts
} = require('../controllers/deliveryController');
const { protect } = require('../middleware/auth');

// Product delivery routes
router.get('/product/:orderId', protect, getProductContent);
router.get('/download/:orderId', protect, downloadProduct);
router.put('/progress/:orderId', protect, updateProgress);
router.get('/my-products', protect, getMyPurchasedProducts);

module.exports = router;
