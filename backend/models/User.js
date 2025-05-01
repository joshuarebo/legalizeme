const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  tokenLimit: { type: Number, default: 1000000 }, // 1M tokens/month
  tokensUsed: { type: Number, default: 0 },
  resetDate: { type: Date, default: () => new Date(new Date().setDate(1)) }, // resets monthly
});

module.exports = mongoose.model("User", userSchema); 