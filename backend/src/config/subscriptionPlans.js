const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'CreateHub Starter',
    price: 0,
    stripePriceId: null, // Will be set when configured in Stripe
    features: [
      'Basic CreateHub link-in-bio page',
      'Up to 5 products or links',
      'Basic analytics',
      'CreateHub branding displayed',
      'Creator storefront'
    ],
    limits: {
      products: 5,
      links: 5,
      customDomain: false,
      removeBranding: false,
      customThemes: false,
      apiAccess: false,
      emailCapture: false,
      marketingIntegrations: false,
      prioritySupport: false
    },
    commission: 0 // No commission for now
  },
  pro: {
    name: 'CreateHub Pro',
    price: 9,
    stripePriceId: null, // Will be set when configured in Stripe
    features: [
      'Unlimited products and links',
      'Remove CreateHub branding',
      'Custom page themes',
      'Sales analytics',
      'Creator store page'
    ],
    limits: {
      products: -1, // Unlimited
      links: -1,
      customDomain: false,
      removeBranding: true,
      customThemes: true,
      apiAccess: false,
      emailCapture: false,
      marketingIntegrations: false,
      prioritySupport: false
    },
    commission: 0 // 0%
  },
  business: {
    name: 'CreateHub Business',
    price: 19,
    stripePriceId: null, // Will be set when configured in Stripe
    features: [
      'Everything in Pro',
      'Advanced analytics dashboard',
      'Email capture tools',
      'Custom domain support',
      'Creator storefront tools'
    ],
    limits: {
      products: -1,
      links: -1,
      customDomain: true,
      removeBranding: true,
      customThemes: true,
      apiAccess: false,
      emailCapture: true,
      marketingIntegrations: true,
      prioritySupport: false
    },
    commission: 0 // 0%
  },
  premium: {
    name: 'CreateHub Premium',
    price: 39,
    stripePriceId: null, // Will be set when configured in Stripe
    features: [
      'Everything in Business',
      'API access',
      'Advanced customization',
      'Premium themes',
      'Automation tools',
      'Priority support'
    ],
    limits: {
      products: -1,
      links: -1,
      customDomain: true,
      removeBranding: true,
      customThemes: true,
      apiAccess: true,
      emailCapture: true,
      marketingIntegrations: true,
      prioritySupport: true
    },
    commission: 0 // 0%
  }
};

// Helper function to get plan details
const getPlanDetails = (planName) => {
  return SUBSCRIPTION_PLANS[planName] || SUBSCRIPTION_PLANS.starter;
};

// Helper function to check if user can perform action based on plan limits
const canPerformAction = (user, action, currentCount = 0) => {
  const plan = getPlanDetails(user.subscription?.plan || 'starter');
  const limit = plan.limits[action];
  
  if (limit === -1) return true; // Unlimited
  if (limit === undefined) return true; // No limit defined
  return currentCount < limit;
};

// Helper function to get available features for a plan
const getPlanFeatures = (planName) => {
  const plan = getPlanDetails(planName);
  return {
    name: plan.name,
    price: plan.price,
    features: plan.features,
    limits: plan.limits
  };
};

module.exports = {
  SUBSCRIPTION_PLANS,
  getPlanDetails,
  canPerformAction,
  getPlanFeatures
};
