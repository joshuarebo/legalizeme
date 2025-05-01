# Integration Guide for LegalizeMe Payment System

This guide provides detailed instructions for your development team to integrate the LegalizeMe payment and token management system into your existing applications.

## Overview

The LegalizeMe payment system consists of two main components:

1. **Paystack Payment Integration**: Handles payment processing, verification, and webhooks
2. **Token Management System**: Tracks and limits user token usage based on their subscription plan

## Prerequisites

Before integration, ensure your team has:

- Access to a Paystack account (for live payments)
- MongoDB database (or ability to adapt the models to your existing database)
- Node.js environment with Express.js
- Environment variable management system

## Step 1: Copy Required Files

Copy these essential components from the repository to your existing project:

### Payment Integration Files

- `backend/controllers/paymentController.js` → Payment initialization and verification
- `backend/routes/paymentRoutes.js` → API endpoints for payment operations
- `backend/webhooks/paystackWebhook.js` → Webhook handler for Paystack events

### Token Management Files

- `backend/models/User.js` → Database model for user token tracking
- `backend/middleware/checkTokenLimit.js` → Middleware to enforce token limits
- `backend/utils/tokenManager.js` → Utilities for token allocation
- `backend/controllers/tokenController.js` → Controllers for token operations
- `backend/routes/tokenRoutes.js` → API endpoints for token management

## Step 2: Configure Environment Variables

Add these environment variables to your existing configuration:

```
# Paystack API Keys
PAYSTACK_SECRET_KEY=your_live_secret_key
PAYSTACK_PUBLIC_KEY=your_live_public_key

# Payment settings
PAYMENT_CALLBACK_URL=https://your-domain.com/payment/success
VERIFY_WEBHOOK_SIGNATURE=true

# Security settings (adjust as needed)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CORS_ORIGIN=https://your-frontend-domain.com
```

## Step 3: Database Integration

If you're using MongoDB, you can use the User model as provided. If you're using a different database:

1. Adapt the `User.js` model to your existing database schema
2. Ensure your user model includes these fields:
   - `tokenLimit` (Number): Maximum tokens the user can use
   - `tokensUsed` (Number): Current token usage
   - `resetDate` (Date): When the token count resets

Example SQL schema:
```sql
ALTER TABLE users
ADD COLUMN token_limit INTEGER DEFAULT 1000000,
ADD COLUMN tokens_used INTEGER DEFAULT 0,
ADD COLUMN reset_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

## Step 4: Integration with Express.js

Add these routes to your existing Express application:

```javascript
// Import the routes
const paymentRoutes = require('./path/to/paymentRoutes');
const tokenRoutes = require('./path/to/tokenRoutes');
const { handlePaystackWebhook } = require('./path/to/paystackWebhook');

// Add security middleware if not already present
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
app.use(helmet());

// Configure rate limiting (except for webhooks)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100
});
app.use(/^(?!\/webhook).+/, limiter);

// Mount the routes
app.use("/api/payment", paymentRoutes);
app.use("/api/tokens", tokenRoutes);
app.post("/webhook/paystack", handlePaystackWebhook);
```

## Step 5: Frontend Integration

To integrate with your frontend application:

1. **Payment Initialization**:
   ```javascript
   // Example React code
   const initiatePayment = async (email, amount, userId, plan) => {
     try {
       const response = await axios.post('/api/payment/pay', {
         email,
         amount,
         userId,
         plan // 'monthly' or 'yearly'
       });
       
       // Redirect to Paystack checkout
       window.location.href = response.data.data.authorization_url;
     } catch (error) {
       console.error('Payment initialization failed:', error);
     }
   };
   ```

2. **Payment Verification**:
   ```javascript
   // Example callback page component
   useEffect(() => {
     const verifyPayment = async () => {
       const urlParams = new URLSearchParams(window.location.search);
       const reference = urlParams.get('reference');
       
       if (reference) {
         try {
           const response = await axios.get(`/api/payment/verify?reference=${reference}`);
           if (response.data.message === 'Payment verified & tokens assigned') {
             // Show success message
           }
         } catch (error) {
           // Handle verification error
         }
       }
     };
     
     verifyPayment();
   }, []);
   ```

3. **Token Usage Tracking**:
   ```javascript
   // Example token usage function
   const useTokens = async (userId, tokensToUse) => {
     try {
       const response = await axios.post('/api/tokens/use-tokens', {
         userId,
         tokensToUse
       });
       return response.data;
     } catch (error) {
       if (error.response && error.response.status === 403) {
         // Token limit exceeded
         return { error: 'Token limit exceeded', shouldUpgrade: true };
       }
       return { error: 'Failed to use tokens' };
     }
   };
   ```

## Step 6: Configuring Paystack

1. Log in to your Paystack dashboard at [paystack.com](https://paystack.com)
2. Navigate to Settings → API Keys & Webhooks
3. Copy your live keys and add them to your environment variables
4. Set up a webhook for payment events:
   - URL: `https://your-domain.com/webhook/paystack`
   - Events to receive: `charge.success`, `subscription.create`, `subscription.disable`

## Step 7: Testing the Integration

1. Make a small test payment with your Paystack test keys
2. Verify the payment is recorded correctly
3. Check that tokens are assigned to the user
4. Test token usage and limits

## Common Integration Issues

1. **Cross-Origin (CORS) Issues**: Ensure your backend allows requests from your frontend domain
2. **Webhook Not Receiving Events**: Verify the webhook URL is accessible from the internet
3. **Token Limits Not Enforced**: Check database integration for the user model fields
4. **Payment Verification Fails**: Ensure the correct Paystack secret key is configured

## Technical Support

If your team encounters any issues during integration, please refer to:

- Repository: [github.com/joshuarebo/legalizeme](https://github.com/joshuarebo/legalizeme)
- Create an issue on GitHub for technical assistance

## Production Considerations

1. **Security**: Ensure Paystack API keys are stored securely
2. **Logging**: Implement comprehensive logging for payment events
3. **Monitoring**: Set up alerts for failed payments and webhook errors
4. **Backups**: Regularly backup your token usage data
5. **Testing**: Thoroughly test with Paystack test mode before going live 