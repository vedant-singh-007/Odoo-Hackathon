const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticateToken, optionalAuth, requireOwnershipOrAdmin } = require('../middleware/auth');
const { validateProductCreation, validateProductUpdate, validateObjectId, validateSearchQuery } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with search and filtering
// @access  Public
router.get('/', validateSearchQuery, optionalAuth, async (req, res) => {
  try {
    const {
      q: searchQuery,
      category,
      minPrice,
      maxPrice,
      condition,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { status: 'active' };

    // Search functionality
    if (searchQuery) {
      query.$text = { $search: searchQuery };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Condition filter
    if (condition) {
      query.condition = condition;
    }

    // Sort options
    let sort = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'popular':
        sort = { views: -1, likes: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // If text search, add text score to sort
    if (searchQuery) {
      sort.score = { $meta: 'textScore' };
    }

    const products = await Product.find(query)
      .populate('seller', 'username firstName lastName profileImage isVerified')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Add like status for authenticated users
    if (req.user) {
      products.forEach(product => {
        product.isLiked = product.isLikedBy(req.user._id);
      });
    }

    const total = await Product.countDocuments(query);

    // Get categories for filter options
    const categories = await Product.distinct('category', { status: 'active' });

    res.json({
      products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      filters: {
        categories,
        searchQuery,
        category,
        minPrice,
        maxPrice,
        condition,
        sortBy
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      message: 'Failed to fetch products',
      code: 'PRODUCTS_FETCH_ERROR'
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({ status: 'active' })
      .populate('seller', 'username firstName lastName profileImage isVerified')
      .sort({ views: -1, likes: -1, createdAt: -1 })
      .limit(8);

    res.json({ products: featuredProducts });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      message: 'Failed to fetch featured products',
      code: 'FEATURED_PRODUCTS_ERROR'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      message: 'Failed to fetch categories',
      code: 'CATEGORIES_FETCH_ERROR'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', validateObjectId('id'), optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'username firstName lastName profileImage isVerified stats');

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Add like status for authenticated users
    if (req.user) {
      product.isLiked = product.isLikedBy(req.user._id);
    }

    // Get related products (same category, different seller)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      seller: { $ne: product.seller },
      status: 'active'
    })
      .populate('seller', 'username firstName lastName profileImage')
      .limit(4);

    res.json({
      product,
      relatedProducts
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      message: 'Failed to fetch product',
      code: 'PRODUCT_FETCH_ERROR'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private
router.post('/', authenticateToken, validateProductCreation, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      seller: req.user._id
    };

    // Set primary image if provided
    if (productData.images && productData.images.length > 0) {
      productData.images[0].isPrimary = true;
    }

    const product = new Product(productData);
    await product.save();

    // Update user's listing count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalListings': 1 }
    });

    await product.populate('seller', 'username firstName lastName profileImage isVerified');

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      message: 'Failed to create product',
      code: 'PRODUCT_CREATE_ERROR'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (owner only)
router.put('/:id',
  authenticateToken,
  validateObjectId('id'),
  validateProductUpdate,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      // Check ownership
      if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied. You can only edit your own products.',
          code: 'OWNERSHIP_REQUIRED'
        });
      }

      // Update product
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate('seller', 'username firstName lastName profileImage isVerified');

      res.json({
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        message: 'Failed to update product',
        code: 'PRODUCT_UPDATE_ERROR'
      });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (owner only)
router.delete('/:id',
  authenticateToken,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      // Check ownership
      if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied. You can only delete your own products.',
          code: 'OWNERSHIP_REQUIRED'
        });
      }

      await Product.findByIdAndDelete(req.params.id);

      // Update user's listing count
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.totalListings': -1 }
      });

      res.json({
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        message: 'Failed to delete product',
        code: 'PRODUCT_DELETE_ERROR'
      });
    }
  }
);

// @route   POST /api/products/:id/like
// @desc    Like/unlike a product
// @access  Private
router.post('/:id/like',
  authenticateToken,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      const isLiked = product.isLikedBy(req.user._id);

      if (isLiked) {
        // Unlike
        product.likes = product.likes.filter(
          like => like.user.toString() !== req.user._id.toString()
        );
      } else {
        // Like
        product.likes.push({ user: req.user._id });
      }

      await product.save();

      res.json({
        message: isLiked ? 'Product unliked' : 'Product liked',
        isLiked: !isLiked,
        likeCount: product.likes.length
      });
    } catch (error) {
      console.error('Like product error:', error);
      res.status(500).json({
        message: 'Failed to like product',
        code: 'PRODUCT_LIKE_ERROR'
      });
    }
  }
);

module.exports = router;
