// src/services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced request interceptor with JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecobazaar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401) {
      // Token expired or invalid - only clear if not already retrying
      if (!originalRequest._retry) {
        console.warn('Authentication failed (401), logging out...');
        localStorage.removeItem('ecobazaar_token');
        localStorage.removeItem('ecobazaar_user');
        
        // Only redirect to login if not already on login/landing page
        if (!window.location.pathname.match(/^\/(login|register|$)/)) {
          window.location.href = '/login';
        }
      }
    } else if (error.response?.status === 403) {
      // Permission denied - log but don't redirect
      console.warn('Access forbidden (403) for:', error.config.url);
      
      // If it's a critical endpoint (like cart/wishlist), we might need to refresh token
      // But for now, just log it
    }
    
    return Promise.reject(error);
  }
);
// Authentication Services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  validateToken: (token) => api.get(`/auth/validate-token/${token}`),
  getAllowedRoles: () => api.get('/auth/allowed-roles')
};

// ... rest of your existing service definitions remain the same
// (productService, cartService, orderService, etc.)


// Product Services
export const productService = {
  search: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  create: (productData) => api.post('/products/add', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id, userId) => api.delete(`/products/${id}`, { params: { userId } }),
  toggleFeatured: (id, adminId) => api.put(`/products/${id}/feature`, null, { params: { adminId } }),
  getSellerProducts: (sellerId) => api.get(`/products/seller/${sellerId}`),
  getPendingProducts: () => api.get('/products/admin/pending'),
  verifyProduct: (id, adminId) => api.put(`/products/admin/verify/${id}`, null, { params: { adminId } })
};

// Cart Services
export const cartService = {
  getCart: (userId) => api.get(`/cart/${userId}`),
  getFilteredCart: (userId, filters) => api.get(`/cart/${userId}/filtered`, { params: filters }),
  addItem: (userId, itemData) => api.post(`/cart/${userId}/items`, itemData),
  removeItem: (userId, itemId) => api.delete(`/cart/${userId}/items/${itemId}`)
};

// Order Services
export const orderService = {
  create: (userId, orderData) => api.post(`/orders/${userId}`, orderData),
  getUserOrders: (userId) => api.get(`/orders/user/${userId}`),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  getAll: () => api.get('/orders/all'),
  updateStatus: (orderId, status) => api.put(`/orders/${orderId}/status`, null, { params: { status } })
};

