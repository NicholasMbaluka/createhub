const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getCreatorProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/me',                 protect, getProfile);
router.put('/me',                 protect, updateProfile);
router.get('/creator/:slug',      getCreatorProfile);   // Public

module.exports = router;
