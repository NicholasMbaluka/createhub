// Lemon Squeezy Service - Centralized payment processing
const axios = require('axios');
const crypto = require('crypto');

class LemonSqueezyService {
  
  constructor() {
    this.apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    this.webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    this.baseURL = 'https://api.lemonsqueezy.com/v1';
    this.storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }
  
  // Create checkout for creator platform subscription
  async createCreatorSubscriptionCheckout(planId, creatorEmail, creatorId) {
    try {
      const response = await this.client.post('/checkouts', {
        data: {
          type: 'checkouts',
          attributes: {
            store_id: this.storeId,
            variant_id: planId,
            customer_email: creatorEmail,
            product_options: {
              redirect_url: `${process.env.FRONTEND_URL}/dashboard`,
              receipt_button_text: 'Go to Dashboard',
              receipt_link_url: `${process.env.FRONTEND_URL}/dashboard`
            },
            checkout_data: {
              email: creatorEmail,
              custom: {
                creator_id: creatorId,
                type: 'creator_subscription'
              }
            }
          }
        }
      });
      
      return {
        success: true,
        checkoutUrl: response.data.data.attributes.checkout_url,
        checkoutId: response.data.data.id
      };
      
    } catch (error) {
      console.error('Lemon Squeezy checkout creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.detail || 'Failed to create checkout'
      };
    }
  }
  
  // Create checkout for customer creator subscription
  async createCustomerSubscriptionCheckout(variantId, customerEmail, creatorId, customerId) {
    try {
      const response = await this.client.post('/checkouts', {
        data: {
          type: 'checkouts',
          attributes: {
            store_id: this.storeId,
            variant_id: variantId,
            customer_email: customerEmail,
            product_options: {
              redirect_url: `${process.env.FRONTEND_URL}/c/${creatorId}`,
              receipt_button_text: 'View Creator Page',
              receipt_link_url: `${process.env.FRONTEND_URL}/c/${creatorId}`
            },
            checkout_data: {
              email: customerEmail,
              custom: {
                creator_id: creatorId,
                customer_id: customerId,
                type: 'customer_subscription'
              }
            }
          }
        }
      });
      
      return {
        success: true,
        checkoutUrl: response.data.data.attributes.checkout_url,
        checkoutId: response.data.data.id
      };
      
    } catch (error) {
      console.error('Lemon Squeezy customer subscription checkout error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.detail || 'Failed to create checkout'
      };
    }
  }
  
  // Create checkout for product purchase
  async createProductCheckout(variantId, customerEmail, creatorId, customerId, productId) {
    try {
      const response = await this.client.post('/checkouts', {
        data: {
          type: 'checkouts',
          attributes: {
            store_id: this.storeId,
            variant_id: variantId,
            customer_email: customerEmail,
            product_options: {
              redirect_url: `${process.env.FRONTEND_URL}/library`,
              receipt_button_text: 'View Library',
              receipt_link_url: `${process.env.FRONTEND_URL}/library`
            },
            checkout_data: {
              email: customerEmail,
              custom: {
                creator_id: creatorId,
                customer_id: customerId,
                product_id: productId,
                type: 'product_purchase'
              }
            }
          }
        }
      });
      
      return {
        success: true,
        checkoutUrl: response.data.data.attributes.checkout_url,
        checkoutId: response.data.data.id
      };
      
    } catch (error) {
      console.error('Lemon Squeezy product checkout error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.detail || 'Failed to create checkout'
      };
    }
  }
  
  // Create product via API (for creator product automation)
  async createProduct(productData) {
    try {
      const response = await this.client.post('/products', {
        data: {
          type: 'products',
          attributes: {
            store_id: this.storeId,
            name: productData.name,
            description: productData.description,
            status: productData.status || 'active'
          }
        }
      });
      
      const productId = response.data.data.id;
      
      // Create variant for the product
      const variantResponse = await this.client.post('/variants', {
        data: {
          type: 'variants',
          attributes: {
            product_id: productId,
            name: productData.name,
            price: productData.price * 100, // Lemon Squeezy uses cents
            status: 'active'
          }
        }
      });
      
      return {
        success: true,
        productId,
        variantId: variantResponse.data.data.id,
        checkoutUrl: response.data.data.attributes.checkout_url
      };
      
    } catch (error) {
      console.error('Lemon Squeezy product creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.detail || 'Failed to create product'
      };
    }
  }
  
  // Get subscription details
  async getSubscription(subscriptionId) {
    try {
      const response = await this.client.get(`/subscriptions/${subscriptionId}`);
      
      return {
        success: true,
        subscription: response.data.data
      };
      
    } catch (error) {
      console.error('Lemon Squeezy get subscription error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.detail || 'Failed to get subscription'
      };
    }
  }
  
  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await this.client.delete(`/subscriptions/${subscriptionId}`);
      
      return {
        success: true,
        subscription: response.data.data
      };
      
    } catch (error) {
      console.error('Lemon Squeezy cancel subscription error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.detail || 'Failed to cancel subscription'
      };
    }
  }
  
  // Get order details
  async getOrder(orderId) {
    try {
      const response = await this.client.get(`/orders/${orderId}`);
      
      return {
        success: true,
        order: response.data.data
      };
      
    } catch (error) {
      console.error('Lemon Squeezy get order error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.detail || 'Failed to get order'
      };
    }
  }
  
  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    const secret = this.webhookSecret;
    const hash = crypto.createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash));
  }
  
  // Calculate creator earnings
  calculateEarnings(paymentAmount, platformFee = 0.05) { // 5% platform fee
    const lemonFee = paymentAmount * 0.055 + 0.50; // Lemon Squeezy fee (5.5% + $0.50)
    const platformFeeAmount = paymentAmount * platformFee;
    const creatorEarnings = paymentAmount - lemonFee - platformFeeAmount;
    
    return {
      grossAmount: paymentAmount,
      lemonFee,
      platformFeeAmount,
      creatorEarnings,
      totalFees: lemonFee + platformFeeAmount,
      netAmount: creatorEarnings
    };
  }
  
  // Get store products
  async getStoreProducts() {
    try {
      const response = await this.client.get('/products', {
        params: {
          filter: {
            store_id: this.storeId
          }
        }
      });
      
      return {
        success: true,
        products: response.data.data
      };
      
    } catch (error) {
      console.error('Lemon Squeezy get store products error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.detail || 'Failed to get store products'
      };
    }
  }
  
  // Get store variants (for pricing)
  async getStoreVariants() {
    try {
      const response = await this.client.get('/variants', {
        params: {
          filter: {
            store_id: this.storeId
          }
        }
      });
      
      return {
        success: true,
        variants: response.data.data
      };
      
    } catch (error) {
      console.error('Lemon Squeezy get store variants error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.detail || 'Failed to get store variants'
      };
    }
  }
  
  // Get customer info
  async getCustomer(customerId) {
    try {
      const response = await this.client.get(`/customers/${customerId}`);
      
      return {
        success: true,
        customer: response.data.data
      };
      
    } catch (error) {
      console.error('Lemon Squeezy get customer error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.detail || 'Failed to get customer'
      };
    }
  }
}

module.exports = LemonSqueezyService;
