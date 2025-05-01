const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_URL = 'http://localhost:5000';

// Test data
const testPaymentData = {
  email: 'test@example.com',
  amount: 1200, // ₦1,200 for monthly plan
  userId: '123456',
  plan: 'monthly'
};

async function initializePayment() {
  try {
    console.log('💰 Initializing payment with test data:', testPaymentData);
    const response = await axios.post(`${API_URL}/api/payment/pay`, testPaymentData);
    
    console.log('\n✅ Payment initialization successful!');
    console.log('🔗 Payment URL:', response.data.data.authorization_url);
    console.log('📝 Reference:', response.data.data.reference);
    
    return response.data.data.reference;
  } catch (error) {
    console.error('❌ Payment initialization failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

async function verifyPayment(reference) {
  try {
    console.log(`\n🔍 Verifying payment with reference: ${reference}`);
    const response = await axios.get(`${API_URL}/api/payment/verify?reference=${reference}`);
    
    console.log('\n✅ Payment verification result:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Payment verification failed:', error.response ? error.response.data : error.message);
  }
}

async function runTest() {
  // Step 1: Initialize payment
  const reference = await initializePayment();
  
  // Step 2: Prompt user to complete payment
  console.log('\n⏳ Please follow the payment URL in your browser to complete the test payment');
  console.log('💡 You can use the Paystack test card: 5060 6666 6666 6666 660, CVV: 123, Date: Any future date, PIN: 1234, OTP: 123456');
  
  // Wait for user to confirm payment completion
  await new Promise((resolve) => {
    rl.question('\n🤔 Have you completed the payment? (yes/no): ', (answer) => {
      if (answer.toLowerCase() === 'yes') {
        resolve();
      } else {
        console.log('❌ Test aborted. You need to complete the payment to verify the integration.');
        process.exit(0);
      }
    });
  });
  
  // Step 3: Verify payment
  await verifyPayment(reference);
  
  rl.close();
  console.log('\n🎉 Test completed! If all steps passed, your Paystack integration is working correctly.');
}

// Run the test
runTest(); 