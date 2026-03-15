const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 * @param {string} userId - Recipient user ID
 * @param {object} data   - { type, title, body, link, metadata }
 */
const createNotification = async (userId, data) => {
  try {
    await Notification.create({ user: userId, ...data });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

module.exports = { createNotification };
