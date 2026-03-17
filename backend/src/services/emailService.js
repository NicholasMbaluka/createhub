const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const emailTemplates = {
  welcome: (firstName, lastName) => ({
    subject: 'Welcome to CreateHub! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">Welcome to CreateHub!</h1>
          <p style="margin: 10px 0 0; font-size: 18px;">Your Creator Economy Platform</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 40px 20px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName} ${lastName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining CreateHub! Your creator account is now ready to start monetizing your content.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>✅ Complete your profile</li>
              <li>✅ Set up your payment methods</li>
              <li>✅ Create your first product</li>
              <li>✅ Start earning from your content</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            If you have any questions, reply to this email or visit our help center.
          </p>
        </div>
      </div>
    `
  }),

  passwordReset: (resetToken) => ({
    subject: 'Reset Your CreateHub Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">Password Reset</h1>
          <p style="margin: 10px 0 0; font-size: 18px;">CreateHub Security</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 40px 20px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to set a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            This link expires in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `
  }),

  kycApproved: (firstName) => ({
    subject: 'KYC Verification Approved! ✅',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #28a745; color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">KYC Approved!</h1>
          <p style="margin: 10px 0 0; font-size: 18px;">Verification Complete</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 40px 20px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Congratulations ${firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your KYC verification has been approved. You now have full access to all creator features.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">New Features Available:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>✅ Higher transaction limits</li>
              <li>✅ Premium creator tools</li>
              <li>✅ Priority support</li>
              <li>✅ Advanced analytics</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Start Creating
            </a>
          </div>
        </div>
      </div>
    `
  }),

  orderConfirmation: (orderDetails) => ({
    subject: 'Order Confirmation - CreateHub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #667eea; color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">Order Confirmed!</h1>
          <p style="margin: 10px 0 0; font-size: 18px;">Thank you for your purchase</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 40px 20px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Order Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #666; margin-bottom: 10px;"><strong>Product:</strong> ${orderDetails.productName}</p>
            <p style="color: #666; margin-bottom: 10px;"><strong>Amount:</strong> $${orderDetails.amount}</p>
            <p style="color: #666; margin-bottom: 10px;"><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p style="color: #666; margin-bottom: 10px;"><strong>Date:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Order Details
            </a>
          </div>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](data);
    
    const { data: emailData, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [to],
      ...emailContent
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  emailTemplates
};
