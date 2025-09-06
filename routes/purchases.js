const express = require('express');
const Purchase = require('../models/Purchase');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth');
const { validatePurchase, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/purchases
// @desc    Create a new purchase
// @access  Private
router.post('/', authenticateToken, validatePurchase, async (req, res) => {
  try {
    const { items, paymentMethod, shippingAddress, notes } = req.body;

    // Validate all products exist and are available
    const productIds = items.map(item => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      status: 'active'
    }).populate('seller', 'username firstName lastName');

    if (products.length !== productIds.length) {
      return res.status(400).json({
        message: 'One or more products are not available',
        code: 'PRODUCTS_UNAVAILABLE'
      });
    }

    // Calculate totals and validate prices
    let totalAmount = 0;
    let shippingCost = 0;
    let tax = 0;

    const purchaseItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      
      // Check if user is trying to buy their own product
      if (product.seller._id.toString() === req.user._id.toString()) {
        throw new Error('You cannot purchase your own product');
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      return {
        product: item.productId,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        seller: product.seller._id
      };
    });

    // Calculate final amount (simplified - in real app, calculate shipping and tax)
    const finalAmount = totalAmount + shippingCost + tax;

    // Create purchase
    const purchase = new Purchase({
      buyer: req.user._id,
      items: purchaseItems,
      totalAmount,
      shippingCost,
      tax,
      finalAmount,
      paymentMethod,
      shippingAddress,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Calculate sustainability impact
    await purchase.calculateSustainabilityImpact();
    await purchase.save();

    // Update product status to sold
    await Product.updateMany(
      { _id: { $in: productIds } },
      { status: 'sold' }
    );

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalPurchases': 1 }
    });

    // Update seller stats
    const sellerIds = [...new Set(purchaseItems.map(item => item.seller))];
    await User.updateMany(
      { _id: { $in: sellerIds } },
      { $inc: { 'stats.totalSales': 1 } }
    );

    // Clear user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      await cart.clearCart();
    }

    // Populate purchase data
    await purchase.populate([
      { path: 'items.product', select: 'title images' },
      { path: 'items.seller', select: 'username firstName lastName' },
      { path: 'buyer', select: 'username firstName lastName' }
    ]);

    res.status(201).json({
      message: 'Purchase created successfully',
      purchase
    });
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({
      message: error.message || 'Failed to create purchase',
      code: 'PURCHASE_CREATE_ERROR'
    });
  }
});

// @route   POST /api/purchases/from-cart
// @desc    Create purchase from cart items
// @access  Private
router.post('/from-cart', authenticateToken, async (req, res) => {
  try {
    const { paymentMethod, shippingAddress, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'title price seller status');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: 'Cart is empty',
        code: 'EMPTY_CART'
      });
    }

    // Validate all products are still available
    const unavailableItems = cart.items.filter(item => 
      !item.product || item.product.status !== 'active'
    );

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        message: 'Some items in your cart are no longer available',
        code: 'ITEMS_UNAVAILABLE',
        unavailableItems: unavailableItems.map(item => ({
          productId: item.product._id,
          title: item.product.title
        }))
      });
    }

    // Convert cart items to purchase items
    const items = cart.items.map(item => ({
      productId: item.product._id,
      quantity: item.quantity
    }));

    // Create purchase using the main purchase route logic
    req.body = {
      ...req.body,
      items,
      paymentMethod,
      shippingAddress,
      notes
    };

    // Call the main purchase creation logic
    return router.handle({ method: 'POST', url: '/' }, req, res);
  } catch (error) {
    console.error('Create purchase from cart error:', error);
    res.status(500).json({
      message: 'Failed to create purchase from cart',
      code: 'CART_PURCHASE_ERROR'
    });
  }
});

// @route   GET /api/purchases
// @desc    Get user's purchases
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { buyer: req.user._id };
    if (status) {
      query.status = status;
    }

    const purchases = await Purchase.find(query)
      .populate('items.product', 'title images price')
      .populate('items.seller', 'username firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Purchase.countDocuments(query);

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
    console.error('Get purchases error:', error);
    res.status(500).json({
      message: 'Failed to fetch purchases',
      code: 'PURCHASES_FETCH_ERROR'
    });
  }
});

