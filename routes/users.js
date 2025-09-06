const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth');
const { validateUserUpdate, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/profile/:userId
// @desc    Get user profile by ID
// @access  Public
router.get('/profile/:userId', validateObjectId('userId'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      '-password -email -phone -address -preferences'
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Get user's active listings count
    const activeListings = await Product.countDocuments({
      seller: req.params.userId,
      status: 'active'
    });

    // Get user's total sales
    const totalSales = await Purchase.aggregate([
      { $match: { 'items.seller': user._id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        profileImage: user.profileImage,
        bio: user.bio,
        isVerified: user.isVerified,
        stats: {
          ...user.stats,
          activeListings,
          totalSalesAmount: totalSales[0]?.total || 0
        },
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      message: 'Failed to fetch user profile',
      code: 'PROFILE_FETCH_ERROR'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', authenticateToken, validateUserUpdate, async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user._id;

    // Check if username is being updated and is unique
    if (updates.username) {
      const existingUser = await User.findOne({
        username: updates.username,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Username is already taken',
          code: 'USERNAME_TAKEN'
        });
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
        bio: user.bio,
        preferences: user.preferences,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      code: 'PROFILE_UPDATE_ERROR'
    });
  }
});

// @route   GET /api/users/:userId/listings
// @desc    Get user's product listings
// @access  Public
router.get('/:userId/listings', validateObjectId('userId'), async (req, res) => {
  try {
    const { page = 1, limit = 12, status = 'active' } = req.query;
    const skip = (page - 1) * limit;

    const query = { seller: req.params.userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const listings = await Product.find(query)
      .populate('seller', 'username firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      listings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({
      message: 'Failed to fetch user listings',
      code: 'LISTINGS_FETCH_ERROR'
    });
  }
});

// @route   GET /api/users/:userId/reviews
// @desc    Get user reviews (as seller)
// @access  Public
router.get('/:userId/reviews', validateObjectId('userId'), async (req, res) => {
  try {
    // This would typically involve a Review model
    // For now, we'll return empty array
    res.json({
      reviews: [],
      averageRating: 0,
      totalReviews: 0
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      message: 'Failed to fetch user reviews',
      code: 'REVIEWS_FETCH_ERROR'
    });
  }
});

// @route   GET /api/users/:userId/purchases
// @desc    Get user's purchase history
// @access  Private (own purchases only)
router.get('/:userId/purchases', 
  authenticateToken, 
  requireOwnershipOrAdmin('userId'),
  validateObjectId('userId'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const purchases = await Purchase.find({ buyer: req.params.userId })
        .populate('items.product', 'title images price')
        .populate('items.seller', 'username firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Purchase.countDocuments({ buyer: req.params.userId });

      res.json({
        purchases,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get user purchases error:', error);
      res.status(500).json({
        message: 'Failed to fetch purchase history',
        code: 'PURCHASES_FETCH_ERROR'
      });
    }
  }
);

// @route   GET /api/users/:userId/sales
// @desc    Get user's sales history
// @access  Private (own sales only)
router.get('/:userId/sales',
  authenticateToken,
  requireOwnershipOrAdmin('userId'),
  validateObjectId('userId'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const sales = await Purchase.find({ 'items.seller': req.params.userId })
        .populate('buyer', 'username firstName lastName')
        .populate('items.product', 'title images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Purchase.countDocuments({ 'items.seller': req.params.userId });

      res.json({
        sales,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get user sales error:', error);
      res.status(500).json({
        message: 'Failed to fetch sales history',
        code: 'SALES_FETCH_ERROR'
      });
    }
  }
);

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user has active listings
    const activeListings = await Product.countDocuments({
      seller: userId,
      status: 'active'
    });

    if (activeListings > 0) {
      return res.status(400).json({
        message: 'Cannot delete account with active listings. Please deactivate all listings first.',
        code: 'ACTIVE_LISTINGS_EXIST'
      });
    }

    // Check if user has pending purchases
    const pendingPurchases = await Purchase.countDocuments({
      buyer: userId,
      status: { $in: ['pending', 'confirmed', 'shipped'] }
    });

    if (pendingPurchases > 0) {
      return res.status(400).json({
        message: 'Cannot delete account with pending purchases.',
        code: 'PENDING_PURCHASES_EXIST'
      });
    }

    // Deactivate account instead of deleting
    await User.findByIdAndUpdate(userId, { isActive: false });

    res.json({
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      message: 'Failed to delete account',
      code: 'ACCOUNT_DELETE_ERROR'
    });
  }
});

// backend/routes/users.js (or similar)
router.put(
  '/profile',
  authenticateToken,
  validateUserUpdate,
  async (req, res) => {
    try {
      const updates = req.body;
      const userId = req.user._id;

      // If username is being changed, ensure uniqueness
      if (updates.username) {
        const exists = await User.findOne({ username: updates.username, _id: { $ne: userId } });
        if (exists) {
          return res.status(400).json({ message: 'Username is already taken', code: 'USERNAME_TAKEN' });
        }
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phone: user.phone,
          address: user.address,
          profileImage: user.profileImage,
          bio: user.bio,
          preferences: user.preferences,
          stats: user.stats
        }
      });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ message: 'Failed to update profile', code: 'PROFILE_UPDATE_ERROR' });
    }
  }
);

module.exports = router;
