// Admin API Service
// Handles admin/dashboard API calls

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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
  createProduct: (data) => {
    const formData = new FormData();

    // Basic product data
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("collection_id", data.collection_id);
    formData.append("slug", data.slug);
    formData.append("meta_title", data.meta_title || "");
    formData.append("meta_desc", data.meta_desc || "");

    // Handle variations
    if (data.variations && data.variations.length > 0) {
      // Remove images from variations before stringifying
      const variationsForBackend = data.variations.map(v => {
        const { images, ...rest } = v;
        return rest;
      });
      formData.append("variations", JSON.stringify(variationsForBackend));

      // Handle variation images and existingImages
      data.variations.forEach((variation, variationIndex) => {
        // Existing images to keep
        if (variation.existingImages && variation.existingImages.length > 0) {
          variation.existingImages.forEach((imgIdOrUrl) => {
            formData.append(`existingImages[${variationIndex}][]`, imgIdOrUrl);
          });
        }
        // New images
        if (variation.images && variation.images.length > 0) {
          variation.images.forEach((image) => {
            if (image.file instanceof File) {
              formData.append(
                `variation_images[${variationIndex}]`,
                image.file
              );
            }
          });
        }
      });
    }

    return adminApi
      .post(`/products`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => ({ data: res.data.data }));
  },
  updateProduct: (id, data) => {
    const formData = new FormData();

    // Basic product data
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("collection_id", data.collection_id);
    formData.append("slug", data.slug);
    formData.append("meta_title", data.meta_title || "");
    formData.append("meta_desc", data.meta_desc || "");

    // Handle variations
    if (data.variations && data.variations.length > 0) {
      // Remove images from variations before stringifying
      const variationsForBackend = data.variations.map(v => {
        const { images, ...rest } = v;
        return rest;
      });
      formData.append("variations", JSON.stringify(variationsForBackend));

      // Handle variation images and existingImages
      data.variations.forEach((variation, variationIndex) => {
        // Existing images to keep
        if (variation.existingImages && variation.existingImages.length > 0) {
          variation.existingImages.forEach((imgIdOrUrl) => {
            formData.append(`existingImages[${variationIndex}][]`, imgIdOrUrl);
          });
        }
        // New images
        if (variation.images && variation.images.length > 0) {
          variation.images.forEach((image) => {
            if (image.file instanceof File) {
              formData.append(
                `variation_images[${variationIndex}]`,
                image.file
              );
            }
          });
        }
      });
    }

    return adminApi
      .put(`/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => ({ data: res.data.data }));
  },
  deleteProduct: (id) => adminApi.delete(`/products/${id}`),
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
  deleteReview: (id) => adminApi.delete(`/reviews/${id}`),
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
  createSlider: (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('collection_id', data.collection_id || '');
    formData.append('button_text', data.button_text || '');
    if (data.slider_image instanceof File) {
      formData.append('slider_image', data.slider_image);
    }
    return adminApi.post(`/sliders`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateSlider: (id, data) => {
    const formData = new FormData();
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.collection_id !== undefined) formData.append('collection_id', data.collection_id);
    if (data.button_text !== undefined) formData.append('button_text', data.button_text);
    if (data.slider_image instanceof File) {
      formData.append('slider_image', data.slider_image);
    }
    return adminApi.put(`/sliders/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteSlider: (id) => adminApi.delete(`/sliders/${id}`),
};
