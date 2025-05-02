const express = require('express');
const router = express.Router();
const { processAIRequest, getUserAIHistory } = require('../controllers/aiController');
const { aiTokenMiddleware, recordTokenUsage } = require('../middleware/aiMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only document file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Process AI request with token tracking
router.post('/process', 
  aiTokenMiddleware,       // Check token limits before processing
  processAIRequest,        // Process the AI request
  recordTokenUsage         // Record token usage after processing
);

// Get user's AI usage history
router.get('/history/:userId', getUserAIHistory);

/**
 * Extract text from uploaded documents
 * This endpoint accepts document uploads (PDF, DOC, DOCX, TXT)
 * and returns the extracted text
 */
router.post('/extract-text', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    let extractedText = '';

    // Extract text based on file type
    if (fileType === 'text/plain') {
      // For TXT files - simple text reading
      extractedText = await readFileAsync(filePath, 'utf8');
    } else if (fileType === 'application/pdf') {
      // For PDF files - in production, you would use pdf.js or similar library
      extractedText = `[PDF EXTRACTION] This would use pdf.js in production to extract text from ${req.file.originalname}`;
    } else if (fileType.includes('msword') || fileType.includes('openxmlformats')) {
      // For DOC/DOCX files - in production, you would use mammoth.js or similar library
      extractedText = `[DOC EXTRACTION] This would use mammoth.js in production to extract text from ${req.file.originalname}`;
    }

    // Estimate token count (rough approximation: ~4 characters per token)
    const tokenEstimate = Math.ceil(extractedText.length / 4);

    // Clean up the uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    // Return the extracted text and token estimate
    return res.status(200).json({
      text: extractedText,
      filename: req.file.originalname,
      tokens: tokenEstimate
    });
  } catch (error) {
    console.error('Error extracting text:', error);
    return res.status(500).json({ error: 'Failed to extract text from document' });
  }
});

module.exports = router; 