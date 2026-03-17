// Backend API Test Script
require('dotenv').config({ path: './backend/.env.development' });
const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const Product = require('./backend/src/models/Product');
const Order = require('./backend/src/models/Order');
const Subscription = require('./backend/src/models/Subscription');

// Test Database Connection
const testDatabaseConnection = async () => {
  console.log('🧪 Testing Database Connection...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/createhub');
    console.log('✅ Database connected successfully');
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log(`✅ User model working - ${userCount} users found`);
    
    // Test Product model
    const productCount = await Product.countDocuments();
    console.log(`✅ Product model working - ${productCount} products found`);
    
    // Test Order model
    const orderCount = await Order.countDocuments();
    console.log(`✅ Order model working - ${orderCount} orders found`);
    
    // Test Subscription model
    const subCount = await Subscription.countDocuments();
    console.log(`✅ Subscription model working - ${subCount} subscriptions found`);
    
    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    console.error('❌ Database Test Failed:', error.message);
    return false;
  }
};

// Test Admin User Creation
const testAdminUser = async () => {
  console.log('🧪 Testing Admin User...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/createhub');
    
    const adminUser = await User.findOne({ email: 'nicholasmbaluka05@gmail.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found:', {
        email: adminUser.email,
        role: adminUser.role,
        status: adminUser.status,
        hasSubscription: !!adminUser.subscription
      });
      
      await mongoose.disconnect();
      return true;
    } else {
      console.log('❌ Admin user not found - needs to be created');
      await mongoose.disconnect();
      return false;
    }
    
  } catch (error) {
    console.error('❌ Admin User Test Failed:', error.message);
    return false;
  }
};

// Test Product Creation
const testProductCreation = async () => {
  console.log('🧪 Testing Product Creation...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/createhub');
    
    // Find a creator user
    const creator = await User.findOne({ role: 'creator' });
    
    if (!creator) {
      console.log('❌ No creator user found for product test');
      await mongoose.disconnect();
      return false;
    }
    
    // Create test product
    const testProduct = {
      creator: creator._id,
      name: 'Test Digital Product',
      description: 'A test product for verification',
      type: 'digital',
      pricing: {
        amount: 9.99,
        isFree: false
      },
      content: {
        downloadUrl: 'https://example.com/test-file.zip',
        fileName: 'test-product.zip',
        fileSize: '2.5MB'
      },
      status: 'active'
    };
    
    const product = await Product.create(testProduct);
    
    console.log('✅ Test product created:', {
      id: product._id,
      name: product.name,
      type: product.type,
      price: product.pricing.amount
    });
    
    // Clean up test product
    await Product.findByIdAndDelete(product._id);
    
    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    console.error('❌ Product Creation Test Failed:', error.message);
    return false;
  }
};

// Test Order Creation
const testOrderCreation = async () => {
  console.log('🧪 Testing Order Creation...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/createhub');
    
    // Find creator and buyer
    const [creator, buyer] = await Promise.all([
      User.findOne({ role: 'creator' }),
      User.findOne({ role: 'public' })
    ]);
    
    if (!creator || !buyer) {
      console.log('❌ Need both creator and buyer users for order test');
      await mongoose.disconnect();
      return false;
    }
    
    // Create test product
    const product = await Product.create({
      creator: creator._id,
      name: 'Test Order Product',
      description: 'Product for order testing',
      type: 'digital',
      pricing: { amount: 19.99, isFree: false },
      status: 'active'
    });
    
    // Create test order
    const testOrder = {
      buyer: buyer._id,
      creator: creator._id,
      product: product._id,
      status: 'completed',
      pricing: { subtotal: 19.99 },
      accessToken: 'test-access-token-' + Date.now(),
      accessExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };
    
    const order = await Order.create(testOrder);
    
    console.log('✅ Test order created:', {
      id: order._id,
      buyer: order.buyer,
      creator: order.creator,
      status: order.status,
      amount: order.pricing.subtotal,
      hasAccessToken: !!order.accessToken
    });
    
    // Clean up
    await Order.findByIdAndDelete(order._id);
    await Product.findByIdAndDelete(product._id);
    
    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    console.error('❌ Order Creation Test Failed:', error.message);
    return false;
  }
};

// Run all backend tests
const runBackendTests = async () => {
  console.log('🚀 Starting Backend Tests...\n');
  
  const results = {
    database: await testDatabaseConnection(),
    adminUser: await testAdminUser(),
    productCreation: await testProductCreation(),
    orderCreation: await testOrderCreation()
  };
  
  console.log('\n🎯 Backend Test Results:');
  console.log('================================');
  console.log(`Database Connection: ${results.database ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Admin User: ${results.adminUser ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Product Creation: ${results.productCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Order Creation: ${results.orderCreation ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🏆 Backend: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Backend is ready for production!');
  } else {
    console.log('⚠️  Some backend components need attention.');
  }
  
  return results;
};

// Run tests if called directly
if (require.main === module) {
  runBackendTests();
}

module.exports = { runBackendTests, testDatabaseConnection, testAdminUser, testProductCreation, testOrderCreation };
