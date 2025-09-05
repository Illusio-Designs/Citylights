// Utility functions for image URL construction

/**
 * Constructs the base URL for static file serving
 * @returns {string} The base URL without /api
 */
export const getBaseUrl = () => {
  return import.meta.env.VITE_IMAGE_URL || 
         import.meta.env.VITE_API_URL?.replace('/api', '') || 
         'http://localhost:5001';
};

/**
 * Constructs a slider image URL
 * @param {string} image - The image filename or full URL
 * @returns {string} The complete image URL
 */
export const getSliderImageUrl = (image) => {
  if (!image) return null;
  
  if (image.startsWith('http')) {
    return image;
  }
  
  const baseUrl = getBaseUrl();
  return `${baseUrl}/uploads/sliders/${image}`;
};

/**
 * Constructs a product image URL
 * @param {string} img - The image filename or full URL
 * @returns {string} The complete image URL
 */
export const getProductImageUrl = (img) => {
  if (!img) return "/default-product.png";
  
  if (img.startsWith('http')) {
    return img;
  }
  
  const baseUrl = getBaseUrl();
  
  // Check if it's a variation image (starts with 'variation_images')
  if (img.startsWith('variation_images')) {
    return `${baseUrl}/uploads/images/${img}`;
  }
  
  // Default to products directory for other images
  return `${baseUrl}/uploads/products/${img}`;
};

/**
 * Constructs a collection image URL
 * @param {string} img - The image filename or full URL
 * @returns {string} The complete image URL
 */
export const getCollectionImageUrl = (img) => {
  if (!img) return null;
  
  if (img.startsWith('http')) {
    return img;
  }
  
  const baseUrl = getBaseUrl();
  return `${baseUrl}/uploads/collections/${img}`;
};

/**
 * Constructs a store logo URL
 * @param {string} logo - The logo filename or full URL
 * @returns {string} The complete logo URL
 */
export const getStoreLogoUrl = (logo) => {
  if (!logo) return null;
  
  if (logo.startsWith('http')) {
    return logo;
  }
  
  const baseUrl = getBaseUrl();
  return `${baseUrl}/uploads/logos/${logo}`;
};

/**
 * Constructs a user profile image URL
 * @param {string} profileImage - The profile image filename or full URL
 * @returns {string} The complete profile image URL
 */
export const getProfileImageUrl = (profileImage) => {
  if (!profileImage) return null;
  
  if (profileImage.startsWith('http')) {
    return profileImage;
  }
  
  const baseUrl = getBaseUrl();
  return `${baseUrl}/uploads/profile/${profileImage}`;
};

/**
 * Constructs a store image URL
 * @param {string} img - The image filename or full URL
 * @returns {string} The complete image URL
 */
export const getStoreImageUrl = (img) => {
  if (!img) return null;
  
  if (img.startsWith('http')) {
    return img;
  }
  
  const baseUrl = getBaseUrl();
  return `${baseUrl}/uploads/images/${img}`;
};
