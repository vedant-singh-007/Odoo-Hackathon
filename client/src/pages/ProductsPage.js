import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { Search, Filter, SlidersHorizontal, Grid, List, SortAsc } from 'lucide-react';

import { productAPI } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery(
    ['products', filters],
    () => productAPI.getProducts(filters),
    {
      keepPreviousData: true,
    }
  );

  // Fetch categories
  const { data: categoriesData } = useQuery(
    'categories',
    () => productAPI.getCategories(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      sortBy: 'newest',
    });
    setSearchParams({});
  };

  const products = productsData?.data?.products || [];
  const categories = categoriesData?.data?.categories || [];
  const pagination = productsData?.data?.pagination;

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
  ];

  return (
    <>
      <Helmet>
        <title>Products - EcoFinds</title>
        <meta name="description" content="Browse sustainable second-hand products on EcoFinds marketplace." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container-custom py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {filters.q ? `Search results for "${filters.q}"` : 'All Products'}
                </h1>
                {pagination && (
                  <p className="text-gray-600 mt-1">
                    {pagination.total} products found
                  </p>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-soft p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={filters.q}
                        onChange={(e) => handleFilterChange('q', e.target.value)}
                        className="input pl-10"
                        placeholder="Search products..."
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="select w-full"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category._id} ({category.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="input"
                        placeholder="Min price"
                      />
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="input"
                        placeholder="Max price"
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      value={filters.condition}
                      onChange={(e) => handleFilterChange('condition', e.target.value)}
                      className="select w-full"
                    >
                      <option value="">All Conditions</option>
                      {conditions.map((condition) => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="select w-full"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile Filters */}
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters & Sort</span>
                </button>

                {showFilters && (
                  <div className="mt-4 bg-white rounded-xl shadow-soft p-4">
                    {/* Mobile filter content - same as sidebar but compact */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Search
                        </label>
                        <input
                          type="text"
                          value={filters.q}
                          onChange={(e) => handleFilterChange('q', e.target.value)}
                          className="input"
                          placeholder="Search products..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="select w-full"
                          >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category._id}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sort By
                          </label>
                          <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="select w-full"
                          >
                            {sortOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Results */}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Failed to load products. Please try again.</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or browse all products.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Products Grid */}
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1'
                  }`}>
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => handleFilterChange('page', pagination.current - 1)}
                          disabled={pagination.current <= 1}
                          className="btn-secondary btn-sm disabled:opacity-50"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handleFilterChange('page', page)}
                              className={`btn-sm ${
                                page === pagination.current 
                                  ? 'btn-primary' 
                                  : 'btn-secondary'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handleFilterChange('page', pagination.current + 1)}
                          disabled={pagination.current >= pagination.pages}
                          className="btn-secondary btn-sm disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