// @route   GET /api/purchases/:id
// @desc    Get single purchase
// @access  Private (buyer only)
router.get('/:id',
  authenticateToken,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const purchase = await Purchase.findById(req.params.id)
        .populate('items.product', 'title images price category')
        .populate('items.seller', 'username firstName lastName profileImage phone')
        .populate('buyer', 'username firstName lastName profileImage');

      if (!purchase) {
        return res.status(404).json({
          message: 'Purchase not found',
          code: 'PURCHASE_NOT_FOUND'
        });
      }

      // Check if user is the buyer or admin
      if (purchase.buyer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }

      res.json({ purchase });
    } catch (error) {
      console.error('Get purchase error:', error);
      res.status(500).json({
        message: 'Failed to fetch purchase',
        code: 'PURCHASE_FETCH_ERROR'
      });
    }
  }
);

// @route   PUT /api/purchases/:id/status
// @desc    Update purchase status
// @access  Private (seller or admin)
router.put('/:id/status',
  authenticateToken,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: 'Invalid status',
          code: 'INVALID_STATUS'
        });
      }

      const purchase = await Purchase.findById(req.params.id)
        .populate('items.seller', '_id');

      if (!purchase) {
        return res.status(404).json({
          message: 'Purchase not found',
          code: 'PURCHASE_NOT_FOUND'
        });
      }

      // Check if user is a seller of any item or admin
      const isSeller = purchase.items.some(item => 
        item.seller._id.toString() === req.user._id.toString()
      );

      if (!isSeller && req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied. You can only update status of your own sales.',
          code: 'ACCESS_DENIED'
        });
      }

      // Update status
      await purchase.updateStatus(status);

      res.json({
        message: 'Purchase status updated successfully',
        purchase
      });
    } catch (error) {
      console.error('Update purchase status error:', error);
      res.status(500).json({
        message: 'Failed to update purchase status',
        code: 'STATUS_UPDATE_ERROR'
      });
    }
  }
);

// @route   GET /api/purchases/sales
// @desc    Get user's sales
// @access  Private
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { 'items.seller': req.user._id };
    if (status) {
      query.status = status;
    }

    const sales = await Purchase.find(query)
      .populate('buyer', 'username firstName lastName profileImage')
      .populate('items.product', 'title images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Purchase.countDocuments(query);

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
    console.error('Get sales error:', error);
    res.status(500).json({
      message: 'Failed to fetch sales',
      code: 'SALES_FETCH_ERROR'
    });
  }
});

// @route   GET /api/purchases/stats
// @desc    Get purchase statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Purchase stats
    const purchaseStats = await Purchase.aggregate([
      { $match: { buyer: userId } },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: '$finalAmount' },
          averageOrderValue: { $avg: '$finalAmount' }
        }
      }
    ]);

    // Sales stats
    const salesStats = await Purchase.aggregate([
      { $match: { 'items.seller': userId } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalEarned: { $sum: '$finalAmount' },
          averageSaleValue: { $avg: '$finalAmount' }
        }
      }
    ]);

    // Sustainability impact
    const sustainabilityStats = await Purchase.aggregate([
      { $match: { buyer: userId } },
      {
        $group: {
          _id: null,
          totalCarbonReduced: { $sum: '$sustainabilityImpact.carbonFootprintReduced' },
          totalWasteDiverted: { $sum: '$sustainabilityImpact.wasteDiverted' },
          totalTreesSaved: { $sum: '$sustainabilityImpact.treesSaved' }
        }
      }
    ]);

    res.json({
      purchases: purchaseStats[0] || {
        totalPurchases: 0,
        totalSpent: 0,
        averageOrderValue: 0
      },
      sales: salesStats[0] || {
        totalSales: 0,
        totalEarned: 0,
        averageSaleValue: 0
      },
      sustainability: sustainabilityStats[0] || {
        totalCarbonReduced: 0,
        totalWasteDiverted: 0,
        totalTreesSaved: 0
      }
    });
  } catch (error) {
    console.error('Get purchase stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch purchase statistics',
      code: 'STATS_FETCH_ERROR'
    });
  }
});

module.exports = router;
