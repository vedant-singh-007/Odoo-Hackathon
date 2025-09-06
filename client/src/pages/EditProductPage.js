import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Save, 
  DollarSign, 
  Tag, 
  FileText,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';

import { productAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ImageQualityChecker from '../components/common/ImageQualityChecker';
import BlurryImageModal from '../components/common/BlurryImageModal';
import { analyzeImages, BLUR_CONFIG } from '../utils/imageQualityChecker';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBlurryModal, setShowBlurryModal] = useState(false);
  const [blurryImages, setBlurryImages] = useState([]);
  const [isAnalyzingImages, setIsAnalyzingImages] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    reset,
  } = useForm();

  // Fetch product details
  const { data: productData, isLoading, error } = useQuery(
    ['product', id],
    () => productAPI.getProduct(id),
    {
      enabled: !!id,
      onSuccess: (data) => {
        const product = data.data.product;
        reset({
          title: product.title,
          description: product.description,
          category: product.category,
          subcategory: product.subcategory || '',
          condition: product.condition,
          price: product.price,
          originalPrice: product.originalPrice || '',
          'features.brand': product.features?.brand || '',
          'features.model': product.features?.model || '',
          'features.size': product.features?.size || '',
          'features.color': product.features?.color || '',
          tags: product.tags?.join(', ') || '',
        });
        
        // Set existing images
        setImages(product.images?.map((img, index) => ({
          id: `existing-${index}`,
          url: img.url,
          isPrimary: img.isPrimary,
          caption: img.caption || '',
          isExisting: true
        })) || []);
      }
    }
  );

  const product = productData?.data?.product;

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

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size must be less than 5MB');
        continue;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const newImage = {
          id: `new-${Date.now()}-${Math.random()}`,
          url: e.target.result,
          file,
          isPrimary: images.length === 0
        };
        
        setImages(prev => [...prev, newImage]);
        
        // Analyze image quality after adding to state
        setTimeout(() => {
          analyzeImageQuality([newImage]);
        }, 100);
      };
      reader.readAsDataURL(file);
    }
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

  const analyzeImageQuality = async (imagesToAnalyze) => {
    if (!imagesToAnalyze || imagesToAnalyze.length === 0) return;
    
    setIsAnalyzingImages(true);
    
    try {
      const results = await analyzeImages(imagesToAnalyze, BLUR_CONFIG.threshold);
      const blurryImagesFound = results.filter(result => result.blurAnalysis?.isBlurry);
      
      if (blurryImagesFound.length > 0) {
        setBlurryImages(blurryImagesFound);
        setShowBlurryModal(true);
      }
      
      // Update images with analysis results
      setImages(prev => prev.map(img => {
        const analysisResult = results.find(r => r.id === img.id);
        return analysisResult ? { ...img, blurAnalysis: analysisResult.blurAnalysis } : img;
      }));
    } catch (error) {
      console.error('Image quality analysis failed:', error);
    } finally {
      setIsAnalyzingImages(false);
    }
  };

  const handleRemoveBlurryImages = () => {
    const blurryImageIds = blurryImages.map(img => img.id);
    setImages(prev => prev.filter(img => !blurryImageIds.includes(img.id)));
    setBlurryImages([]);
  };

  const handleRemoveBlurryImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setBlurryImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleKeepBlurryImages = () => {
    setBlurryImages([]);
  };

  const handleRetakePhotos = () => {
    // Clear all images and focus on file input
    setImages([]);
    setBlurryImages([]);
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.click();
    }
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

      await productAPI.updateProduct(id, productData);
      navigate('/my-listings');
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Failed to update product'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await productAPI.deleteProduct(id);
      navigate('/my-listings');
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Failed to delete product'
      });
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
          <p className="text-gray-600 mb-6">The product you're trying to edit doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/my-listings')}
            className="btn-primary"
          >
            Back to My Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit {product.title} - EcoFinds</title>
        <meta name="description" content="Edit your product listing on EcoFinds marketplace." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              </div>
              <button
                onClick={handleDelete}
                className="btn-danger btn-sm flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
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
                        Add More Images
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
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700">
                          Product Images ({images.length})
                        </h3>
                        {isAnalyzingImages && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                            <span>Analyzing quality...</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {images.map((image, index) => (
                          <div key={image.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="relative group mb-3">
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
                            
                            {/* Image Quality Checker */}
                            <ImageQualityChecker
                              imageUrl={image.url}
                              onQualityCheck={(result) => {
                                setImages(prev => prev.map(img => 
                                  img.id === image.id ? { ...img, blurAnalysis: result } : img
                                ));
                              }}
                              showDetails={false}
                              threshold={BLUR_CONFIG.threshold}
                            />
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Blurry Image Modal */}
      <BlurryImageModal
        isOpen={showBlurryModal}
        onClose={() => setShowBlurryModal(false)}
        onRetake={handleRetakePhotos}
        blurryImages={blurryImages}
        onRemoveBlurry={handleRemoveBlurryImages}
        onKeepAnyway={handleKeepBlurryImages}
      />
    </>
  );
};

export default EditProductPage;
