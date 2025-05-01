const User = require("../models/User");

const checkTokenLimit = async (req, res, next) => {
  const { userId, tokensToUse } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const now = new Date();
  if (now.getMonth() !== user.resetDate.getMonth()) {
    user.tokensUsed = 0;
    user.resetDate = now;
  }

  if (user.tokensUsed + tokensToUse > user.tokenLimit) {
    return res.status(403).json({ error: "Token limit exceeded" });
  }

  user.tokensUsed += tokensToUse;
  await user.save();

  req.user = user;
  next();
};

module.exports = checkTokenLimit; 