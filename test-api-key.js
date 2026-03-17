// Simple API key test
const apiKey = 're_Vg1aNzzu_4YHvgi2HrYtocpbURnaEQ4zP';

console.log('🧪 Testing your Resend API key...');
console.log('📝 API Key:', apiKey.substring(0, 10) + '...');
console.log('🔗 Endpoint: https://api.resend.com/emails');

// Test with fetch
fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'onboarding@resend.dev', // Use Resend's verified domain
    to: ['nicholasmbaluka05@gmail.com'],
    subject: 'Test Email from CreateHub 🧪',
    html: '<div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; border-radius: 10px;"><h2 style="color: #667eea;">Test Email</h2><p>This is a test email from your CreateHub platform!</p><p>Your Resend API key is working correctly! 🎉</p></div>'
  })
})
.then(response => response.json())
.then(data => {
  if (data.id) {
    console.log('✅ SUCCESS! Email sent via Resend API');
    console.log('📬 Email ID:', data.id);
    console.log('📬 Check your inbox for: nicholasmbaluka05@gmail.com');
  } else {
    console.log('❌ FAILED: Email not sent');
    console.log('🚨 Error:', data);
  }
})
.catch(error => {
  console.error('❌ Network Error:', error.message);
});
