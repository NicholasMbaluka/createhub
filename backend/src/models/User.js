const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName:    { type: String, required: [true, 'First name is required'], trim: true, default: 'Admin' },
  lastName:     { type: String, required: [true, 'Last name is required'],  trim: true, default: 'User'  },
  email:        { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password:     { type: String, required: [true, 'Password is required'], select: false, minlength: 8 },
  role:         { type: String, enum: ['public', 'creator', 'admin'], default: 'public' },
  status:       { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  avatar:       { type: String, default: null },

  // Creator-specific
  bio:          { type: String, default: '', maxlength: 300 },
  slug:         { type: String, unique: true, sparse: true, lowercase: true },
  socialLinks:  { twitter: String, instagram: String, youtube: String, website: String },
  
  // Storefront customization
  storefrontCustomization: {
    theme: { type: String, enum: ['default', 'minimal', 'bold', 'playful'], default: 'default' },
    colors: {
      primary: { type: String, default: '#7c6ff7' },
      secondary: { type: String, default: '#5b4fe0' },
      accent: { type: String, default: '#a89dff' },
      background: { type: String, default: '#08080e' },
      text: { type: String, default: '#ededf8' }
    },
    layout: { type: String, enum: ['grid', 'list', 'masonry'], default: 'grid' },
    showSocialLinks: { type: Boolean, default: true },
    showStats: { type: Boolean, default: true },
    customCSS: { type: String, default: '' },
    bannerImage: String,
    logo: String
  },

  // KYC
  kyc: {
    status:       { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
    submittedAt:  Date,
    verifiedAt:   Date,
    rejectedAt:   Date,
    rejectionReason: String,
    documentType: String,
    documentUrl:  String,
    selfieUrl:    String,
  },

  // Payment
  stripeAccountId: { type: String, default: null },
  payoutMethods: [{
    id: { type: String, required: true },
    type: { type: String, enum: ['bank', 'paypal'], required: true },
    details: {
      // Bank account details
      accountNumber: String,
      routingNumber: String,
      accountHolderName: String,
      bankName: String,
      // PayPal details
      email: String
    },
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],

  // CreateHub Subscription Plan
  subscription: {
    plan: { type: String, enum: ['starter', 'pro', 'business', 'premium'], default: 'starter' },
    status: { type: String, enum: ['active', 'cancelled', 'past_due', 'trialing'], default: 'active' },
    stripeSubscriptionId: { type: String, default: null },
    stripeCustomerId: { type: String, default: null },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelledAt: Date,
    trialEndDate: Date,
  },

  // Stats cache
  stats: {
    totalRevenue:    { type: Number, default: 0 },
    totalSales:      { type: Number, default: 0 },
    totalSubscribers:{ type: Number, default: 0 },
    pageViews:       { type: Number, default: 0 },
  },

  emailVerified:    { type: Boolean, default: false },
  emailVerifyToken: { type: String, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: Date,
  lastLogin:        Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: full name
userSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Auto-generate slug for creators
userSchema.pre('save', function (next) {
  if (this.isNew && this.role === 'creator' && !this.slug) {
    this.slug = `${this.firstName.toLowerCase()}${this.lastName.toLowerCase()}${Date.now().toString(36)}`;
  }
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Remove sensitive fields when converting to JSON
userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerifyToken;
  delete obj.resetPasswordToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