// Category Services
export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Wishlist Services - CORRECTED VERSION
export const wishlistService = {
  getUserWishlist: async (userId) => {
    try {
      const response = await api.get(`/wishlist/${userId}`);
      
      // If wishlist entries only have productId, fetch full product details
      const wishlistWithProducts = await Promise.all(
        response.data.map(async (item) => {
          if (item.productId && !item.product) {
            try {
              const productResponse = await api.get(`/products/${item.productId}`);
              return {
                ...item,
                product: productResponse.data
              };
            } catch (error) {
              console.error(`Failed to fetch product ${item.productId}:`, error);
              return item;
            }
          }
          return item;
        })
      );
      
      return { data: wishlistWithProducts };
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      throw error;
    }
  },
  
  // Try different endpoint patterns
  addToWishlist: (userId, productId) => {
    // Try standard pattern first, then fallback
    return api.post(`/wishlist/${userId}`, { productId });
  },
  
  removeFromWishlist: async (userId, productId) => {
    // Try multiple endpoint patterns
    const endpoints = [
      `/wishlist/${userId}/${productId}`, // Most likely based on your error
      `/wishlist/remove?userId=${userId}&productId=${productId}`,
      `/wishlist/${userId}?productId=${productId}`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔧 Trying endpoint: DELETE ${endpoint}`);
        const response = await api.delete(endpoint);
        console.log(`✅ Success with: ${endpoint}`);
        return response;
      } catch (error) {
        console.log(`❌ Failed with: ${endpoint} - ${error.response?.status}`);
        // Continue to next endpoint
      }
    }
    
    throw new Error('All endpoint patterns failed - check backend API');
  },
  
  checkWishlist: (userId, productId) => api.get(`/wishlist/${userId}/check/${productId}`)
};

// Debug function to test endpoints
export const debugWishlistEndpoints = async (userId, productId) => {
  console.log('🔍 Testing wishlist endpoints...');
  
  const testEndpoints = [
    {
      method: 'DELETE',
      url: `/wishlist/${userId}/${productId}`,
      description: 'Direct ID pattern'
    },
    {
      method: 'DELETE', 
      url: `/wishlist/remove?userId=${userId}&productId=${productId}`,
      description: 'Query params pattern'
    },
    {
      method: 'DELETE',
      url: `/wishlist/${userId}`,
      data: { productId },
      description: 'Body data pattern'
    }
  ];
  
  for (const test of testEndpoints) {
    try {
      console.log(`Testing: ${test.method} ${test.url}`);
      let response;
      if (test.method === 'DELETE') {
        response = await api.delete(test.url, test.data ? { data: test.data } : {});
      }
      console.log(`✅ ${test.description}: Success`);
      return test;
    } catch (error) {
      console.log(`❌ ${test.description}:`, error.response?.status, error.response?.data);
    }
  }
  return null;
};

// Review Services
export const reviewService = {
  addReview: (reviewData) => api.post('/reviews', reviewData),
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  deleteReview: (id, userId) => api.delete(`/reviews/${id}`, { params: { userId } })
};
export const dashboardService = {
  getUserDashboard: (userId) => api.get(`/dashboard/user/${userId}`),
  getUserStats: (userId) => api.get(`/dashboard/user/${userId}/stats`),
  getUserAchievements: (userId) => api.get(`/dashboard/user/${userId}/achievements`),
  getUserCarbonTips: (userId) => api.get(`/dashboard/user/${userId}/tips`),
  getUserCarbonTrend: (userId) => api.get(`/dashboard/user/${userId}/carbon-trend`),
  getUserCategoryBreakdown: (userId) => api.get(`/dashboard/user/${userId}/category-breakdown`),
  getUserEcoRatingDistribution: (userId) => api.get(`/dashboard/user/${userId}/eco-rating-distribution`),
  getUserRecentOrders: (userId, limit = 10) => api.get(`/dashboard/user/${userId}/recent-orders`, { params: { limit } }),
  
  getSellerDashboard: (sellerId) => api.get(`/dashboard/seller/${sellerId}`),
  getSellerStats: (sellerId) => api.get(`/dashboard/seller/${sellerId}/stats`),
  getSellerTopProducts: (sellerId, limit = 5) => api.get(`/dashboard/seller/${sellerId}/top-products`, { params: { limit } }),
  getSalesByCategory: (sellerId) => api.get(`/dashboard/seller/${sellerId}/sales-by-category`),
  getRevenueBreakdown: (sellerId) => api.get(`/dashboard/seller/${sellerId}/revenue-breakdown`),
  
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getPlatformStats: () => api.get('/dashboard/admin/platform-stats'),
  getPendingVerifications: () => api.get('/dashboard/admin/pending-verifications'),
  getTopSellers: (limit = 10) => api.get('/dashboard/admin/top-sellers', { params: { limit } }),
  getRecentActivities: (limit = 10) => api.get('/dashboard/admin/recent-activities', { params: { limit } }),
  getCarbonImpact: () => api.get('/dashboard/admin/carbon-impact'),
  getUserRoleDistribution: () => api.get('/dashboard/admin/user-role-distribution')
};

// Carbon Analytics Services - CORRECTED based on Swagger
export const carbonService = {
  getUserCarbonReport: (userId) => api.get(`/carbon/report/${userId}`),
  exportCarbonReport: (userId, format = 'txt') => api.get(`/carbon/report/${userId}/export`, { 
    params: { format },
    responseType: format === 'pdf' ? 'blob' : 'text'
  }),
  getPlatformSummary: () => api.get('/carbon/admin/summary')
};

// NEW SERVICES based on Swagger endpoints
export const communityService = {
  getCarbonLeaderboard: (limit = 10) => api.get('/community/carbon-leaderboard', { params: { limit } })
};

export const productComparisonService = {
  compareWithAlternatives: (id) => api.get(`/products/${productId}/compare`)
};

export default api;
