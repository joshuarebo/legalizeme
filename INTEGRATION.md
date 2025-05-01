# Integration Guide for LegalizeMe Payment & Token System

This guide provides step-by-step instructions for integrating the payment and token management system into your existing codebase.

## Prerequisites

Before you begin, ensure you have:

- Node.js (v14+) and npm installed
- MongoDB database set up
- Paystack account with API keys
- OpenAI API key (for AI functionality)

## Step 1: Install Dependencies

Add the following packages to your project:

```bash
npm install express mongoose dotenv axios cors helmet express-rate-limit crypto
```

## Step 2: Set Up Environment Variables

Create or update your `.env` file with the following variables:

```
PAYSTACK_SECRET_KEY=your_secret_key_here
PAYSTACK_PUBLIC_KEY=your_public_key_here
PORT=5000
MONGO_URI=mongodb+srv://your_connection_string
EMAIL_FROM=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
PAYMENT_CALLBACK_URL=http://localhost:3000/payment/success
VERIFY_WEBHOOK_SIGNATURE=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CORS_ORIGIN=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here
API_BASE_URL=http://localhost:5000
NODE_ENV=development
```

## Step 3: Integrate Models

1. Copy the User model to your models directory
2. If you already have a User model, merge the relevant fields:

```javascript
// Key fields to add to your existing User model
{
  tokenLimit: { type: Number, default: 1000000 },
  tokensUsed: { type: Number, default: 0 },
  resetDate: { type: Date, default: () => new Date(new Date().setDate(1)) },
  
  // Subscription fields
  subscriptionId: { type: String, default: null },
  subscriptionStatus: { type: String, enum: ['active', 'inactive', 'pending', 'cancelled'], default: 'inactive' },
  subscriptionPlan: { type: String, enum: ['monthly', 'yearly', 'trial', 'none'], default: 'none' },
  subscriptionStart: { type: Date, default: null },
  subscriptionEnd: { type: Date, default: null },
  
  // Payment history
  paymentHistory: [{
    reference: String,
    amount: Number,
    date: { type: Date, default: Date.now },
    status: String,
    plan: String
  }],
  
  // Token usage history
  usageHistory: [{
    tokens: Number,
    date: { type: Date, default: Date.now },
    request: String
  }]
}
```

3. Add the utility methods for token management and subscription checking

## Step 4: Set Up Routes and Controllers

1. Copy the following directories to your project:
   - `controllers/`
   - `routes/`
   - `middleware/`
   - `utils/`
   - `webhooks/`

2. Integrate the routes into your Express app:

```javascript
// In your main app.js or server.js file
const tokenRoutes = require("./routes/tokenRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { handlePaystackWebhook } = require("./webhooks/paystackWebhook");

// Apply routes
app.use("/api/tokens", tokenRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

// Webhook endpoint (no rate limit)
app.post("/webhook/paystack", handlePaystackWebhook);
```

## Step 5: Configure Security Middleware

Add the following security middleware to your Express app:

```javascript
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");

// Security middleware
app.use(helmet()); // Add security headers

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  }
});

// Apply rate limiting to all routes except webhooks
app.use(/^(?!\/webhook).+/, limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

## Step 6: Set Up Webhook Processing

Ensure your webhook processing is correctly configured:

```javascript
// Body parser configuration for webhook signature verification
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    // Raw body needed for webhook signature verification
    if (req.originalUrl.startsWith('/webhook')) {
      req.rawBody = buf;
    }
  }
}));
```

## Step 7: Configure Paystack Dashboard

1. Log in to your Paystack dashboard
2. Create payment plans:
   - Monthly plan: KES 1,200/month
   - Annual plan: KES 10,000/year
3. Configure webhook URL:
   - Go to Settings → API Keys & Webhooks → Webhooks
   - Add URL: `https://yourdomain.com/webhook/paystack`
   - Set secret key
   - Enable webhooks

## Step 8: Test the Integration

1. Test payment flow:
   ```bash
   node test-payment.js
   ```

2. Test token usage:
   ```bash
   node test-token-usage.js
   ```

3. Test webhooks using ngrok:
   ```bash
   ngrok http 5000
   ```
   Then set the webhook URL in Paystack dashboard to your ngrok URL

## Step 9: Integrate with Frontend

1. Add Paystack checkout to your frontend:

```javascript
// Example with React
import { usePaystackPayment } from 'react-paystack';

const config = {
  reference: (new Date()).getTime().toString(),
  email: user.email,
  amount: planPrice * 100, // in kobo
  publicKey: 'your_public_key',
  metadata: {
    userId: user.id,
    plan: selectedPlan
  }
};

const onSuccess = (reference) => {
  // Handle success
};

const onClose = () => {
  // Handle closure
};

const initializePayment = usePaystackPayment(config);

// In your component
<button onClick={() => initializePayment(onSuccess, onClose)}>Pay</button>
```

2. Create UI for token usage tracking:
   - Display current token usage
   - Show remaining tokens
   - Visualize usage with charts

## Step 10: Add Error Handling and Monitoring

1. Implement global error handler
2. Set up logging for payment events
3. Monitor webhook deliveries
4. Create alert system for failed payments

## Troubleshooting

### Webhook Not Receiving Events
- Verify webhook URL is correctly set in Paystack dashboard
- Check webhook signature verification is working
- Ensure your server is publicly accessible

### Payment Not Being Processed
- Check Paystack API keys are correct
- Verify metadata is being sent correctly
- Check logs for any payment processing errors

### Token Usage Not Updating
- Verify token update route is working correctly
- Check database connection
- Ensure user ID is being passed correctly

## Additional Resources

- [Paystack API Documentation](https://paystack.com/docs/api)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

For further assistance, please create an issue on the GitHub repository. 