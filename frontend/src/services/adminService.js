// Admin API Service
// Handles admin/dashboard API calls

import axios from "axios";

// Use live API URL - ensure empty strings or localhost are ignored
const envApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (envApiUrl && envApiUrl.trim() && !envApiUrl.includes('localhost')) 
  ? envApiUrl 
  : "https://api.viveralighting.com/api";

// Create axios instance with default config
const adminApi = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored data and redirect to login
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/dashboard/login";
    }
    return Promise.reject(error);
  }
);

export const adminAuthService = {
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    return Promise.resolve({ message: "Logged out successfully" });
  },
  getCurrentUser: () => {
    const user = localStorage.getItem("admin_user");
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem("admin_token");
  },
};

export const adminProductService = {
  getProducts: () =>
    adminApi.get(`/products`).then((res) => ({ data: res.data.data })),
  getProductById: (id) =>
    adminApi.get(`/products/${id}`).then((res) => ({ data: res.data.data })),
  createProduct: (formData) => {
    // Use the FormData directly instead of creating a new one
    return adminApi
      .post(`/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => ({ data: res.data }));
  },
  updateProduct: (id, formData) => {
    // Use the FormData directly instead of creating a new one
    return adminApi
      .put(`/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => ({ data: res.data }));
  },
  deleteProduct: (id) => {
    console.log("adminService.deleteProduct called with id:", id);
    return adminApi.delete(`/products/${id}`).then(response => {
      console.log("adminService.deleteProduct response:", response);
      return response;
    }).catch(error => {
      console.error("adminService.deleteProduct error:", error);
      throw error;
    });
  },
  deleteProductImage: (imageId) => {
    console.log("adminService.deleteProductImage called with imageId:", imageId);
    return adminApi.delete(`/products/images/${imageId}`).then(response => {
      console.log("adminService.deleteProductImage response:", response);
      return response;
    }).catch(error => {
      console.error("adminService.deleteProductImage error:", error);
      throw error;
    });
  },
  getFilterOptions: () => adminApi.get(`/products/filter-options`),
};

export const adminCollectionService = {
  getCollections: () => adminApi.get(`/collections`),
  getCollectionById: (id) => adminApi.get(`/collections/${id}`),
  createCollection: (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    if (data.image instanceof File) {
      formData.append("image", data.image);
    }
    return adminApi.post(`/collections`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateCollection: (id, data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    if (data.image instanceof File) {
      formData.append("image", data.image);
    }
    return adminApi.put(`/collections/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteCollection: (id) => adminApi.delete(`/collections/${id}`),
};

export const adminStoreService = {
  getStores: () => adminApi.get(`/stores`),
  getStoreById: (id) => adminApi.get(`/stores/${id}`),
  createStore: (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("address", data.address || "");
    formData.append("phone", data.phone || "");
    formData.append("whatsapp_number", data.whatsapp_number || "");
    formData.append("email", data.email || "");
    formData.append("map_location_url", data.map_location_url || "");
    formData.append("shop_timings", data.shop_timings || "");

    if (data.logo instanceof File) {
      formData.append("store_logo", data.logo);
    }

    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        if (image instanceof File) {
          formData.append("store_image", image);
        }
      });
    }

    return adminApi.post(`/stores`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateStore: (id, data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("address", data.address || "");
    formData.append("phone", data.phone || "");
    formData.append("whatsapp_number", data.whatsapp_number || "");
    formData.append("email", data.email || "");
    formData.append("map_location_url", data.map_location_url || "");
    formData.append("shop_timings", data.shop_timings || "");

    if (data.logo instanceof File) {
      formData.append("store_logo", data.logo);
    }

    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        if (image instanceof File) {
          formData.append("store_image", image);
        }
      });
    }

    return adminApi.put(`/stores/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteStore: (id) => adminApi.delete(`/stores/${id}`),
};

export const adminReviewService = {
  getReviews: () => adminApi.get(`/reviews`),
  getPendingReviews: () => adminApi.get(`/reviews/pending`),
  getReviewById: (id) => adminApi.get(`/reviews/${id}`),
  createReview: (data) => adminApi.post(`/reviews`, data),
  updateReview: (id, data) => adminApi.put(`/reviews/${id}`, data),
  deleteReview: (id) => adminApi.delete(`/reviews/${id}`),
  approveReview: (id) => adminApi.put(`/reviews/${id}/approve`),
  rejectReview: (id) => adminApi.put(`/reviews/${id}/reject`),
};

export const adminUserService = {
  getUsers: (filters = {}) => {
    const params = {};
    if (filters.userType) params.userType = filters.userType;
    if (filters.status) params.status = filters.status;
    return adminApi.get(`/users`, { params });
  },
  getUserById: (id) => adminApi.get(`/users/${id}`),
  createUser: (data) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("phoneNumber", data.phoneNumber || "");
    formData.append("userType", data.userType);
    formData.append("storeId", data.storeId || "");
    if (data.profileImage instanceof File) {
      formData.append("profileImage", data.profileImage);
    }
    return adminApi.post(`/users`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateUser: (id, data) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber || "");
    formData.append("userType", data.userType);
    formData.append("storeId", data.storeId || "");
    if (data.profileImage instanceof File) {
      formData.append("profileImage", data.profileImage);
    }
    return adminApi.put(`/users/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteUser: (id) => adminApi.delete(`/users/${id}`),
};

export const adminSliderService = {
  getSliders: () => adminApi.get(`/sliders`),
  getSliderById: (id) => adminApi.get(`/sliders/${id}`),
  createSlider: (formData) => {
    // Use the FormData directly instead of creating a new one
    return adminApi.post(`/sliders`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateSlider: (id, formData) => {
    // Use the FormData directly instead of creating a new one
    return adminApi.put(`/sliders/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteSlider: (id) => adminApi.delete(`/sliders/${id}`),
  cleanupMissingImages: () => adminApi.post(`/sliders/cleanup-missing-images`),
};

export const adminOrderService = {
  getOrders: (filters = {}) => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.userId) params.userId = filters.userId;
    if (filters.storeName) params.storeName = filters.storeName;
    if (filters.productName) params.productName = filters.productName;
    return adminApi.get(`/orders`, { params });
  },
  getOrderById: (id) => adminApi.get(`/orders/${id}`),
  createOrder: (data) => adminApi.post(`/orders`, data),
  updateOrder: (id, data) => adminApi.put(`/orders/${id}`, data),
  deleteOrder: (id) => adminApi.delete(`/orders/${id}`),
  approveOrder: (id) => adminApi.put(`/orders/${id}/approve`),
  rejectOrder: (id) => adminApi.put(`/orders/${id}/reject`),
  getStoreOwnerOrders: (userId) => adminApi.get(`/orders/store-owner/${userId}`),
  getFilterOptions: () => adminApi.get(`/orders/filter-options`),
};

export const adminSeoService = {
  getSeoList: () => adminApi.get(`/seo/all`),
  getSeoByPath: (path) => adminApi.get(`/seo/resolve?path=${encodeURIComponent(path)}`),
  upsertSeo: (data) => adminApi.post(`/seo`, data),
};
