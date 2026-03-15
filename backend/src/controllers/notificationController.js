const Notification = require('../models/Notification');

// @desc  Get my notifications
// @route GET /api/notifications
// @access Private
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = { user: req.user._id };
    if (unreadOnly === 'true') query.read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Mark notification(s) as read
// @route PUT /api/notifications/read
// @access Private
const markRead = async (req, res) => {
  try {
    const { ids } = req.body; // array of IDs, or empty to mark all
    const query = { user: req.user._id };
    if (ids && ids.length) query._id = { $in: ids };
    await Notification.updateMany(query, { read: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Delete a notification
// @route DELETE /api/notifications/:id
// @access Private
const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { 
  getMyNotifications: getNotifications, 
  markNotificationRead: markRead, 
  markAllNotificationsRead: markRead,
  deleteNotification 
};
