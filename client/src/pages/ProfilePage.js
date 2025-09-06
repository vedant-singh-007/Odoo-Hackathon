import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Shield,
  Star,
  Package,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const targetUserId = userId || currentUser?.id;

  const { data: profileData, isLoading, error } = useQuery(
    ['user-profile', targetUserId],
    () => userAPI.getProfile(targetUserId),
    {
      enabled: !!targetUserId,
    }
  );

  const profile = profileData?.data?.user;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">The user profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile.fullName || profile.username} - EcoFinds</title>
        <meta name="description" content={`View ${profile.fullName || profile.username}'s profile on EcoFinds.`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Profile Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container-custom py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.fullName || profile.username}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary-600" />
                  )}
                </div>
                {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile.fullName || `${profile.firstName} ${profile.lastName}`}
                  </h1>
                  {profile.isVerified && (
                    <span className="badge badge-primary">Verified</span>
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-2">@{profile.username}</p>
                
                {profile.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{profile.bio}</p>
                )}

                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                  {profile.stats && (
                    <>
                      <div className="flex items-center space-x-1">
                        <Package className="w-4 h-4" />
                        <span>{profile.stats.activeListings || 0} listings</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>{profile.stats.rating || 0}/5 rating</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              {isOwnProfile && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <div className="space-y-4">
                  {profile.bio ? (
                    <p className="text-gray-700">{profile.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">
                      {isOwnProfile ? 'Add a bio to tell others about yourself' : 'No bio available'}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    {profile.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{profile.email}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{profile.phone}</span>
                      </div>
                    )}
                    {profile.address && (
                      <div className="flex items-center space-x-3 md:col-span-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">
                          {profile.address.street}, {profile.address.city}, {profile.address.state} {profile.address.zipCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Listings */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Listings</h2>
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/my-listings')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  )}
                </div>
                
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {isOwnProfile 
                      ? 'You haven\'t created any listings yet'
                      : 'This user hasn\'t created any public listings'
                    }
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/create-product')}
                      className="btn-primary mt-4"
                    >
                      Create Your First Listing
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              {profile.stats && (
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-primary-600" />
                        <span className="text-gray-700">Total Listings</span>
                      </div>
                      <span className="font-semibold">{profile.stats.totalListings || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">Total Sales</span>
                      </div>
                      <span className="font-semibold">{profile.stats.totalSales || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">Total Purchases</span>
                      </div>
                      <span className="font-semibold">{profile.stats.totalPurchases || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-600" />
                        <span className="text-gray-700">Rating</span>
                      </div>
                      <span className="font-semibold">
                        {profile.stats.rating ? `${profile.stats.rating}/5` : 'No rating'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Actions */}
              {!isOwnProfile && (
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                  <div className="space-y-3">
                    <button className="btn-primary w-full">
                      Send Message
                    </button>
                    <button className="btn-secondary w-full">
                      View All Listings
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {isOwnProfile && (
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/create-product')}
                      className="btn-primary w-full"
                    >
                      Create New Listing
                    </button>
                    <button
                      onClick={() => navigate('/my-listings')}
                      className="btn-secondary w-full"
                    >
                      Manage Listings
                    </button>
                    <button
                      onClick={() => navigate('/purchases')}
                      className="btn-secondary w-full"
                    >
                      Purchase History
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
