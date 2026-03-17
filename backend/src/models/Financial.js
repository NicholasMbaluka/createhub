const mongoose = require('mongoose');

// Payment Model - Track all payment attempts
const paymentSchema = new mongoose.Schema({
  stripePaymentIntentId: { type: String, required: true, unique: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  
  // Stripe integration
  stripeChargeId: String,
  stripeReceiptUrl: String,
  stripeCustomerId: String,
  
  // Timing
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  failedAt: Date,
  
  // Failure handling
  failureReason: String,
  refundId: String,
  
  // Metadata
  metadata: {
    paymentMethod: String,
    browser: String,
    ip: String,
    userAgent: String
  }
});

// Payout Model - Track creator payout requests
const payoutSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  
  // Payout method
  payoutMethodId: { type: String, required: true },
  payoutMethodType: { type: String, enum: ['bank', 'paypal'] },
  
  // Stripe Connect integration
  stripeTransferId: String,
  stripeDestinationId: String,
  
  // Fees and amounts
  processingFee: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  
  // Timing
  requestedAt: { type: Date, default: Date.now },
  processingStartedAt: Date,
  completedAt: Date,
  arrivalDate: Date,
  failedAt: Date,
  
  // Failure handling
  failureReason: String,
  retryCount: { type: Number, default: 0 },
  
  // Metadata
  metadata: {
    processedBy: String,
    notes: String,
    batchId: String
  }
});

// Transaction Model - Track all financial transactions
const transactionSchema = new mongoose.Schema({
  // Related entities
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  payoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payout' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Transaction details
  type: { 
    type: String, 
    enum: ['sale', 'refund', 'payout', 'fee', 'adjustment'], 
    required: true 
  },
  
  // Amounts
  amount: { type: Number, required: true }, // Can be negative for refunds/payouts
  fee: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  
  // Provider details
  provider: { type: String, enum: ['stripe', 'paypal', 'bank', 'system'], default: 'stripe' },
  providerTransactionId: String,
  providerReceiptUrl: String,
  
  // Timing
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  failedAt: Date,
  
  // Metadata
  description: String,
  metadata: {
    category: String,
    tags: [String],
    source: String,
    campaign: String
  }
});

// Indexes for performance
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ buyerId: 1, status: 1 });
paymentSchema.index({ creatorId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

payoutSchema.index({ creatorId: 1, status: 1 });
payoutSchema.index({ requestedAt: -1 });
payoutSchema.index({ stripeTransferId: 1 });

transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ paymentId: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ providerTransactionId: 1 });

module.exports = {
  Payment: mongoose.model('Payment', paymentSchema),
  Payout: mongoose.model('Payout', payoutSchema),
  Transaction: mongoose.model('Transaction', transactionSchema)
};
