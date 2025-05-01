const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserDetails, 
  getSystemStats, 
  updateUserSubscription 
} = require('../controllers/adminController');

// Admin authentication middleware would go here in production
// const { isAdmin } = require('../middleware/authMiddleware');

// Get all users with pagination and filtering
router.get('/users', getAllUsers);

// Get detailed user information
router.get('/users/:userId', getUserDetails);

// Get system statistics for dashboard
router.get('/stats', getSystemStats);

// Update a user's subscription
router.put('/users/:userId/subscription', updateUserSubscription);

module.exports = router; 