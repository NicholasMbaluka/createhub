// Simple test endpoint to verify system is working
const express = require('express');
const router = express.Router();

// Test endpoint - no auth required
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'CreateHub API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8081
  });
});

// Mock users endpoint - no auth required
router.get('/mock-users', (req, res) => {
  try {
    const { mockUsers } = require('../config/mockData');
    res.json({
      success: true,
      count: mockUsers.length,
      users: mockUsers.map(u => ({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        status: u.status
      }))
    });
  } catch (error) {
    res.json({
      success: true,
      count: 0,
      users: [],
      message: 'Mock users not initialized'
    });
  }
});

module.exports = router;
