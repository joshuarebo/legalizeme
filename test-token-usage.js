const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:5000';

// Connect to MongoDB
async function setupTestUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Import the User model
    const User = require('./backend/models/User');
    
    // Create a test user if it doesn't exist
    console.log('👤 Creating test user...');
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      testUser = new User({
        email: 'test@example.com',
        tokenLimit: 150000,
        tokensUsed: 0
      });
      await testUser.save();
    } else {
      // Reset tokens for testing
      testUser.tokensUsed = 0;
      await testUser.save();
    }
    
    console.log('✅ Test user ready:', testUser._id.toString());
    return testUser._id.toString();
  } catch (error) {
    console.error('❌ Test user setup failed:', error);
    process.exit(1);
  }
}

async function testTokenUsage(userId) {
  try {
    // Test payload
    const tokenUsageData = {
      userId: userId,
      tokensToUse: 10000
    };
    
    console.log(`\n💸 Testing token usage with ${tokenUsageData.tokensToUse} tokens...`);
    const response = await axios.post(`${API_URL}/api/tokens/use-tokens`, tokenUsageData);
    
    console.log('✅ Token usage result:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Token usage test failed:', error.response ? error.response.data : error.message);
  }
}

async function testTokenLimitExceeded(userId) {
  try {
    // This should exceed the token limit
    const tokenUsageData = {
      userId: userId,
      tokensToUse: 200000 // Exceeds the 150,000 limit
    };
    
    console.log(`\n🚨 Testing token limit exceeded with ${tokenUsageData.tokensToUse} tokens...`);
    const response = await axios.post(`${API_URL}/api/tokens/use-tokens`, tokenUsageData);
    
    console.log('❓ Unexpected success:', response.data);
  } catch (error) {
    console.log('✅ Expected error received:', error.response.data);
  }
}

async function checkCurrentUsage(userId) {
  try {
    // Import the User model
    const User = require('./backend/models/User');
    
    const user = await User.findById(userId);
    console.log('\n📊 Current token usage:', user.tokensUsed, '/', user.tokenLimit);
  } catch (error) {
    console.error('❌ Error checking usage:', error);
  }
}

async function runTest() {
  console.log('🚀 Starting token usage test...\n');
  
  // Step 1: Setup test user and get ID
  const userId = await setupTestUser();
  
  // Step 2: Check initial usage
  await checkCurrentUsage(userId);
  
  // Step 3: Test token usage 
  await testTokenUsage(userId);
  
  // Step 4: Check updated usage
  await checkCurrentUsage(userId);
  
  // Step 5: Test token limit exceeded
  await testTokenLimitExceeded(userId);
  
  // Step 6: Final usage check
  await checkCurrentUsage(userId);
  
  // Clean up
  console.log('\n🧹 Cleaning up...');
  await mongoose.connection.close();
  
  console.log('\n🎉 Token usage tests completed!');
}

// Run the test
runTest(); 