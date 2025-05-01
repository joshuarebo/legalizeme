// webhooks/paystackWebhook.js
const crypto = require('crypto');
const { assignTokens } = require('../utils/tokenManager');

/**
 * Handle webhook events from Paystack
 * Includes signature verification for security
 */
exports.handlePaystackWebhook = (req, res) => {
  try {
    // Validate webhook signature (highly recommended for security)
    const signature = req.headers['x-paystack-signature'];
    
    if (process.env.VERIFY_WEBHOOK_SIGNATURE === 'true' && signature) {
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest('hex');
        
      if (hash !== signature) {
        console.error('Invalid webhook signature');
        return res.status(401).send('Invalid signature');
      }
    }
    
    const event = req.body;
    
    // Log webhook event type for monitoring
    console.log(`Received Paystack webhook: ${event.event}`);
    
    // Process based on event type
    switch (event.event) {
      case 'charge.success':
        if (event.data && event.data.metadata) {
          const { userId, plan } = event.data.metadata;
          
          if (!userId || !plan) {
            console.error('Missing required metadata in webhook payload');
            break;
          }
          
          console.log(`Processing successful payment for user ${userId}, plan: ${plan}`);
          assignTokens(userId, plan)
            .then(() => console.log(`Tokens assigned successfully to user ${userId}`))
            .catch(error => console.error('Token assignment error:', error));
        } else {
          console.error('Missing metadata in webhook payload');
        }
        break;
        
      case 'subscription.create':
      case 'subscription.disable':
      case 'invoice.payment_failed':
        // Handle other events as needed
        console.log(`Received ${event.event} event - not yet implemented`);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    // Always return 200 quickly to Paystack to acknowledge receipt
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to avoid Paystack retries, but log the error
    res.status(200).send('Webhook processed with errors');
  }
}; 