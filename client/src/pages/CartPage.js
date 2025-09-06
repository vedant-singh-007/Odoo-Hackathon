import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  Package,
  Truck,
  Shield
} from 'lucide-react';

import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CartPage = () => {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    isLoading, 
    isUpdating,
    updateItemQuantity, 
    removeItem,
    clearCart 
  } = useCart();
  
  const { isAuthenticated } = useAuth();

  const handleQuantityChange = async (productId, newQuantity) => {
    await updateItemQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    await removeItem(productId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
      await clearCart();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shopping Cart - EcoFinds</title>
        <meta name="description" content="Review and manage items in your EcoFinds shopping cart." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container-custom py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-gray-600 mt-1">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              {items.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="btn-ghost text-red-600 hover:text-red-700"
                >
                  Clear Cart
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          {items.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Start shopping to find amazing sustainable products!
              </p>
              <Link
                to="/products"
                className="btn-primary btn-lg"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.product._id} className="bg-white rounded-xl shadow-soft p-6">
                    <div className="flex space-x-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.primaryImage ? (
                          <img
                            src={item.product.primaryImage}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              to={`/products/${item.product._id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                            >
                              {item.product.title}
                            </Link>
                            <p className="text-gray-600 mt-1">{item.product.category}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Sold by {item.product.seller.firstName} {item.product.seller.lastName}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="text-gray-400 hover:text-red-600 transition-colors ml-4"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || isUpdating}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 text-center min-w-[3rem]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                disabled={item.quantity >= 99 || isUpdating}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="text-sm text-gray-500">
                              ${item.product.price.toFixed(2)} each
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {item.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Note:</span> {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-soft p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                      <span className="font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-semibold">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    className="btn-primary btn-lg w-full flex items-center justify-center space-x-2"
                    disabled={!isAuthenticated}
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {!isAuthenticated && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Please <Link to="/login" className="text-primary-600 hover:text-primary-700">sign in</Link> to checkout
                    </p>
                  )}

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <Shield className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Secure</p>
                      </div>
                      <div>
                        <Truck className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Fast</p>
                      </div>
                      <div>
                        <Package className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Quality</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;
