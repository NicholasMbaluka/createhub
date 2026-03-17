const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');

// @desc  Get public creator storefront
// @route GET /api/storefront/:slug
// @access Public
const getCreatorStorefront = async (req, res) => {
  try {
    const { slug } = req.params;

    const creator = await User.findOne({ 
      slug, 
      role: 'creator', 
      status: 'active' 
    }).select('firstName lastName bio avatar socialLinks subscription createdAt');

    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    // Get creator's public products
    const products = await Product.find({ 
      creator: creator._id, 
      status: 'active' 
    })
    .select('name description type pricing thumbnail tags category slug createdAt')
    .sort({ createdAt: -1 });

    // Get creator stats
    const [totalSales, totalSubscribers] = await Promise.all([
      Order.countDocuments({ creator: creator._id, status: 'completed' }),
      Subscription.countDocuments({ creator: creator._id, status: 'active' })
    ]);

    // Get subscription info for creator
    const plan = creator.subscription?.plan || 'starter';
    const canCustomize = ['pro', 'business', 'premium'].includes(plan);

    res.json({
      success: true,
      storefront: {
        creator: {
          id: creator._id,
          firstName: creator.firstName,
          lastName: creator.lastName,
          bio: creator.bio,
          avatar: creator.avatar,
          socialLinks: creator.socialLinks,
          createdAt: creator.createdAt,
          stats: {
            totalSales,
            totalSubscribers,
            totalProducts: products.length
          }
        },
        products: products.map(product => ({
          id: product._id,
          name: product.name,
          description: product.description,
          type: product.type,
          pricing: product.pricing,
          thumbnail: product.thumbnail,
          tags: product.tags,
          category: product.category,
          slug: product.slug,
          createdAt: product.createdAt
        })),
        customization: {
          canCustomize,
          plan
        }
      }
    });

  } catch (error) {
    console.error('Get storefront error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get creator storefront customization settings
// @route GET /api/storefront/customization
// @access Private (creator)
const getStorefrontCustomization = async (req, res) => {
  try {
    const user = req.user;

    // Check if user can customize storefront
    const plan = user.subscription?.plan || 'starter';
    const canCustomize = ['pro', 'business', 'premium'].includes(plan);

    if (!canCustomize) {
      return res.status(403).json({ 
        success: false, 
        message: 'Storefront customization requires Pro plan or higher' 
      });
    }

    const customization = user.storefrontCustomization || {
      theme: 'default',
      colors: {
        primary: '#7c6ff7',
        secondary: '#5b4fe0',
        accent: '#a89dff',
        background: '#08080e',
        text: '#ededf8'
      },
      layout: 'grid',
      showSocialLinks: true,
      showStats: true,
      customCSS: '',
      bannerImage: null,
      logo: null
    };

    res.json({
      success: true,
      customization
    });

  } catch (error) {
    console.error('Get customization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Update storefront customization
// @route PUT /api/storefront/customization
// @access Private (creator)
const updateStorefrontCustomization = async (req, res) => {
  try {
    const user = req.user;
    const { theme, colors, layout, showSocialLinks, showStats, customCSS, bannerImage, logo } = req.body;

    // Check if user can customize storefront
    const plan = user.subscription?.plan || 'starter';
    const canCustomize = ['pro', 'business', 'premium'].includes(plan);

    if (!canCustomize) {
      return res.status(403).json({ 
        success: false, 
        message: 'Storefront customization requires Pro plan or higher' 
      });
    }

    // Validate customization options
    const allowedThemes = ['default', 'minimal', 'bold', 'playful'];
    const allowedLayouts = ['grid', 'list', 'masonry'];

    if (theme && !allowedThemes.includes(theme)) {
      return res.status(400).json({ success: false, message: 'Invalid theme' });
    }

    if (layout && !allowedLayouts.includes(layout)) {
      return res.status(400).json({ success: false, message: 'Invalid layout' });
    }

    // Update customization
    const customization = {
      theme: theme || 'default',
      colors: colors || {
        primary: '#7c6ff7',
        secondary: '#5b4fe0',
        accent: '#a89dff',
        background: '#08080e',
        text: '#ededf8'
      },
      layout: layout || 'grid',
      showSocialLinks: showSocialLinks !== undefined ? showSocialLinks : true,
      showStats: showStats !== undefined ? showStats : true,
      customCSS: customCSS || '',
      bannerImage: bannerImage || null,
      logo: logo || null
    };

    user.storefrontCustomization = customization;
    await user.save();

    res.json({
      success: true,
      message: 'Storefront customization updated successfully',
      customization
    });

  } catch (error) {
    console.error('Update customization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Generate creator slug
// @route POST /api/storefront/generate-slug
// @access Private (creator)
const generateSlug = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user._id;

    let baseSlug = `${firstName?.toLowerCase() || ''}${lastName?.toLowerCase() || ''}`;
    baseSlug = baseSlug.replace(/[^a-z0-9]/g, '');

    if (!baseSlug) {
      return res.status(400).json({ success: false, message: 'Invalid name for slug generation' });
    }

    let slug = baseSlug;
    let counter = 1;

    // Check if slug is unique
    while (await User.findOne({ slug, _id: { $ne: userId } })) {
      slug = `${baseSlug}${counter}`;
      counter++;
    }

    res.json({
      success: true,
      slug
    });

  } catch (error) {
    console.error('Generate slug error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getCreatorStorefront,
  getStorefrontCustomization,
  updateStorefrontCustomization,
  generateSlug
};
