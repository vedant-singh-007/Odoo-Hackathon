import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  DollarSign, 
  Tag, 
  FileText,
  Image as ImageIcon
} from 'lucide-react';

import { productAPI } from '../services/api';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm();

  const categories = [
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
  ];

  const conditions = [
    'New',
    'Like New',
    'Good',
    'Fair',
    'Poor'
  ];

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: e.target.result,
          file,
          isPrimary: prev.length === 0
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== imageId);
      // If we removed the primary image, make the first remaining image primary
      if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  };

  const setPrimaryImage = (imageId) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    })));
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      setError('images', {
        type: 'manual',
        message: 'Please upload at least one image'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        ...data,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
        images: images.map(img => ({
          url: img.url,
          isPrimary: img.isPrimary,
          caption: img.caption || ''
        }))
      };

      await productAPI.createProduct(productData);
      navigate('/my-listings');
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Failed to create product'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Product - EcoFinds</title>
        <meta name="description" content="List a new product for sale on EcoFinds marketplace." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container-custom py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Basic Information
                </h2>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title *
                    </label>
                    <input
                      {...register('title', {
                        required: 'Product title is required',
                        minLength: {
                          value: 3,
                          message: 'Title must be at least 3 characters'
                        },
                        maxLength: {
                          value: 100,
                          message: 'Title must be less than 100 characters'
                        }
                      })}
                      type="text"
                      className={`input ${errors.title ? 'input-error' : ''}`}
                      placeholder="Enter a descriptive title for your product"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description', {
                        required: 'Product description is required',
                        minLength: {
                          value: 10,
                          message: 'Description must be at least 10 characters'
                        },
                        maxLength: {
                          value: 1000,
                          message: 'Description must be less than 1000 characters'
                        }
                      })}
                      rows={4}
                      className={`textarea ${errors.description ? 'input-error' : ''}`}
                      placeholder="Describe your product in detail. Include condition, features, and any relevant information."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Category & Subcategory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        {...register('category', {
                          required: 'Please select a category'
                        })}
                        className={`select ${errors.category ? 'input-error' : ''}`}
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory
                      </label>
                      <input
                        {...register('subcategory')}
                        type="text"
                        className="input"
                        placeholder="e.g., Smartphones, Laptops"
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      {...register('condition', {
                        required: 'Please select condition'
                      })}
                      className={`select ${errors.condition ? 'input-error' : ''}`}
                    >
                      <option value="">Select Condition</option>
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                    {errors.condition && (
                      <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <div className="relative">
                      <input
                        {...register('price', {
                          required: 'Price is required',
                          min: {
                            value: 0.01,
                            message: 'Price must be greater than $0'
                          },
                          max: {
                            value: 100000,
                            message: 'Price must be less than $100,000'
                          }
                        })}
                        type="number"
                        step="0.01"
                        className={`input pl-10 ${errors.price ? 'input-error' : ''}`}
                        placeholder="0.00"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price (Optional)
                    </label>
                    <div className="relative">
                      <input
                        {...register('originalPrice', {
                          min: {
                            value: 0.01,
                            message: 'Original price must be greater than $0'
                          }
                        })}
                        type="number"
                        step="0.01"
                        className="input pl-10"
                        placeholder="0.00"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Show the original price to highlight savings</p>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Product Images
                </h2>

                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Upload Product Images
                      </p>
                      <p className="text-sm text-gray-500">
                        Drag and drop images here, or click to select
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        PNG, JPG, GIF up to 5MB each
                      </p>
                    </label>
                  </div>

                  {/* Image Preview */}
                  {images.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Uploaded Images ({images.length})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={image.url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Primary Badge */}
                            {image.isPrimary && (
                              <div className="absolute top-2 left-2">
                                <span className="badge badge-primary text-xs">Primary</span>
                              </div>
                            )}
                            
                            {/* Actions */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(image.id)}
                                disabled={image.isPrimary}
                                className="btn-primary btn-sm disabled:opacity-50"
                              >
                                {image.isPrimary ? 'Primary' : 'Set Primary'}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(image.id)}
                                className="btn-danger btn-sm"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.images && (
                    <p className="text-sm text-red-600">{errors.images.message}</p>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Additional Details
                </h2>

                <div className="space-y-6">
                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Features
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          {...register('features.brand')}
                          type="text"
                          className="input"
                          placeholder="Brand"
                        />
                      </div>
                      <div>
                        <input
                          {...register('features.model')}
                          type="text"
                          className="input"
                          placeholder="Model"
                        />
                      </div>
                      <div>
                        <input
                          {...register('features.size')}
                          type="text"
                          className="input"
                          placeholder="Size"
                        />
                      </div>
                      <div>
                        <input
                          {...register('features.color')}
                          type="text"
                          className="input"
                          placeholder="Color"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (Optional)
                    </label>
                    <input
                      {...register('tags')}
                      type="text"
                      className="input"
                      placeholder="vintage, eco-friendly, handmade (comma separated)"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Add tags to help buyers find your product
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary btn-lg flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary btn-lg flex-1 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Create Listing</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateProductPage;
