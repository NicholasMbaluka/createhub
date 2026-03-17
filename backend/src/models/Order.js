const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creator:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

  status:       { type: String, enum: ['pending', 'completed', 'refunded', 'failed'], default: 'pending' },

  pricing: {
    subtotal:   { type: Number, required: true },
    currency:   { type: String, default: 'USD' },
  },

  payment: {
    provider:   { type: String, enum: ['stripe', 'paypal', 'free'], default: 'stripe' },
    paymentIntentId: String,
    chargeId:   String,
    receiptUrl: String,
    paidAt:     Date,
  },

  refund: {
    reason:     String,
    refundedAt: Date,
    refundId:   String,
  },

  // Product delivery features
  accessToken: { type: String, unique: true, sparse: true },
  accessExpires: Date,
  downloadCount: { type: Number, default: 0 },
  lastDownloadAt: Date,
  progress: { type: Map, of: Boolean }, // For course progress
  serviceStatus: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },

  completedAt: Date,
}, {
  timestamps: true,
});

orderSchema.index({ buyer: 1, product: 1 });
orderSchema.index({ creator: 1, status: 1 });
orderSchema.index({ 'payment.paymentIntentId': 1 });

module.exports = mongoose.model('Order', orderSchema);
