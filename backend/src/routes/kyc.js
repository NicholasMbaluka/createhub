const express = require('express');
const router = express.Router();
const { getKYCStatus, submitKYC, getPendingKYC, approveKYC, rejectKYC } = require('../controllers/kycController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',                       protect, getKYCStatus);
router.post('/submit',                protect, authorize('creator'), submitKYC);
router.get('/admin/pending',          protect, authorize('admin'), getPendingKYC);
router.put('/admin/:userId/approve',  protect, authorize('admin'), approveKYC);
router.put('/admin/:userId/reject',   protect, authorize('admin'), rejectKYC);

module.exports = router;
