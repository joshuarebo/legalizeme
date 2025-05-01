/**
 * AI Request Middleware
 * Tracks token usage for AI requests and enforces token limits
 */
const axios = require('axios');
const { getUserTokenInfo } = require('../utils/tokenManager');

/**
 * Estimates tokens used by a prompt
 * This is a simple approximation - adjust based on your tokenizer
 * 
 * @param {string} prompt - The user's input prompt
 * @param {number} modelFactor - Multiplier for different models (GPT-4 = 1.5, GPT-3.5 = 1, etc)
 * @returns {number} - Estimated token count
 */
const estimateTokens = (prompt, modelFactor = 1) => {
  // Basic estimation: ~4 chars per token on average
  // This is approximate - production should use an actual tokenizer
  const estimatedInputTokens = Math.ceil(prompt.length / 4);
  
  // Estimate output tokens based on input
  // Adjust ratios based on your specific AI model behavior
  const estimatedOutputTokens = Math.ceil(estimatedInputTokens * 1.5);
  
  // Apply model factor (different models have different costs)
  return Math.ceil((estimatedInputTokens + estimatedOutputTokens) * modelFactor);
};

/**
 * Middleware to check token limits before processing AI requests
 */
const aiTokenMiddleware = async (req, res, next) => {
  const { userId, prompt, model = 'default' } = req.body;
  
  if (!userId || !prompt) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['userId', 'prompt'] 
    });
  }

  try {
    // Get model factor based on model type
    const modelFactors = {
      'gpt-4': 1.5,
      'gpt-3.5-turbo': 1,
      'default': 1
    };
    
    const modelFactor = modelFactors[model] || modelFactors.default;
    
    // Estimate token usage for this request
    const tokensToUse = estimateTokens(prompt, modelFactor);
    
    // Check user's token status before processing
    const tokenInfo = await getUserTokenInfo(userId);
    
    // If user will exceed limit, reject the request
    if (tokenInfo.tokensUsed + tokensToUse > tokenInfo.tokenLimit) {
      return res.status(403).json({
        error: 'Token limit exceeded',
        tokenInfo: {
          used: tokenInfo.tokensUsed,
          limit: tokenInfo.tokenLimit,
          remaining: tokenInfo.remainingTokens,
          requestCost: tokensToUse
        },
        upgradeUrl: '/pricing'
      });
    }
    
    // Store token usage estimate for later use
    req.tokenUsage = {
      userId,
      tokensToUse,
      timestamp: new Date()
    };
    
    // Continue to AI processing
    next();
    
  } catch (error) {
    console.error('Token check error:', error);
    return res.status(500).json({ 
      error: 'Failed to check token limit',
      message: error.message
    });
  }
};

/**
 * Middleware to record actual token usage after AI response
 */
const recordTokenUsage = async (req, res, next) => {
  // Only process if we have token usage info
  if (!req.tokenUsage) {
    return next();
  }
  
  const { userId, tokensToUse } = req.tokenUsage;
  
  try {
    // Record the token usage
    await axios.post(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/tokens/use-tokens`, {
      userId,
      tokensToUse
    });
    
    // Continue processing
    next();
  } catch (error) {
    // Log but don't fail the request - the user already got their response
    console.error('Failed to record token usage:', error);
    next();
  }
};

module.exports = { 
  aiTokenMiddleware, 
  recordTokenUsage,
  estimateTokens 
}; 