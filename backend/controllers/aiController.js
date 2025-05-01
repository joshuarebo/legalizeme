/**
 * AI Controller
 * Handles AI processing requests and integration with token system
 */
const axios = require('axios');

/**
 * Process an AI request to an external API (like OpenAI)
 */
exports.processAIRequest = async (req, res) => {
  const { prompt, model = 'gpt-3.5-turbo' } = req.body;
  
  try {
    // Example OpenAI API call - replace with your actual AI provider
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract the response content
    const aiResponse = response.data.choices[0].message.content;
    
    // Return the AI response
    res.status(200).json({
      success: true,
      response: aiResponse,
      usage: {
        estimated: req.tokenUsage?.tokensToUse,
        actual: response.data.usage?.total_tokens
      }
    });
    
  } catch (error) {
    console.error('AI processing error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to process AI request',
      message: error.response?.data?.error?.message || error.message
    });
  }
};

/**
 * Get usage history for a specific user
 */
exports.getUserAIHistory = async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    // This would typically query your database for AI usage history
    // Simplified example - replace with actual database query
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user's token usage information
    return res.status(200).json({
      tokenLimit: user.tokenLimit,
      tokensUsed: user.tokensUsed,
      remainingTokens: user.tokenLimit - user.tokensUsed,
      usagePercentage: Math.round((user.tokensUsed / user.tokenLimit) * 100),
      resetDate: user.resetDate
    });
    
  } catch (error) {
    console.error('Error fetching AI history:', error);
    return res.status(500).json({ error: 'Failed to fetch AI usage history' });
  }
}; 