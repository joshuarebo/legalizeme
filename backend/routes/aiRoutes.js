const express = require('express');
const router = express.Router();
const { processAIRequest, getUserAIHistory } = require('../controllers/aiController');
const { aiTokenMiddleware, recordTokenUsage } = require('../middleware/aiMiddleware');

// Process AI request with token tracking
router.post('/process', 
  aiTokenMiddleware,       // Check token limits before processing
  processAIRequest,        // Process the AI request
  recordTokenUsage         // Record token usage after processing
);

// Get user's AI usage history
router.get('/history/:userId', getUserAIHistory);

module.exports = router; 