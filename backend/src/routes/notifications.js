const express = require('express');
const router = express.Router();
const { getMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markNotificationRead);
router.put('/read-all', protect, markAllNotificationsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
