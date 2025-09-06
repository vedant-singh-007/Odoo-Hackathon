import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      try {
        const refreshResponse = await authAPI.refreshToken();
        const newToken = refreshResponse.data.token;
        localStorage.setItem('token', newToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  verifyToken: () => api.post('/auth/verify-token'),
  refreshToken: () => api.post('/auth/refresh'),
};

// User API
export const userAPI = {
  getProfile: (userId) => api.get(`/users/profile/${userId}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getUserListings: (userId, params) => api.get(`/users/${userId}/listings`, { params }),
  getUserPurchases: (userId, params) => api.get(`/users/${userId}/purchases`, { params }),
  getUserSales: (userId, params) => api.get(`/users/${userId}/sales`, { params }),
  deleteAccount: () => api.delete('/users/account'),
};

// Product API
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getFeaturedProducts: () => api.get('/products/featured'),
  getCategories: () => api.get('/products/categories'),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  likeProduct: (id) => api.post(`/products/${id}/like`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (productId, quantity, notes) => 
    api.post('/cart/add', { productId, quantity, notes }),
  updateItemQuantity: (productId, quantity) => 
    api.put(`/cart/update/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
  getCartCount: () => api.get('/cart/count'),
};

// Purchase API
export const purchaseAPI = {
  createPurchase: (purchaseData) => api.post('/purchases', purchaseData),
  createPurchaseFromCart: (purchaseData) => 
    api.post('/purchases/from-cart', purchaseData),
  getPurchases: (params) => api.get('/purchases', { params }),
  getPurchase: (id) => api.get(`/purchases/${id}`),
  updatePurchaseStatus: (id, status) => 
    api.put(`/purchases/${id}/status`, { status }),
  getSales: (params) => api.get('/purchases/sales', { params }),
  getPurchaseStats: () => api.get('/purchases/stats'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
    };
  }
};

// File upload utility
export const uploadFile = async (file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// Search utility
export const searchProducts = async (query, filters = {}) => {
  const params = {
    q: query,
    ...filters,
  };
  
  return productAPI.getProducts(params);
};

// Pagination utility
export const createPaginationParams = (page = 1, limit = 12) => ({
  page,
  limit,
});

// Sort utility
export const createSortParams = (sortBy = 'newest') => ({
  sortBy,
});

// Filter utility
export const createFilterParams = (filters = {}) => {
  const params = {};
  
  if (filters.category) params.category = filters.category;
  if (filters.minPrice) params.minPrice = filters.minPrice;
  if (filters.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters.condition) params.condition = filters.condition;
  
  return params;
};

export default api;
