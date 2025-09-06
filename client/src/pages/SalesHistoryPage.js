import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { 
  CreditCard, 
  Calendar, 
  User, 
  Package,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

import { purchaseAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SalesHistoryPage = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: salesData, isLoading, error } = useQuery(
    ['user-sales', user?.id, statusFilter],
    () => purchaseAPI.getSales({ status: statusFilter === 'all' ? undefined : statusFilter }),
    {
      enabled: !!user?.id,
    }
  );

  const sales = salesData?.data?.sales || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
        <title>Sales History - EcoFinds</title>
        <meta name="description" content="View your sales history and earnings on EcoFinds marketplace." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container-custom py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
                <p className="text-gray-600 mt-1">
                  Track your sales and manage your earnings
                </p>
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select w-40"
                >
                  <option value="all">All Sales</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Failed to load sales history. Please try again.</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No sales found</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {statusFilter === 'all' 
                  ? "You haven't made any sales yet. Create listings to start selling!"
                  : `No ${statusFilter} sales found.`
                }
              </p>
              <Link
                to="/create-product"
                className="btn-primary btn-lg"
              >
                Create Your First Listing
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {sales.map((sale) => (
                <div key={sale._id} className="bg-white rounded-xl shadow-soft p-6">
                  {/* Sale Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Sale #{sale._id.slice(-8).toUpperCase()}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>Sold to {sale.buyer.firstName} {sale.buyer.lastName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sale.status)}`}>
                        {getStatusIcon(sale.status)}
                        <span className="capitalize">{sale.status}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          +${sale.finalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sold Items */}
                  <div className="space-y-4">
                    {sale.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.primaryImage ? (
                            <img
                              src={item.product.primaryImage}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.product.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.priceAtPurchase.toFixed(2)}
                          </p>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            +${(item.priceAtPurchase * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Buyer Information */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Buyer Information</h4>
                        <p className="text-gray-600">
                          {sale.buyer.firstName} {sale.buyer.lastName} (@{sale.buyer.username})
                        </p>
                        {sale.buyer.isVerified && (
                          <span className="inline-block mt-1 text-xs text-primary-600 font-medium">
                            ✓ Verified Buyer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-6 border-t flex justify-end space-x-3">
                    <button className="btn-secondary btn-sm">
                      View Details
                    </button>
                    {sale.status === 'pending' && (
                      <button className="btn-primary btn-sm">
                        Confirm Order
                      </button>
                    )}
                    {sale.status === 'confirmed' && (
                      <button className="btn-primary btn-sm">
                        Mark as Shipped
                      </button>
                    )}
                    {sale.status === 'delivered' && (
                      <button className="btn-secondary btn-sm">
                        Contact Buyer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Statistics */}
          {sales.length > 0 && (
            <div className="mt-12 bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {sales.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {sales.filter(s => s.status === 'delivered').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {sales.filter(s => ['pending', 'confirmed', 'shipped'].includes(s.status)).length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${sales.reduce((total, sale) => total + sale.finalAmount, 0).toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Earned</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SalesHistoryPage;
