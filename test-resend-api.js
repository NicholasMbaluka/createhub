// Test Resend API - Run from project root
require('dotenv').config({ path: './backend/.env.development' });
const { sendEmail } = require('./backend/src/services/emailService');

async function testResendAPI() {
  console.log('🧪 Testing Resend API with your key...');
  console.log('📧 API Key:', process.env.RESEND_API_KEY ? '✅ Loaded' : '❌ Not found');
  console.log('📬 Sending test email to: nicholasmbaluka05@gmail.com');
  
  try {
    const result = await sendEmail(
      'nicholasmbaluka05@gmail.com',
      'welcome',
      { 
        firstName: 'Nicholas', 
        lastName: 'Baluka' 
      }
    );
    
    if (result.success) {
      console.log('✅ SUCCESS! Email sent via Resend API');
      console.log('📬 Check your inbox for the welcome email');
      console.log('🔑 Your API key is working correctly!');
      console.log('📊 Email ID:', result.data?.id);
    } else {
      console.log('❌ FAILED: Email not sent');
      console.log('🚨 Error:', result.error);
    }
  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

testResendAPI();
