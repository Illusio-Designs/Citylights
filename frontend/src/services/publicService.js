// Public API Service
// Handles user-facing API calls

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const publicAuthService = {
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
  register: (data) => axios.post(`${API_URL}/auth/register`, data),
};

export const publicProductService = {
  getProducts: () => axios.get(`${API_URL}/products`),
  getProductById: (id) => axios.get(`${API_URL}/products/${id}`),
};

export const publicCollectionService = {
  getCollections: () => axios.get(`${API_URL}/collections`),
  getCollectionById: (id) => axios.get(`${API_URL}/collections/${id}`),
};

export const publicStoreService = {
  getStores: () => axios.get(`${API_URL}/stores`),
  getStoreById: (id) => axios.get(`${API_URL}/stores/${id}`),
};

export const publicReviewService = {
  getReviews: (productId) => axios.get(`${API_URL}/reviews/product/${productId}`),
  addReview: (productId, data) => axios.post(`${API_URL}/reviews/product/${productId}`, data),
};

export const publicUserService = {
  getUserProfile: (id) => axios.get(`${API_URL}/users/${id}`),
  updateUserProfile: (id, data) => axios.put(`${API_URL}/users/${id}`, data),
}; 