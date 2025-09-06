const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'Electronics',
      'Clothing & Accessories',
      'Home & Garden',
      'Sports & Outdoors',
      'Books & Media',
      'Toys & Games',
      'Health & Beauty',
      'Automotive',
      'Art & Collectibles',
      'Furniture',
      'Jewelry',
      'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    max: [100000, 'Price cannot exceed $100,000']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  condition: {
    type: String,
    required: [true, 'Product condition is required'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'pending', 'inactive'],
    default: 'active'
  },
  location: {
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  features: {
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    material: { type: String, trim: true },
    age: { type: String, trim: true }
  },
  shipping: {
    available: { type: Boolean, default: true },
    cost: { type: Number, default: 0 },
    methods: [{ type: String }]
  },
  pickup: {
    available: { type: Boolean, default: true },
    location: { type: String, trim: true }
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  availability: {
    startDate: { type: Date, default: Date.now },
    endDate: Date
  },
  sustainability: {
    carbonFootprint: Number,
    wasteReduction: String,
    ecoFriendly: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
productSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Virtual for is liked by user (needs user ID context)
productSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Index for search optimization
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ views: -1 });

// Text search weights
productSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  'features.brand': 'text',
  'features.model': 'text'
}, {
  weights: {
    title: 10,
    'features.brand': 5,
    'features.model': 5,
    tags: 3,
    description: 1
  }
});

module.exports = mongoose.model('Product', productSchema);
