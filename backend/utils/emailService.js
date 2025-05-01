const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendTokenLimitAlert = async (to) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Token Limit Reached",
    html: "<p>You have used your monthly token allocation. Consider upgrading your plan.</p>",
  });
};

module.exports = { sendTokenLimitAlert }; 