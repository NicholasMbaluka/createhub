const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getMySales,
  requestRefund,
  getAllOrders,
  finalizeOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Buyer routes
router.get('/', protect, getUserOrders);
router.post('/', protect, createOrder);
router.post('/:id/refund', protect, requestRefund);

// Creator routes
router.get('/sales', protect, authorize('creator'), getMySales);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAllOrders);

module.exports = router;
