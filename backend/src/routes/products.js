const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getMyProducts, getProductBySlug, createProduct,
  updateProduct, deleteProduct, getProductAnalytics, getPublicProducts,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/public', getPublicProducts);
router.get('/public/:slug', getProductBySlug);

// Creator
router.get('/',    protect, authorize('creator', 'admin'), getMyProducts);
router.post('/', [
  protect, authorize('creator'),
  body('name').trim().notEmpty().withMessage('Product name required'),
  body('description').trim().notEmpty().withMessage('Description required'),
  body('type').isIn(['course','template','ebook','file_bundle','coaching','subscription']),
  body('amount').isNumeric().withMessage('Valid price required'),
], createProduct);
router.put('/:id',            protect, updateProduct);
router.delete('/:id',         protect, deleteProduct);
router.get('/:id/analytics',  protect, getProductAnalytics);

module.exports = router;
