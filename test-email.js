// Quick email test script
const { sendEmail } = require('./backend/src/services/emailService');

async function testEmail() {
  console.log('🧪 Testing Resend email integration...');
  
  try {
    const result = await sendEmail(
      'nicholasmbaluka05@gmail.com', // Your email for testing
      'welcome',
      { 
        firstName: 'Nicholas', 
        lastName: 'Baluka' 
      }
    );
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Check your inbox for the welcome email');
    } else {
      console.log('❌ Email failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run test if you have the API key
if (process.env.RESEND_API_KEY) {
  testEmail();
} else {
  console.log('⚠️  Please set RESEND_API_KEY environment variable first');
}
