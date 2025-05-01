const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();

const tokenRoutes = require("./routes/tokenRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { handlePaystackWebhook } = require("./webhooks/paystackWebhook");

const app = express();

// Security middleware
app.use(helmet()); // Add security headers

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  }
});

// Apply rate limiting to all routes except webhooks
app.use(/^(?!\/webhook).+/, limiter);

// Body parser middleware
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    // Raw body needed for webhook signature verification
    if (req.originalUrl.startsWith('/webhook')) {
      req.rawBody = buf;
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS
app.options('*', cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use("/api/tokens", tokenRoutes);
app.use("/api/payment", paymentRoutes);

// Webhook endpoints (no rate limit)
app.post("/webhook/paystack", handlePaystackWebhook);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'LegalizeMe API is running',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource '${req.originalUrl}' was not found`
  });
});

module.exports = app; 