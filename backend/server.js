// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/paymentRoutes');
const { handlePaystackWebhook } = require('./webhooks/paystackWebhook');
const app = require("./app");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 