require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

const connectDB = require('../config/database');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑  Cleared existing data');

  // ── Create Users ────────────────────────────────────
  const users = await User.insertMany([
    {
      firstName: 'Admin', lastName: 'User',
      email: 'admin@createhub.io', password: await bcrypt.hash('admin123', 12),
      role: 'admin', status: 'active',
      kyc: { status: 'verified', verifiedAt: new Date() },
    },
    {
      firstName: 'Amara', lastName: 'Osei',
      email: 'amara@example.com', password: await bcrypt.hash('creator123', 12),
      role: 'creator', status: 'active', slug: 'amara-osei',
      bio: 'UI/UX designer & educator sharing design tips and resources.',
      kyc: { status: 'verified', verifiedAt: new Date() },
      stats: { totalRevenue: 6240, totalSales: 823, totalSubscribers: 204, pageViews: 8910 },
    },
    {
      firstName: 'Jake', lastName: 'Mensah',
      email: 'jake@example.com', password: await bcrypt.hash('creator123', 12),
      role: 'creator', status: 'active', slug: 'jake-mensah',
      bio: 'Productivity coach and Notion template creator.',
      kyc: { status: 'pending', submittedAt: new Date() },
      stats: { totalRevenue: 1200, totalSales: 63, totalSubscribers: 45 },
    },
    {
      firstName: 'Sofia', lastName: 'Adler',
      email: 'sofia@example.com', password: await bcrypt.hash('creator123', 12),
      role: 'creator', status: 'suspended', slug: 'sofia-adler',
      kyc: { status: 'verified', verifiedAt: new Date() },
      stats: { totalRevenue: 8100, totalSales: 279 },
    },
    {
      firstName: 'Daniel', lastName: 'Park',
      email: 'daniel@example.com', password: await bcrypt.hash('user123', 12),
      role: 'public', status: 'active',
      kyc: { status: 'none' },
    },
    {
      firstName: 'Lucia', lastName: 'Ferreira',
      email: 'lucia@example.com', password: await bcrypt.hash('creator123', 12),
      role: 'creator', status: 'active', slug: 'lucia-ferreira',
      bio: 'Travel photographer and preset creator.',
      kyc: { status: 'verified', verifiedAt: new Date() },
      stats: { totalRevenue: 3550, totalSales: 122 },
    },
  ]);
  console.log(`✅ Created ${users.length} users`);

  const [admin, amara, jake, sofia, daniel, lucia] = users;

  // ── Create Products ─────────────────────────────────
  const products = await Product.insertMany([
    {
      creator: amara._id, name: 'UI Design Masterclass',
      slug: 'ui-design-masterclass', description: 'A comprehensive course covering UI/UX principles, Figma, and design systems.',
      type: 'course', status: 'active', visibility: 'public',
      pricing: { amount: 49, currency: 'USD' },
      tags: ['design','figma','ui','ux'],
      stats: { sales: 142, revenue: 6958, views: 3200 },
    },
    {
      creator: amara._id, name: 'Notion Productivity Kit',
      slug: 'notion-productivity-kit', description: 'A complete set of Notion templates for project management, habit tracking, and goal setting.',
      type: 'template', status: 'active', visibility: 'public',
      pricing: { amount: 19, currency: 'USD' },
      tags: ['notion','productivity','templates'],
      stats: { sales: 381, revenue: 7239, views: 5100 },
    },
    {
      creator: lucia._id, name: 'Photography Presets Pack',
      slug: 'photography-presets-pack', description: 'Professional Lightroom presets for travel and portrait photography.',
      type: 'file_bundle', status: 'active', visibility: 'public',
      pricing: { amount: 29, currency: 'USD' },
      tags: ['photography','lightroom','presets'],
      stats: { sales: 97, revenue: 2813, views: 1800 },
    },
    {
      creator: amara._id, name: 'Startup Finance Guide',
      slug: 'startup-finance-guide', description: 'A practical guide to managing finances for early-stage startups.',
      type: 'ebook', status: 'draft', visibility: 'public',
      pricing: { amount: 15, currency: 'USD' },
      stats: { sales: 0, revenue: 0, views: 0 },
    },
  ]);
  console.log(`✅ Created ${products.length} products`);

  // ── Create Sample Orders ────────────────────────────
  const orders = await Order.insertMany([
    {
      buyer: daniel._id, creator: amara._id, product: products[0]._id,
      status: 'completed',
      pricing: { subtotal: 49, platformFee: 2.45, creatorNet: 46.55 },
      payment: { provider: 'stripe', paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      accessToken: 'tok_' + Math.random().toString(36).substr(2, 16),
    },
    {
      buyer: daniel._id, creator: amara._id, product: products[1]._id,
      status: 'completed',
      pricing: { subtotal: 19, platformFee: 0.95, creatorNet: 18.05 },
      payment: { provider: 'stripe', paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      accessToken: 'tok_' + Math.random().toString(36).substr(2, 16),
    },
  ]);
  console.log(`✅ Created ${orders.length} orders`);

  // ── Create Notifications ────────────────────────────
  await Notification.insertMany([
    { user: amara._id, type: 'sale',       title: 'New sale: UI Design Masterclass',    body: 'You earned $46.55', read: false },
    { user: amara._id, type: 'kyc',        title: 'KYC verification approved',          body: 'All monetization features unlocked.', read: false },
    { user: amara._id, type: 'payout',     title: 'Payout of $420 processed',           body: 'Funds sent to your bank account.', read: true },
    { user: amara._id, type: 'subscriber', title: 'New subscriber: Daniel Park',        body: 'Monthly plan — $29', read: true },
    { user: jake._id,  type: 'kyc',        title: 'KYC submitted',                      body: 'Your KYC is under review. 24–48 hours.', read: false },
    { user: admin._id, type: 'system',     title: 'Platform daily report',              body: '124 new users, $2,400 in transactions.', read: false },
  ]);
  console.log('✅ Created notifications');

  console.log('\n🎉 Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('  Demo Accounts:');
  console.log('  Admin   → admin@createhub.io   / admin123');
  console.log('  Creator → amara@example.com    / creator123');
  console.log('  Creator → jake@example.com     / creator123');
  console.log('  Buyer   → daniel@example.com   / user123');
  console.log('─────────────────────────────────────────\n');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
