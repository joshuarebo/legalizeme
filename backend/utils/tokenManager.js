// utils/tokenManager.js
const User = require("../models/User");

// Legacy in-memory store for compatibility with existing payment code
const userTokens = {};

/**
 * Assign tokens to a user in memory (legacy method)
 * @param {string} userId - User ID
 * @param {string} plan - Plan type (monthly or yearly)
 */
const assignTokens = async (userId, plan) => {
  if (!userId || !plan) {
    throw new Error("User ID and plan are required");
  }

  const tokenMap = {
    monthly: 150000,
    yearly: 2000000,
  };

  if (!tokenMap[plan]) {
    throw new Error(`Invalid plan type: ${plan}`);
  }

  userTokens[userId] = {
    tokens: tokenMap[plan],
    plan,
    expiresAt: plan === 'monthly'
      ? Date.now() + 30 * 24 * 60 * 60 * 1000
      : Date.now() + 365 * 24 * 60 * 60 * 1000,
  };

  // If we have a database user, update them too for consistency
  try {
    const user = await User.findById(userId);
    if (user) {
      await assignPlan(userId, plan);
    }
  } catch (error) {
    console.error(`Failed to update database user after memory assignment: ${error.message}`);
    // Don't throw here - the memory store update succeeded
  }

  return userTokens[userId];
};

/**
 * Assign a plan to a user in the database
 * @param {string} userId - User ID
 * @param {string} plan - Plan type (monthly or annual)
 */
const assignPlan = async (userId, plan) => {
  if (!userId || !plan) {
    throw new Error("User ID and plan are required");
  }

  const plans = {
    monthly: 150000,
    annual: 2000000,
    yearly: 2000000, // Alias for annual for compatibility
  };

  if (!plans[plan]) {
    throw new Error(`Invalid plan type: ${plan}`);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  user.tokenLimit = plans[plan];
  user.tokensUsed = 0;
  user.resetDate = new Date();
  
  try {
    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Failed to save user: ${error.message}`);
  }
};

/**
 * Get current token usage for a user
 * @param {string} userId - User ID
 */
const getUserTokenInfo = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  return {
    email: user.email,
    tokenLimit: user.tokenLimit,
    tokensUsed: user.tokensUsed,
    remainingTokens: user.tokenLimit - user.tokensUsed,
    usagePercentage: Math.round((user.tokensUsed / user.tokenLimit) * 100),
    resetDate: user.resetDate
  };
};

module.exports = { assignTokens, userTokens, assignPlan, getUserTokenInfo }; 