// controllers/paymentController.js
require('dotenv').config();
const axios = require('axios');
const { assignTokens } = require('../utils/tokenManager');

/**
 * Initialize payment with Paystack
 */
exports.initializePayment = async (req, res) => {
  const { email, amount, userId, plan } = req.body;

  // Input validation
  if (!email || !amount || !userId || !plan) {
    return res.status(400).json({ 
      error: "Missing required fields", 
      required: ["email", "amount", "userId", "plan"] 
    });
  }

  // Validate plan type
  if (!['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({ error: "Invalid plan type. Use 'monthly' or 'yearly'" });
  }

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo and ensure integer
        metadata: { 
          userId, 
          plan,
          custom_fields: [
            {
              display_name: "Plan Type",
              variable_name: "plan_type",
              value: plan
            }
          ]
        },
        callback_url: process.env.PAYMENT_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/payment/callback`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Payment initialization error:', error.message);
    
    // Structured error response
    res.status(500).json({ 
      error: "Payment initialization failed", 
      details: error.response ? error.response.data : error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Verify payment using reference
 */
exports.verifyPayment = async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ error: "Reference parameter is required" });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    const { status, metadata } = response.data.data;
    
    if (status === 'success') {
      try {
        await assignTokens(metadata.userId, metadata.plan);
        return res.status(200).json({ 
          message: 'Payment verified & tokens assigned',
          transaction: {
            reference,
            status,
            plan: metadata.plan
          }
        });
      } catch (tokenError) {
        console.error('Token assignment error:', tokenError);
        return res.status(500).json({ 
          error: "Payment verified but token assignment failed",
          message: tokenError.message
        });
      }
    }

    res.status(400).json({ 
      message: 'Payment failed or incomplete',
      status: status
    });
  } catch (error) {
    console.error('Payment verification error:', error.message);
    res.status(500).json({ 
      error: "Payment verification failed", 
      details: error.response ? error.response.data : error.message,
      timestamp: new Date().toISOString()
    });
  }
}; 