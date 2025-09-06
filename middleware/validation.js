const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and cannot exceed 50 characters')
    .trim(),
  
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and cannot exceed 50 characters')
    .trim(),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name cannot exceed 50 characters')
    .trim(),
  
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
    .trim(),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Product validation rules
const validateProductCreation = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters')
    .trim(),
  
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
  
  body('category')
    .isIn([
      'Electronics', 'Clothing & Accessories', 'Home & Garden',
      'Sports & Outdoors', 'Books & Media', 'Toys & Games',
      'Health & Beauty', 'Automotive', 'Art & Collectibles',
      'Furniture', 'Jewelry', 'Other'
    ])
    .withMessage('Please select a valid category'),
  
  body('price')
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Price must be between $0 and $100,000'),
  
  body('condition')
    .optional()
    .isIn(['New', 'Like New', 'Good', 'Fair', 'Poor'])
    .withMessage('Please select a valid condition'),
  
  body('subcategory')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Subcategory cannot exceed 50 characters')
    .trim(),
  
  handleValidationErrors
];

const validateProductUpdate = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
  
  body('category')
    .optional()
    .isIn([
      'Electronics', 'Clothing & Accessories', 'Home & Garden',
      'Sports & Outdoors', 'Books & Media', 'Toys & Games',
      'Health & Beauty', 'Automotive', 'Art & Collectibles',
      'Furniture', 'Jewelry', 'Other'
    ])
    .withMessage('Please select a valid category'),
  
  body('price')
    .optional()
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Price must be between $0 and $100,000'),
  
  body('condition')
    .optional()
    .isIn(['New', 'Like New', 'Good', 'Fair', 'Poor'])
    .withMessage('Please select a valid condition'),
  
  body('status')
    .optional()
    .isIn(['active', 'sold', 'pending', 'inactive'])
    .withMessage('Please select a valid status'),
  
  handleValidationErrors
];

// Cart validation rules
const validateCartItem = [
  body('productId')
    .isMongoId()
    .withMessage('Please provide a valid product ID'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99'),
  
  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
    .trim(),
  
  handleValidationErrors
];

// Purchase validation rules
const validatePurchase = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required for purchase'),
  
  body('items.*.productId')
    .isMongoId()
    .withMessage('Please provide valid product IDs'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer'])
    .withMessage('Please select a valid payment method'),
  
  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Shipping address street is required'),
  
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('Shipping address city is required'),
  
  body('shippingAddress.state')
    .notEmpty()
    .withMessage('Shipping address state is required'),
  
  body('shippingAddress.zipCode')
    .notEmpty()
    .withMessage('Shipping address zip code is required'),
  
  handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  
  handleValidationErrors
];

// Query validation
const validateSearchQuery = [
  query('q')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s\-'"&():]*$/)
    .withMessage('Search query contains invalid characters'),

  query('category')
    .optional({ checkFalsy: true })
    .isIn([
      'Electronics', 'Clothing & Accessories', 'Home & Garden',
      'Sports & Outdoors', 'Books & Media', 'Toys & Games',
      'Health & Beauty', 'Automotive', 'Art & Collectibles',
      'Furniture', 'Jewelry', 'Other'
    ])
    .withMessage('Please select a valid category'),

  query('minPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),

  query('maxPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),

  query('condition')
    .optional({ checkFalsy: true })
    .isIn(['New', 'Like New', 'Good', 'Fair', 'Poor'])
    .withMessage('Please select a valid condition'),

  query('sortBy')
    .optional({ checkFalsy: true })
    .isIn(['price_asc', 'price_desc', 'newest', 'oldest', 'popular'])
    .withMessage('Please select a valid sort option'),

  query('page')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateProductCreation,
  validateProductUpdate,
  validateCartItem,
  validatePurchase,
  validateObjectId,
  validateSearchQuery
};