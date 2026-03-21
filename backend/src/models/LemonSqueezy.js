const mongoose = require('mongoose');

// Lemon Squeezy Subscription Model
const lemonSubscriptionSchema = new mongoose.Schema({
  // Lemon Squeezy IDs
  lemonSubscriptionId: { type: String, required: true, unique: true },
  lemonOrderId: String,
  lemonProductId: String,
  lemonVariantId: String,
  lemonCustomerId: String,
  
  // User relationships
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Subscription details
  type: { 
    type: String, 
    enum: ['creator_platform', 'customer_creator'], 
    required: true 
  },
  
  status: { 
    type: String, 
    enum: ['active', 'cancelled', 'expired', 'past_due', 'unpaid'], 
    default: 'active' 
  },
  
  // Billing details
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  interval: { type: String, enum: ['month', 'year'], required: true },
  intervalCount: { type: Number, default: 1 },
  
  // Dates
  startsAt: { type: Date, required: true },
  endsAt: Date,
  renewsAt: Date,
  cancelledAt: Date,
  trialEndsAt: Date,
  
  // Analytics
  totalRevenue: { type: Number, default: 0 },
  renewalCount: { type: Number, default: 0 },
  
  // Metadata
  metadata: {
    planName: String,
    planFeatures: [String],
    customData: mongoose.Schema.Types.Mixed
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Lemon Squeezy Order Model (for product purchases)
const lemonOrderSchema = new mongoose.Schema({
  // Lemon Squeezy IDs
  lemonOrderId: { type: String, required: true, unique: true },
  lemonProductId: String,
  lemonVariantId: String,
  lemonCustomerId: String,
  
  // User relationships
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  
  // Order details
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded', 'disputed'], 
    default: 'pending' 
  },
  
  // Financial details
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  
  // Fee calculation
  lemonFee: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  creatorEarnings: { type: Number, required: true },
  
  // Product access
  accessGranted: { type: Boolean, default: false },
  accessToken: String,
  accessExpiresAt: Date,
  
  // Dates
  orderedAt: { type: Date, required: true },
  paidAt: Date,
  refundedAt: Date,
  
  // Metadata
  metadata: {
    productName: String,
    productType: String,
    customerEmail: String,
    billingAddress: Object,
    shippingAddress: Object
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Creator Balance Ledger Model
const balanceLedgerSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Transaction details
  type: { 
    type: String, 
    enum: ['subscription_payment', 'product_sale', 'refund', 'payout', 'adjustment'], 
    required: true 
  },
  
  // Related entities
  relatedId: mongoose.Schema.Types.ObjectId, // Can be subscription, order, or payout ID
  relatedType: { type: String, enum: ['subscription', 'order', 'payout'] },
  
  // Financial details
  amount: { type: Number, required: true }, // Positive for earnings, negative for refunds/payouts
  runningBalance: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'failed'], 
    default: 'pending' 
  },
  
  // Description
  description: { type: String, required: true },
  
  // Dates
  createdAt: { type: Date, default: Date.now },
  confirmedAt: Date,
  
  // Metadata
  metadata: {
    customerName: String,
    productName: String,
    subscriptionType: String,
    lemonOrderId: String,
    lemonSubscriptionId: String
  }
});

// Payout Request Model
const payoutRequestSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Amount details
  requestedAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  
  // Payout method
  method: { 
    type: String, 
    enum: ['paypal', 'bank', 'wise', 'crypto'], 
    required: true 
  },
  
  // Method details
  methodDetails: {
    paypal: {
      email: String
    },
    bank: {
      accountNumber: String,
      routingNumber: String,
      accountHolderName: String,
      bankName: String
    },
    wise: {
      email: String,
      recipientId: String
    },
    crypto: {
      walletAddress: String,
      currency: String
    }
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'processing', 'completed', 'rejected'], 
    default: 'pending' 
  },
  
  // Processing details
  processingFee: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  transactionId: String,
  transactionHash: String,
  
  // Admin notes
  adminNotes: String,
  rejectionReason: String,
  
  // Dates
  requestedAt: { type: Date, default: Date.now },
  approvedAt: Date,
  processedAt: Date,
  completedAt: Date,
  rejectedAt: Date,
  
  // Metadata
  metadata: {
    processedBy: String,
    batchId: String,
    priority: { type: String, enum: ['normal', 'urgent'], default: 'normal' }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Product Integration Model (for Lemon Squeezy product sync)
const productIntegrationSchema = new mongoose.Schema({
  // Local product
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Lemon Squeezy integration
  lemonProductId: { type: String, required: true },
  lemonVariantId: { type: String, required: true },
  
  // Sync status
  syncStatus: { 
    type: String, 
    enum: ['synced', 'pending', 'error'], 
    default: 'pending' 
  },
  
  // Pricing
  localPrice: { type: Number, required: true },
  lemonPrice: { type: Number, required: true },
  
  // Metadata
  lastSyncAt: Date,
  syncError: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance (removed duplicates - lemonSubscriptionId and lemonOrderId already have unique indexes)
lemonSubscriptionSchema.index({ creatorId: 1, status: 1 });
lemonSubscriptionSchema.index({ customerId: 1, status: 1 });
lemonSubscriptionSchema.index({ type: 1, status: 1 });

lemonOrderSchema.index({ creatorId: 1, status: 1 });
lemonOrderSchema.index({ customerId: 1, status: 1 });
lemonOrderSchema.index({ productId: 1 });

balanceLedgerSchema.index({ creatorId: 1, createdAt: -1 });
balanceLedgerSchema.index({ type: 1, status: 1 });

payoutRequestSchema.index({ creatorId: 1, status: 1 });
payoutRequestSchema.index({ status: 1, requestedAt: -1 });

productIntegrationSchema.index({ productId: 1 });
productIntegrationSchema.index({ creatorId: 1 });
productIntegrationSchema.index({ lemonProductId: 1 });

module.exports = {
  LemonSubscription: mongoose.model('LemonSubscription', lemonSubscriptionSchema),
  LemonOrder: mongoose.model('LemonOrder', lemonOrderSchema),
  BalanceLedger: mongoose.model('BalanceLedger', balanceLedgerSchema),
  PayoutRequest: mongoose.model('PayoutRequest', payoutRequestSchema),
  ProductIntegration: mongoose.model('ProductIntegration', productIntegrationSchema)
};
