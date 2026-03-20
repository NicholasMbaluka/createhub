// Mock data for development without MongoDB
const bcrypt = require('bcryptjs');
const mockUsers = [];
const mockProducts = [];
let userIdCounter = 1;
let productIdCounter = 1;

const MockUser = {
  findOne: async (query) => {
    if (query.email) {
      return mockUsers.find(user => user.email === query.email);
    }
    if (query._id) {
      return mockUsers.find(user => user._id === query._id);
    }
    return null;
  },
  
  create: async (data) => {
    const user = {
      _id: `user_${userIdCounter++}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUsers.push(user);
    return user;
  },
  
  findById: async (id) => {
    return mockUsers.find(user => user._id === id);
  }
};

const MockProduct = {
  find: async (query) => {
    if (query.creator) {
      return mockProducts.filter(product => product.creator === query.creator);
    }
    return mockProducts;
  },
  
  create: async (data) => {
    const product = {
      _id: `product_${productIdCounter++}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockProducts.push(product);
    return product;
  }
};

// Create a demo admin user
const createDemoAdmin = async () => {
  const existingAdmin = mockUsers.find(user => user.email === 'admin@createhub.io');
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = {
      _id: `user_${userIdCounter++}`,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@createhub.io',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUsers.push(admin);
    console.log('✅ Demo admin created: admin@createhub.io / admin123');
  }
};

// Create a demo creator user
const createDemoCreator = async () => {
  const existingCreator = mockUsers.find(user => user.email === 'amara@example.com');
  if (!existingCreator) {
    const hashedPassword = await bcrypt.hash('creator123', 10);
    const creator = {
      _id: `user_${userIdCounter++}`,
      firstName: 'Amara',
      lastName: 'Creator',
      email: 'amara@example.com',
      password: hashedPassword,
      role: 'creator',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUsers.push(creator);
    console.log('✅ Demo creator created: amara@example.com / creator123');
  }
};

module.exports = {
  MockUser,
  MockProduct,
  mockUsers,
  mockProducts,
  createDemoAdmin,
  createDemoCreator
};
