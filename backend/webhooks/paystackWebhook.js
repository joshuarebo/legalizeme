// webhooks/paystackWebhook.js
const crypto = require('crypto');
const { assignTokens, assignPlan } = require('../utils/tokenManager');
const User = require('../models/User');

/**
 * Record a new subscription in the database
 */
const recordSubscription = async (data) => {
  try {
    const { customer, plan } = data;
    
    // Find user by email
    const user = await User.findOne({ email: customer.email });
    
    if (!user) {
      console.error(`User not found for subscription: ${customer.email}`);
      return;
    }
    
    // Map the plan code to plan type 
    let planType = 'monthly'; // default
    
    // Determine plan type from plan code or amount
    // This is an example - adjust based on your Paystack plan codes
    if (plan && plan.name) {
      if (plan.name.toLowerCase().includes('annual') || 
          plan.name.toLowerCase().includes('yearly') || 
          plan.interval === 'annually') {
        planType = 'yearly';
      }
    }
    
    // Update user with subscription info
    user.subscriptionId = data.id;
    user.subscriptionStatus = 'active';
    user.subscriptionPlan = planType;
    user.subscriptionStart = new Date();
    user.subscriptionEnd = new Date();
    
    // Set end date based on plan type
    if (planType === 'yearly') {
      user.subscriptionEnd.setFullYear(user.subscriptionEnd.getFullYear() + 1);
    } else {
      user.subscriptionEnd.setMonth(user.subscriptionEnd.getMonth() + 1);
    }
    
    await user.save();
    
    // Assign plan tokens
    await assignPlan(user._id, planType);
    
    console.log(`Subscription recorded for ${customer.email}, plan: ${planType}`);
  } catch (error) {
    console.error('Error recording subscription:', error);
  }
};

/**
 * Handle subscription cancellation or expiration
 */
const handleSubscriptionEnd = async (data) => {
  try {
    const { customer } = data;
    
    // Find user by email
    const user = await User.findOne({ email: customer.email });
    
    if (!user) {
      console.error(`User not found for subscription cancellation: ${customer.email}`);
      return;
    }
    
    // Update user subscription status
    user.subscriptionStatus = 'inactive';
    await user.save();
    
    console.log(`Subscription ended for ${customer.email}`);
  } catch (error) {
    console.error('Error handling subscription end:', error);
  }
};

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
        // New subscription created
        console.log('New subscription created');
        recordSubscription(event.data)
          .then(() => console.log('Subscription recorded successfully'))
          .catch(error => console.error('Subscription recording error:', error));
        break;
        
      case 'subscription.disable':
        // Subscription cancelled or ended
        console.log('Subscription disabled');
        handleSubscriptionEnd(event.data)
          .then(() => console.log('Subscription end processed'))
          .catch(error => console.error('Subscription end processing error:', error));
        break;
        
      case 'invoice.payment_failed':
        // Payment failed for subscription
        console.log('Invoice payment failed');
        if (event.data && event.data.customer) {
          // You could notify the user about the failed payment
          console.log(`Payment failed for customer: ${event.data.customer.email}`);
        }
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