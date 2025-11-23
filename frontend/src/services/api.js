import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productAPI = {
  // Get all products
  getAllProducts: () => api.get('/products'),

  // Search products
  searchProducts: (query) => api.get(`/products/search?name=${query}`),

  // Get product by ID
  getProductById: (id) => api.get(`/products/${id}`),

  // Create product
  createProduct: (data) => api.post('/products', data),

  // Update product
  updateProduct: (id, data) => api.put(`/products/${id}`, data),

  // Delete product
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Import CSV
  importCSV: (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);
    return api.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Export CSV
  exportCSV: () => api.get('/products/export', {
    responseType: 'blob',
  }),

  // Get inventory history
  getInventoryHistory: (id) => api.get(`/products/${id}/history`),
};

export default api;
