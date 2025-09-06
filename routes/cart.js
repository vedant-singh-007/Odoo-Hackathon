const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');
const { validateCartItem, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'title price images status seller category');

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    // Filter out unavailable products
    const availableItems = cart.items.filter(item => {
      return item.product && 
             item.product.status === 'active' && 
             item.product.seller.toString() !== req.user._id.toString();
    });

    // Update cart with available items only
    if (availableItems.length !== cart.items.length) {
      cart.items = availableItems;
      await cart.save();
    }

    res.json({
      cart: {
        id: cart._id,
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        lastUpdated: cart.lastUpdated
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      message: 'Failed to fetch cart',
      code: 'CART_FETCH_ERROR'
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', authenticateToken, validateCartItem, async (req, res) => {
  try {
    const { productId, quantity = 1, notes = '' } = req.body;

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        message: 'Product is not available',
        code: 'PRODUCT_UNAVAILABLE'
      });
    }

    // Check if user is trying to add their own product
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot add your own product to cart',
        code: 'OWN_PRODUCT_ERROR'
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, notes);

    // Populate the updated cart
    await cart.populate('items.product', 'title price images status seller category');

    res.status(201).json({
      message: 'Item added to cart successfully',
      cart: {
        id: cart._id,
        items: cart.items,
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      message: 'Failed to add item to cart',
      code: 'CART_ADD_ERROR'
    });
  }
});

// @route   PUT /api/cart/update/:productId
// @desc    Update item quantity in cart
// @access  Private
router.put('/update/:productId',
  authenticateToken,
  validateObjectId('productId'),
  async (req, res) => {
    try {
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          message: 'Quantity must be at least 1',
          code: 'INVALID_QUANTITY'
        });
      }

      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        return res.status(404).json({
          message: 'Cart not found',
          code: 'CART_NOT_FOUND'
        });
      }

      // Check if item exists in cart
      const itemExists = cart.items.some(
        item => item.product.toString() === req.params.productId
      );

      if (!itemExists) {
        return res.status(404).json({
          message: 'Item not found in cart',
          code: 'ITEM_NOT_FOUND'
        });
      }

      // Update quantity
      await cart.updateItemQuantity(req.params.productId, quantity);

      // Populate the updated cart
      await cart.populate('items.product', 'title price images status seller category');

      res.json({
        message: 'Cart updated successfully',
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice
        }
      });
    } catch (error) {
      console.error('Update cart error:', error);
      res.status(500).json({
        message: 'Failed to update cart',
        code: 'CART_UPDATE_ERROR'
      });
    }
  }
);

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId',
  authenticateToken,
  validateObjectId('productId'),
  async (req, res) => {
    try {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        return res.status(404).json({
          message: 'Cart not found',
          code: 'CART_NOT_FOUND'
        });
      }

      // Check if item exists in cart
      const itemExists = cart.items.some(
        item => item.product.toString() === req.params.productId
      );

      if (!itemExists) {
        return res.status(404).json({
          message: 'Item not found in cart',
          code: 'ITEM_NOT_FOUND'
        });
      }

      // Remove item
      await cart.removeItem(req.params.productId);

      // Populate the updated cart
      await cart.populate('items.product', 'title price images status seller category');

      res.json({
        message: 'Item removed from cart successfully',
        cart: {
          id: cart._id,
          items: cart.items,
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice
        }
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({
        message: 'Failed to remove item from cart',
        code: 'CART_REMOVE_ERROR'
      });
    }
  }
);

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found',
        code: 'CART_NOT_FOUND'
      });
    }

    await cart.clearCart();

    res.json({
      message: 'Cart cleared successfully',
      cart: {
        id: cart._id,
        items: [],
        totalItems: 0,
        totalPrice: 0
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      message: 'Failed to clear cart',
      code: 'CART_CLEAR_ERROR'
    });
  }
});

// @route   GET /api/cart/count
// @desc    Get cart item count
// @access  Private
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const count = cart ? cart.totalItems : 0;

    res.json({ count });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      message: 'Failed to get cart count',
      code: 'CART_COUNT_ERROR'
    });
  }
});

module.exports = router;
