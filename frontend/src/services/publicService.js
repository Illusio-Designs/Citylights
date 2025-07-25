// Public API Service
// Handles user-facing API calls

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const publicAuthService = {
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
  register: (data) => axios.post(`${API_URL}/auth/register`, data),
};

export const publicProductService = {
  getProducts: () => axios.get(`${API_URL}/products`),
  getProductByName: (name) => axios.get(`${API_URL}/products/${encodeURIComponent(name)}`),
};

export const publicCollectionService = {
  getCollections: () => axios.get(`${API_URL}/collections`),
  getCollectionById: (id) => axios.get(`${API_URL}/collections/${id}`),
};

export const publicStoreService = {
  getStores: () => axios.get(`${API_URL}/stores`),
  getStoreByName: (name) => axios.get(`${API_URL}/stores/${encodeURIComponent(name)}`),
};

export const publicReviewService = {
  getStoreReviews: (storeId) => axios.get(`${API_URL}/reviews/store/${storeId}`),
  getProductReviews: (productId) => axios.get(`${API_URL}/reviews/product/${productId}`),
  addStoreReview: (storeId, data) => axios.post(`${API_URL}/reviews`, { ...data, store_id: storeId }),
  addProductReview: (productId, data) => axios.post(`${API_URL}/reviews`, { ...data, product_id: productId }),
};

export const publicUserService = {
  getUserProfile: (id) => axios.get(`${API_URL}/users/${id}`),
  updateUserProfile: (id, data) => axios.put(`${API_URL}/users/${id}`, data),
};

export const publicSliderService = {
  getSliders: () => axios.get(`${API_URL}/sliders`),
  getSliderById: (id) => axios.get(`${API_URL}/sliders/${id}`),
};
