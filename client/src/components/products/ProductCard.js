import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { formatDistanceToNow } from 'date-fns';

const ProductCard = ({ product, showSeller = true }) => {
  const { isAuthenticated, user } = useAuth();
  const { addItem, isInCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    if (product.seller._id === user?.id) {
      // Can't add own product to cart
      return;
    }

    await addItem(product._id, 1);
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    // TODO: Implement like functionality
    console.log('Like product:', product._id);
  };

  const isOwnProduct = product.seller._id === user?.id;
  const isInUserCart = isInCart(product._id);

  return (
    <Link
      to={`/products/${product._id}`}
      className="group card-hover block"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-100">
        {product.primaryImage ? (
          <img
            src={product.primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleLike}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Condition Badge */}
        <div className="absolute top-2 left-2">
          <span className={`badge text-xs ${
            product.condition === 'New' ? 'badge-success' :
            product.condition === 'Like New' ? 'badge-primary' :
            product.condition === 'Good' ? 'badge-secondary' :
            'badge-warning'
          }`}>
            {product.condition}
          </span>
        </div>

        {/* Views Badge */}
        {product.views > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            <Eye className="w-3 h-3" />
            <span>{product.views}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary-600">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Category */}
        <div className="flex items-center justify-between mb-3">
          <span className="badge badge-secondary text-xs">
            {product.category}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Seller Info */}
        {showSeller && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              {product.seller.profileImage ? (
                <img
                  src={product.seller.profileImage}
                  alt={product.seller.firstName}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs text-primary-600 font-medium">
                  {product.seller.firstName?.charAt(0)}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {product.seller.firstName} {product.seller.lastName}
            </span>
            {product.seller.isVerified && (
              <span className="text-primary-500 text-xs">✓</span>
            )}
          </div>
        )}

        {/* Location */}
        {product.location?.city && (
          <div className="flex items-center space-x-1 mb-3">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {product.location.city}, {product.location.state}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          {!isOwnProduct && (
            <button
              onClick={handleAddToCart}
              disabled={isInUserCart}
              className={`flex-1 btn-sm ${
                isInUserCart 
                  ? 'btn-secondary cursor-not-allowed' 
                  : 'btn-primary'
              }`}
            >
              {isInUserCart ? 'In Cart' : 'Add to Cart'}
            </button>
          )}
          
          <Link
            to={`/products/${product._id}`}
            className="btn-secondary btn-sm flex-1 text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
