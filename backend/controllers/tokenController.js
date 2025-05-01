const { sendTokenLimitAlert } = require("../utils/emailService");

const notifyIfNearLimit = async (req, res) => {
  const user = req.user;
  const usage = (user.tokensUsed / user.tokenLimit) * 100;

  if (usage >= 90) {
    await sendTokenLimitAlert(user.email);
  }

  res.status(200).json({ message: "Token usage recorded", tokensUsed: user.tokensUsed });
};

module.exports = { notifyIfNearLimit }; 