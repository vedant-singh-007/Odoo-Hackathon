import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { Plus, Edit, Trash2, Eye, MoreVertical, Filter } from 'lucide-react';

import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyListingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: listingsData, isLoading, error } = useQuery(
    ['user-listings', user?.id, statusFilter],
    () => userAPI.getUserListings(user?.id, { status: statusFilter === 'all' ? undefined : statusFilter }),
    {
      enabled: !!user?.id,
    }
  );

  const listings = listingsData?.data?.listings || [];

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Implement delete listing API call
      console.log('Delete listing:', listingId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      sold: 'badge-secondary',
      pending: 'badge-warning',
      inactive: 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
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
        <title>My Listings - EcoFinds</title>
        <meta name="description" content="Manage your product listings on EcoFinds marketplace." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container-custom py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                <p className="text-gray-600 mt-1">
                  Manage your product listings and track their performance
                </p>
              </div>
              <Link
                to="/create-product"
                className="btn-primary btn-lg flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Listing</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select w-40"
              >
                <option value="all">All Listings</option>
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Listings */}
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Failed to load your listings. Please try again.</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600 mb-6">
                {statusFilter === 'all' 
                  ? "You haven't created any listings yet. Start by creating your first listing!"
                  : `No ${statusFilter} listings found.`
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing._id} className="bg-white rounded-xl shadow-soft overflow-hidden">
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {listing.primaryImage ? (
                      <img
                        src={listing.primaryImage}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                        {listing.title}
                      </h3>
                      <div className="relative ml-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-primary-600">
                        ${listing.price.toFixed(2)}
                      </span>
                      <span className={`badge ${getStatusBadge(listing.status)}`}>
                        {listing.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{listing.category}</span>
                      <span>{listing.condition}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{listing.views} views</span>
                      </div>
                      <span>
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/products/${listing._id}`}
                        className="btn-secondary btn-sm flex-1 flex items-center justify-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                      <Link
                        to={`/edit-product/${listing._id}`}
                        className="btn-primary btn-sm flex-1 flex items-center justify-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteListing(listing._id)}
                        className="btn-danger btn-sm flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {listings.length > 0 && (
            <div className="mt-12 bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Listing Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {listings.filter(l => l.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {listings.filter(l => l.status === 'sold').length}
                  </div>
                  <div className="text-sm text-gray-600">Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {listings.reduce((total, listing) => total + listing.views, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    ${listings.reduce((total, listing) => total + listing.price, 0).toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyListingsPage;
