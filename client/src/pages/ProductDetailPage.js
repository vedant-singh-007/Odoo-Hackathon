import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Eye, 
  ShoppingCart,
  MessageCircle,
  Shield,
  Truck,
  RotateCcw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { productAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addItem, isInCart } = useCart();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch product details
  const { data: productData, isLoading, error } = useQuery(
    ['product', id],
    () => productAPI.getProduct(id),
    {
      enabled: !!id,
    }
  );

  const product = productData?.data?.product;
  const relatedProducts = productData?.data?.relatedProducts || [];

  const isOwnProduct = product?.seller?._id === user?.id;
  const isInUserCart = isInCart(product?._id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isOwnProduct) {
      alert('You cannot add your own product to cart');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addItem(product._id, quantity);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await productAPI.likeProduct(product._id);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const primaryImage = images.find(img => img.isPrimary) || images[0];

  return (
    <>
      <Helmet>
        <title>{product.title} - EcoFinds</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={primaryImage?.url} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Back Button */}
        <div className="bg-white border-b">
          <div className="container-custom py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                {primaryImage ? (
                  <img
                    src={primaryImage.url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-lg">No Image</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                        index === selectedImageIndex 
                          ? 'border-primary-500' 
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleLike}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{product.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-primary-600">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Condition & Category */}
              <div className="flex items-center space-x-4">
                <span className={`badge ${
                  product.condition === 'New' ? 'badge-success' :
                  product.condition === 'Like New' ? 'badge-primary' :
                  product.condition === 'Good' ? 'badge-secondary' :
                  'badge-warning'
                }`}>
                  {product.condition}
                </span>
                <span className="badge badge-secondary">{product.category}</span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Features */}
              {product.features && Object.keys(product.features).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(product.features).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              {product.location?.city && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{product.location.city}, {product.location.state}</span>
                </div>
              )}

              {/* Seller Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sold by</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    {product.seller.profileImage ? (
                      <img
                        src={product.seller.profileImage}
                        alt={product.seller.firstName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary-600 font-medium">
                        {product.seller.firstName?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {product.seller.firstName} {product.seller.lastName}
                      {product.seller.isVerified && (
                        <span className="ml-2 text-primary-500 text-sm">✓ Verified</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">@{product.seller.username}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!isOwnProduct && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="select w-20"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || isInUserCart}
                      className={`flex-1 btn-primary btn-lg flex items-center justify-center space-x-2 ${
                        isInUserCart ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>{isInUserCart ? 'In Cart' : 'Add to Cart'}</span>
                    </button>
                    <button className="btn-outline btn-lg flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                </div>
                <div className="text-center">
                  <Truck className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Fast Shipping</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
