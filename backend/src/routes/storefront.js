const express = require('express');
const router = express.Router();
const {
  getCreatorStorefront,
  getStorefrontCustomization,
  updateStorefrontCustomization,
  generateSlug
} = require('../controllers/storefrontController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/:slug', getCreatorStorefront);

// Private creator routes
router.get('/customization', protect, authorize('creator'), getStorefrontCustomization);
router.put('/customization', protect, authorize('creator'), updateStorefrontCustomization);
router.post('/generate-slug', protect, authorize('creator'), generateSlug);

module.exports = router;
