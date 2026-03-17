// Stripe Service - Centralized Stripe operations
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  
  // Create payment intent
  static async createPaymentIntent(options) {
    const {
      amount,
      currency = 'usd',
      paymentMethodId,
      customerId,
      metadata = {},
      email
    } = options;
    
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        payment_method: paymentMethodId,
        customer: customerId,
        customer_email: email,
        metadata,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        confirmation_method: 'manual'
      });
      
      return {
        success: true,
        paymentIntent
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Confirm payment intent
  static async confirmPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      
      return {
        success: true,
        paymentIntent
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Retrieve payment intent
  static async retrievePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        paymentIntent
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Create refund
  static async createRefund(options) {
    const {
      paymentIntentId,
      amount,
      reason = 'requested_by_customer',
      metadata = {}
    } = options;
    
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
        reason,
        metadata
      });
      
      return {
        success: true,
        refund
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Create transfer for payouts
  static async createTransfer(options) {
    const {
      amount,
      destinationAccountId,
      metadata = {},
      transferGroup = null
    } = options;
    
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        destination: destinationAccountId,
        metadata,
        transfer_group: transferGroup
      });
      
      return {
        success: true,
        transfer
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Create customer
  static async createCustomer(options) {
    const {
      email,
      name,
      paymentMethodId,
      metadata = {}
    } = options;
    
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        payment_method: paymentMethodId,
        metadata
      });
      
      return {
        success: true,
        customer
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Attach payment method to customer
  static async attachPaymentMethod(paymentMethodId, customerId) {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(
        paymentMethodId,
        { customer: customerId }
      );
      
      return {
        success: true,
        paymentMethod
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Create setup intent for saved payment methods
  static async createSetupIntent(customerId) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        usage: 'off_session'
      });
      
      return {
        success: true,
        setupIntent
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Get customer payment methods
  static async getCustomerPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });
      
      return {
        success: true,
        paymentMethods: paymentMethods.data
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Create Connect account for creators
  static async createConnectAccount(options) {
    const {
      email,
      country = 'US',
      type = 'express',
      capabilities = ['card_payments', 'transfers'],
      businessType = 'individual'
    } = options;
    
    try {
      const account = await stripe.accounts.create({
        type,
        country,
        email,
        capabilities,
        business_type: businessType
      });
      
      return {
        success: true,
        account
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Create account link for onboarding
  static async createAccountLink(accountId, options = {}) {
    const {
      returnUrl = `${process.env.FRONTEND_URL}/dashboard`,
      refreshUrl = `${process.env.FRONTEND_URL}/settings/payouts`,
      type = 'account_onboarding'
    } = options;
    
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type
      });
      
      return {
        success: true,
        accountLink
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Handle webhook events
  static async constructWebhookEvent(payload, signature, secret) {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, secret);
      
      return {
        success: true,
        event
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Calculate fees
  static calculateFees(amount) {
    const stripeFee = (amount * 0.029) + 0.30; // 2.9% + $0.30
    const platformFee = 0; // No commission in your system
    const totalFee = stripeFee + platformFee;
    const netAmount = amount - totalFee;
    
    return {
      grossAmount: amount,
      stripeFee,
      platformFee,
      totalFee,
      netAmount,
      feePercentage: (totalFee / amount) * 100
    };
  }
  
  // Validate payment method
  static validatePaymentMethod(paymentMethod) {
    const requiredFields = ['id', 'type', 'card'];
    
    for (const field of requiredFields) {
      if (!paymentMethod[field]) {
        return {
          valid: false,
          error: `Missing required field: ${field}`
        };
      }
    }
    
    // Check card expiration
    if (paymentMethod.card) {
      const { exp_month, exp_year } = paymentMethod.card;
      const now = new Date();
      const expiration = new Date(exp_year, exp_month - 1);
      
      if (expiration < now) {
        return {
          valid: false,
          error: 'Card has expired'
        };
      }
    }
    
    return {
      valid: true
    };
  }
}

module.exports = StripeService;
