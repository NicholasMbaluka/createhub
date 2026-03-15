const express = require('express');
const router = express.Router();
const { getAllUsers, getUserDetail, updateUserStatus, updateUserRole, getPlatformStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const admin = [protect, authorize('admin')];

router.get('/stats',                  ...admin, getPlatformStats);
router.get('/users',                  ...admin, getAllUsers);
router.get('/users/:id',              ...admin, getUserDetail);
router.put('/users/:id/status',       ...admin, updateUserStatus);
router.put('/users/:id/role',         ...admin, updateUserRole);

module.exports = router;
