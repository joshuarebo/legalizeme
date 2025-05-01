const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  tokenLimit: { type: Number, default: 1000000 }, // 1M tokens/month
  tokensUsed: { type: Number, default: 0 },
  resetDate: { type: Date, default: () => new Date(new Date().setDate(1)) }, // resets monthly
  
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
    request: String  // Brief description or ID of the request
  }],
  
  // User created date
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to handle reset logic
userSchema.pre('save', function(next) {
  const now = new Date();
  // If current month is different from reset date month, reset tokens
  if (now.getMonth() !== this.resetDate.getMonth()) {
    this.tokensUsed = 0;
    this.resetDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
  }
  next();
});

// Method to check subscription status
userSchema.methods.hasActiveSubscription = function() {
  if (this.subscriptionStatus !== 'active') return false;
  
  const now = new Date();
  return this.subscriptionEnd && this.subscriptionEnd > now;
};

// Method to record token usage
userSchema.methods.recordTokenUsage = async function(tokens, requestInfo) {
  this.tokensUsed += tokens;
  
  // Add to usage history
  this.usageHistory.push({
    tokens,
    date: new Date(),
    request: requestInfo || 'AI request'
  });
  
  return this.save();
};

// Method to record payment
userSchema.methods.recordPayment = async function(paymentData) {
  this.paymentHistory.push({
    reference: paymentData.reference,
    amount: paymentData.amount,
    date: new Date(),
    status: paymentData.status,
    plan: paymentData.plan
  });
  
  return this.save();
};

module.exports = mongoose.model("User", userSchema); 