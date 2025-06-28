// Admin API Service
// Handles admin/dashboard API calls

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const adminAuthService = {
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
};

export const adminProductService = {
  getProducts: () => axios.get(`${API_URL}/products`),
  getProductById: (id) => axios.get(`${API_URL}/products/${id}`),
  createProduct: (data) => axios.post(`${API_URL}/products`, data),
  updateProduct: (id, data) => axios.put(`${API_URL}/products/${id}`, data),
  deleteProduct: (id) => axios.delete(`${API_URL}/products/${id}`),
};

export const adminCollectionService = {
  getCollections: () => axios.get(`${API_URL}/collections`),
  getCollectionById: (id) => axios.get(`${API_URL}/collections/${id}`),
  createCollection: (data) => axios.post(`${API_URL}/collections`, data),
  updateCollection: (id, data) => axios.put(`${API_URL}/collections/${id}`, data),
  deleteCollection: (id) => axios.delete(`${API_URL}/collections/${id}`),
};

export const adminStoreService = {
  getStores: () => axios.get(`${API_URL}/stores`),
  getStoreById: (id) => axios.get(`${API_URL}/stores/${id}`),
  createStore: (data) => axios.post(`${API_URL}/stores`, data),
  updateStore: (id, data) => axios.put(`${API_URL}/stores/${id}`, data),
  deleteStore: (id) => axios.delete(`${API_URL}/stores/${id}`),
};

export const adminReviewService = {
  getReviews: () => axios.get(`${API_URL}/reviews`),
  deleteReview: (id) => axios.delete(`${API_URL}/reviews/${id}`),
};

export const adminUserService = {
  getUsers: () => axios.get(`${API_URL}/users`),
  getUserById: (id) => axios.get(`${API_URL}/users/${id}`),
  updateUser: (id, data) => axios.put(`${API_URL}/users/${id}`, data),
  deleteUser: (id) => axios.delete(`${API_URL}/users/${id}`),
}; 