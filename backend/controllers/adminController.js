/**
 * Admin Controller
 * Handles admin dashboard functionality for user management and analytics
 */
const User = require('../models/User');

/**
 * Get all users with their subscription and token info
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const filters = {};
    if (req.query.subscriptionStatus) {
      filters.subscriptionStatus = req.query.subscriptionStatus;
    }
    if (req.query.plan) {
      filters.subscriptionPlan = req.query.subscriptionPlan;
    }
    if (req.query.email) {
      filters.email = { $regex: req.query.email, $options: 'i' };
    }
    
    // Fetch users with pagination and filters
    const users = await User.find(filters)
      .select('email tokenLimit tokensUsed subscriptionStatus subscriptionPlan subscriptionEnd createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    // Get total count for pagination
    const totalUsers = await User.countDocuments(filters);
    
    res.status(200).json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Get detailed user information including payment and usage history
 */
exports.getUserDetails = async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user details
    res.status(200).json({
      email: user.email,
      subscription: {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        startDate: user.subscriptionStart,
        endDate: user.subscriptionEnd,
        isActive: user.hasActiveSubscription()
      },
      tokens: {
        limit: user.tokenLimit,
        used: user.tokensUsed,
        remaining: user.tokenLimit - user.tokensUsed,
        usagePercentage: Math.round((user.tokensUsed / user.tokenLimit) * 100),
        resetDate: user.resetDate
      },
      history: {
        payments: user.paymentHistory || [],
        usage: user.usageHistory || []
      },
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

/**
 * Get system-wide usage statistics
 */
exports.getSystemStats = async (req, res) => {
  try {
    // Get counts of users by subscription status
    const subscriptionStats = await User.aggregate([
      { $group: { _id: '$subscriptionStatus', count: { $sum: 1 } } }
    ]);
    
    // Get counts of users by plan
    const planStats = await User.aggregate([
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }
    ]);
    
    // Get total tokens used
    const tokensUsed = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$tokensUsed' } } }
    ]);
    
    // Get new users in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Format the stats
    const formatStats = (stats) => {
      return stats.reduce((acc, curr) => {
        acc[curr._id || 'unknown'] = curr.count;
        return acc;
      }, {});
    };
    
    res.status(200).json({
      users: {
        total: await User.countDocuments(),
        new: newUsers
      },
      subscriptions: formatStats(subscriptionStats),
      plans: formatStats(planStats),
      tokens: {
        total: tokensUsed.length > 0 ? tokensUsed[0].total : 0
      },
      asOf: new Date()
    });
  } catch (error) {
    console.error('Error generating system stats:', error);
    res.status(500).json({ error: 'Failed to generate system statistics' });
  }
};

/**
 * Manually adjust a user's subscription
 */
exports.updateUserSubscription = async (req, res) => {
  const { userId } = req.params;
  const { subscriptionStatus, subscriptionPlan, tokenLimit, extension } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields if provided
    if (subscriptionStatus) {
      user.subscriptionStatus = subscriptionStatus;
    }
    
    if (subscriptionPlan) {
      user.subscriptionPlan = subscriptionPlan;
    }
    
    if (tokenLimit) {
      user.tokenLimit = tokenLimit;
    }
    
    // Extend subscription if requested
    if (extension && extension > 0) {
      if (!user.subscriptionEnd) {
        user.subscriptionEnd = new Date();
      }
      
      if (user.subscriptionPlan === 'yearly') {
        // Add days for yearly plan
        user.subscriptionEnd.setDate(user.subscriptionEnd.getDate() + extension);
      } else {
        // Default to monthly - add days
        user.subscriptionEnd.setDate(user.subscriptionEnd.getDate() + extension);
      }
    }
    
    await user.save();
    
    res.status(200).json({ 
      message: 'User subscription updated successfully',
      user: {
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        tokenLimit: user.tokenLimit,
        subscriptionEnd: user.subscriptionEnd
      }
    });
    
  } catch (error) {
    console.error('Error updating user subscription:', error);
    res.status(500).json({ error: 'Failed to update user subscription' });
  }
}; 