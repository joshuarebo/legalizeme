# LegalizeMe Payment and Token Management System

This system implements a complete payment integration with Paystack and a robust token management system for tracking and limiting user token usage. The codebase follows industry best practices for security, error handling, and maintainability.

## Repository

The official repository for this project is available at [github.com/joshuarebo/legalizeme](https://github.com/joshuarebo/legalizeme)

## Features

- **Paystack Payment Integration**: Secure payment processing with Paystack
- **Token Management**: Monitor and limit token usage per user
- **Webhook Support**: Handle payment events via secure webhooks
- **Robust Error Handling**: Comprehensive error handling throughout the application
- **Security**: Rate limiting, secure headers, and CORS protection
- **Email Notifications**: Alert users when approaching token limits

## Integration Guide for Existing Projects

This codebase is designed to be easily integrated into your existing applications. Follow these steps to incorporate the payment processing and token management features:

### 1. Essential Files to Copy

Copy these key components to your existing project:

- **Payment Integration**: 
  - `backend/controllers/paymentController.js`
  - `backend/routes/paymentRoutes.js`
  - `backend/webhooks/paystackWebhook.js`

- **Token Management**:
  - `backend/models/User.js` (or adapt to your existing user model)
  - `backend/middleware/checkTokenLimit.js`
  - `backend/utils/tokenManager.js`
  - `backend/controllers/tokenController.js`
  - `backend/routes/tokenRoutes.js`

### 2. Configuration

1. **Environment Variables**: Add these variables to your existing `.env` file:
   ```
   # Paystack Live Credentials (replace with your actual production keys)
   PAYSTACK_SECRET_KEY=your_secret_key_here
   PAYSTACK_PUBLIC_KEY=your_public_key_here
   
   # Your application's payment callback URL
   PAYMENT_CALLBACK_URL=https://your-production-domain.com/payment/callback
   
   # Security settings
   VERIFY_WEBHOOK_SIGNATURE=true
   ```

2. **Database Integration**:
   - If using a different database system, adapt the MongoDB models in `User.js` to your existing database schema
   - Ensure your database has fields for tracking token limits, usage, and reset dates

3. **Route Integration**:
   ```javascript
   // In your main Express app file
   const paymentRoutes = require('./path/to/paymentRoutes');
   const tokenRoutes = require('./path/to/tokenRoutes');
   const { handlePaystackWebhook } = require('./path/to/paystackWebhook');
   
   // Mount the routes
   app.use("/api/payment", paymentRoutes);
   app.use("/api/tokens", tokenRoutes);
   app.post("/webhook/paystack", handlePaystackWebhook);
   ```

### 3. Paystack Production Setup

1. **Create a Paystack Account**: If you haven't already, sign up/login at [paystack.com](https://paystack.com)

2. **Get Live Keys**:
   - Log in to your Paystack dashboard
   - Navigate to Settings → API Keys & Webhooks
   - Copy your live secret and public keys
   - Add them to your `.env` file

3. **Set Up Webhooks**:
   - In your Paystack dashboard, go to Settings → API Keys & Webhooks
   - Add a new webhook with your production URL: `https://your-domain.com/webhook/paystack`
   - Paystack will send payment events to this endpoint automatically

### 4. Testing After Integration

1. Make a small test payment using the production system
2. Verify that webhooks are being received
3. Confirm token allocation is working correctly

## Setup and Installation (Complete System)

### Prerequisites

- Node.js 14.x or higher
- MongoDB database
- Paystack account for payment processing

### Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/joshuarebo/legalizeme.git
   cd legalizeme
   npm install
   ```

2. Configure environment variables:
   Create/update the `.env` file in the `backend` directory with your credentials:
   ```
   # API keys
   PAYSTACK_SECRET_KEY=your_secret_key_here
   PAYSTACK_PUBLIC_KEY=your_public_key_here
   
   # Server config
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGO_URI=mongodb+srv://your_connection_string
   
   # Email
   EMAIL_FROM=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   
   # Payment settings
   PAYMENT_CALLBACK_URL=http://localhost:3000/payment/success
   VERIFY_WEBHOOK_SIGNATURE=true
   
   # Security
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   CORS_ORIGIN=http://localhost:3000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. For production:
   ```bash
   npm start
   ```

## Architecture

The application is structured following modern Node.js practices:

```
backend/
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Utility functions
├── webhooks/        # Webhook handlers
├── app.js           # Express app setup
└── server.js        # HTTP server initialization
```

## API Documentation

### Authentication

Authentication is required for all API endpoints except webhooks and health checks.

### Payment API

- `POST /api/payment/pay`: Initialize a payment
  ```json
  {
    "email": "user@example.com",
    "amount": 1200,
    "userId": "user_id",
    "plan": "monthly" // or "yearly"
  }
  ```

- `GET /api/payment/verify?reference=xyz123`: Verify a payment

### Token API

- `POST /api/tokens/use-tokens`: Record token usage
  ```json
  {
    "userId": "user_id",
    "tokensToUse": 5000
  }
  ```

## Webhooks

The system includes a Paystack webhook handler at:
`POST /webhook/paystack`

Webhook verification is enabled by default for security. When a payment event is received, it processes the event and updates user token allocations.

### Setting up webhooks in production

1. Create a webhook in your Paystack dashboard
2. Set the webhook URL to your production endpoint: `https://your-domain.com/webhook/paystack`
3. Ensure `VERIFY_WEBHOOK_SIGNATURE=true` in your environment variables

For local testing of webhooks, use a tool like [ngrok](https://ngrok.com/) to expose your local server to the internet.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request to the [GitHub repository](https://github.com/joshuarebo/legalizeme).

## Testing

### Automated Tests

Run the test suite:
```bash
npm test
```

### Manual Testing

#### Test the Paystack Payment Flow

```bash
node test-payment.js
```

This will:
1. Initialize a test payment
2. Provide a URL to complete the payment
3. Verify the payment status

During testing, use these Paystack test card details:
- Card Number: 5060 6666 6666 6666 660
- CVV: 123
- Expiry Date: Any future date
- PIN: 1234
- OTP: 123456

#### Test the Token Management System

```bash
node test-token-usage.js
```

This will:
1. Create a test user in the database
2. Test normal token usage
3. Test the token limit exceeded scenario
4. Show current token usage statistics

## Security Considerations

- API keys are stored securely in environment variables
- Rate limiting is implemented to prevent abuse
- Webhook signatures are verified to ensure authenticity
- Input validation is performed on all endpoints
- CORS is configured to restrict access to trusted domains
- Helmet adds security headers to prevent common attacks

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment variables
2. Use a process manager like PM2 to keep the application running
3. Set up proper error monitoring with a service like Sentry
4. Configure proper logging for production
5. Set up SSL/TLS for secure communications

## License

This project is licensed under the MIT License - see the LICENSE file for details. 