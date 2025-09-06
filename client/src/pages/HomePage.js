import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { ArrowRight, Leaf, Recycle, Users, TrendingUp, Shield, Heart } from 'lucide-react';

import { productAPI } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage = () => {
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useQuery(
    'featured-products',
    () => productAPI.getFeaturedProducts(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: categories, isLoading: isLoadingCategories } = useQuery(
    'categories',
    () => productAPI.getCategories(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const features = [
    {
      icon: Leaf,
      title: 'Sustainable Shopping',
      description: 'Every purchase reduces waste and promotes circular economy principles.',
    },
    {
      icon: Shield,
      title: 'Verified Sellers',
      description: 'All sellers are verified to ensure quality and trust in every transaction.',
    },
    {
      icon: Heart,
      title: 'Community Driven',
      description: 'Join thousands of eco-conscious individuals making a positive impact.',
    },
    {
      icon: Recycle,
      title: 'Zero Waste Goal',
      description: 'Help us achieve our mission of zero waste through sustainable consumption.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Items Saved', icon: Recycle },
    { number: '5,000+', label: 'Happy Users', icon: Users },
    { number: '25,000kg', label: 'CO₂ Reduced', icon: TrendingUp },
    { number: '500+', label: 'Trees Saved', icon: Leaf },
  ];

  return (
    <>
      <Helmet>
        <title>EcoFinds - Sustainable Second-Hand Marketplace</title>
        <meta 
          name="description" 
          content="Buy and sell pre-owned items to reduce waste and promote a circular economy. Join EcoFinds for sustainable shopping." 
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-eco text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container-custom relative z-10">
            <div className="py-20 lg:py-32">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 animate-fade-in">
                  Sustainable Shopping
                  <br />
                  <span className="text-yellow-300">Made Simple</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-slide-up">
                  Join thousands of eco-conscious individuals buying and selling pre-owned items. 
                  Every purchase makes a difference for our planet.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                  <Link
                    to="/products"
                    className="btn-lg bg-white text-primary-600 hover:bg-gray-100 font-semibold inline-flex items-center justify-center"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/create-product"
                    className="btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold inline-flex items-center justify-center"
                  >
                    Start Selling
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-white/10 rounded-full animate-pulse delay-2000"></div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover amazing pre-owned items from our community of eco-conscious sellers
              </p>
            </div>

            {isLoadingFeatured ? (
              <div className="flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {featuredProducts?.data?.products?.slice(0, 8).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            <div className="text-center">
              <Link
                to="/products"
                className="btn-primary btn-lg inline-flex items-center"
              >
                View All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Find exactly what you're looking for in our organized categories
              </p>
            </div>

            {isLoadingCategories ? (
              <div className="flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories?.data?.categories?.slice(0, 12).map((category) => (
                  <Link
                    key={category._id}
                    to={`/products?category=${encodeURIComponent(category._id)}`}
                    className="group bg-gray-50 rounded-xl p-6 text-center hover:bg-primary-50 transition-colors"
                  >
                    <div className="text-2xl mb-3">📱</div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {category._id}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {category.count} items
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose EcoFinds?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We're committed to making sustainable shopping accessible and rewarding
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-eco text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our community today and start your sustainable shopping journey. 
              Every item you buy or sell helps reduce waste and protect our planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-lg bg-white text-primary-600 hover:bg-gray-100 font-semibold"
              >
                Get Started Free
              </Link>
              <Link
                to="/how-it-works"
                className="btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
