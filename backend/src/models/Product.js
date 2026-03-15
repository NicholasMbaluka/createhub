const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  creator:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true, trim: true, maxlength: 120 },
  slug:         { type: String, required: true, lowercase: true },
  description:  { type: String, required: true, maxlength: 2000 },
  type:         { type: String, enum: ['course', 'template', 'ebook', 'file_bundle', 'coaching', 'subscription'], required: true },
  status:       { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
  visibility:   { type: String, enum: ['public', 'unlisted', 'private'], default: 'public' },

  pricing: {
    amount:     { type: Number, required: true, min: 0 },
    currency:   { type: String, default: 'USD' },
    isFree:     { type: Boolean, default: false },
    compareAt:  { type: Number, default: null }, // original price for discounts
  },

  media: {
    thumbnail:  { type: String, default: null },
    preview:    { type: String, default: null },
    files:      [{ name: String, url: String, size: Number, type: String }],
  },

  tags:         [{ type: String, lowercase: true, trim: true }],
  category:     { type: String, default: 'general' },

  stats: {
    sales:      { type: Number, default: 0 },
    revenue:    { type: Number, default: 0 },
    views:      { type: Number, default: 0 },
    rating:     { type: Number, default: 0 },
    reviews:    { type: Number, default: 0 },
  },

  stripeProductId: { type: String, default: null },
  stripePriceId:   { type: String, default: null },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// Auto-generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  }
  next();
});

// Compound index: creator + slug
productSchema.index({ creator: 1, slug: 1 }, { unique: true });
productSchema.index({ status: 1, visibility: 1 });
productSchema.index({ 'pricing.amount': 1 });

module.exports = mongoose.model('Product', productSchema);
