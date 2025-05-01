# LegalizeMe Payment & Token Management System

## Project Overview

This repository contains a complete payment integration with Paystack along with an advanced token management system for tracking and limiting user token usage. The implementation follows industry best practices for security, error handling, and maintainability.

**Repository URL:** [github.com/joshuarebo/legalizeme](https://github.com/joshuarebo/legalizeme)

## Core Components

The system consists of three main components:

1. **Payment Processing System** - Handles payment initialization, verification, and webhooks
2. **Token Management System** - Tracks and enforces token usage limits
3. **Admin Dashboard Backend** - Provides statistics and user management capabilities

## Technical Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Payment Gateway**: Paystack
- **Security**: Helmet, CORS, rate limiting, signature verification
- **AI Integration**: Middleware for token tracking during AI requests

## Implemented Features

### 1. 🧠 AI Engine Connection

- AI middleware for token tracking during API requests
- Token usage estimation and recording based on prompt length
- Model-specific token calculations (e.g., GPT-4, GPT-3.5)
- Automatic token limit enforcement with proper error handling

```javascript
// Example AI request with token tracking
POST /api/ai/process
{
  "userId": "user_id",
  "prompt": "Your AI prompt here",
  "model": "gpt-4" // optional, defaults to gpt-3.5-turbo
}
```

### 2. 📊 Admin Dashboard Backend

- Admin routes and controllers for usage tracking
- Paginated user management endpoints with filtering
- System-wide statistics reporting (usage, subscriptions, etc.)
- Subscription management functionality

```javascript
// Example API endpoints
GET /api/admin/users          // List all users with pagination and filtering
GET /api/admin/users/:userId  // Get detailed user information
GET /api/admin/stats          // Get system-wide statistics
PUT /api/admin/users/:userId/subscription  // Update user subscription
```

### 3. 🔁 Auto-Renewal Implementation

- Enhanced webhook handler to process subscription events
- Support for subscription creation, renewal, and cancellation
- User model with subscription status tracking
- Comprehensive subscription lifecycle management

### 4. 📩 Enhanced Webhook Handling

- Webhook signature verification for security
- Support for multiple Paystack event types
- Robust error handling for webhook processors
- Handlers for payment and subscription events

```javascript
// Webhook endpoint
POST /webhook/paystack

// Supported event types
- charge.success
- subscription.create
- subscription.disable
- invoice.payment_failed
```

## Integration Instructions

For your team to integrate this system into your existing codebase:

1. Follow the detailed integration guide in [INTEGRATION.md](INTEGRATION.md)
2. Replace the placeholder API keys with your actual Paystack credentials
3. Adapt the database models as needed for your existing database schema
4. Integrate the payment and token routes into your existing Express application

The system is designed to be modular, allowing your team to pick and choose the components they need while maintaining the security and reliability of the payment processing and token management features.

## What Your Team Still Needs to Do

### 1. Frontend Implementation

- Create user dashboard for subscription management
- Build payment flow UI with Paystack integration
- Design token usage visualization (charts, graphs, etc.)
- Develop admin dashboard interface

### 2. Paystack Configuration

- Set up your Paystack dashboard with live credentials
- Configure webhooks with your production URL (`https://www.legalizeme.site/webhook/paystack`)
- Create payment plans in Paystack dashboard:
  - KES 1,200/month
  - KES 10,000/year

### 3. Environment Configuration

- Update `.env` with your actual API keys and credentials:
  ```
  PAYSTACK_SECRET_KEY=your_actual_secret_key
  PAYSTACK_PUBLIC_KEY=your_actual_public_key
  MONGO_URI=your_mongodb_connection_string
  EMAIL_FROM=your_notification_email
  EMAIL_PASSWORD=your_email_password
  OPENAI_API_KEY=your_openai_api_key
  ```

## Testing the Implementation

Use the provided test scripts:

- `node test-payment.js` - Test the payment flow
- `node test-token-usage.js` - Test the token management system

For webhook testing:
1. Use a tool like [ngrok](https://ngrok.com/) to expose your local server
2. Set the webhook URL in Paystack dashboard to your ngrok URL
3. Make a test payment to verify webhook delivery

## Directory Structure

```
backend/
├── controllers/     # Request handlers
│   ├── adminController.js
│   ├── aiController.js
│   ├── paymentController.js
│   └── tokenController.js
├── middleware/      # Express middleware
│   ├── aiMiddleware.js
│   └── checkTokenLimit.js
├── models/          # Mongoose models
│   └── User.js
├── routes/          # API routes
│   ├── adminRoutes.js
│   ├── aiRoutes.js
│   ├── paymentRoutes.js
│   └── tokenRoutes.js
├── utils/           # Utility functions
│   ├── emailService.js
│   └── tokenManager.js
├── webhooks/        # Webhook handlers
│   └── paystackWebhook.js
├── app.js           # Express app setup
└── server.js        # HTTP server initialization
```

## Documentation

- **IMPLEMENTATION-STATUS.md** - Detailed overview of implementation status
- **INTEGRATION.md** - Step-by-step integration guide
- **README.md** - Project overview and installation instructions

## Security Considerations

- API keys are stored securely in environment variables
- Rate limiting is implemented to prevent abuse
- Webhook signatures are verified to ensure authenticity
- Input validation is performed on all endpoints
- CORS is configured to restrict access to trusted domains

## Next Steps

1. Clone the repository and explore the codebase
2. Run the test scripts to understand the payment and token flow
3. Set up your Paystack dashboard and configure webhooks
4. Begin frontend implementation while using the provided API endpoints

For any questions or assistance, please create an issue on the GitHub repository. 