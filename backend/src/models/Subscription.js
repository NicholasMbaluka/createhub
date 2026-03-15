const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriber:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creator:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan:         { type: String, enum: ['monthly', 'annual'], required: true },
  status:       { type: String, enum: ['active', 'cancelled', 'past_due', 'trialing'], default: 'active' },

  pricing: {
    amount:     { type: Number, required: true },
    currency:   { type: String, default: 'USD' },
  },

  stripeSubscriptionId: String,
  currentPeriodStart:   Date,
  currentPeriodEnd:     Date,
  cancelledAt:          Date,
  trialEndDate:         Date,
}, {
  timestamps: true,
});

subscriptionSchema.index({ subscriber: 1, creator: 1 }, { unique: true });
subscriptionSchema.index({ status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
