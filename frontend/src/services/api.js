import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

const handleError = (error) => {
  console.error('API Error Details:', error);
  
  if (error.response) {
    console.error('Response Error:', error.response.data);
    return {
      success: false,
      error: error.response.data.error || 'Server error'
    };
  } else if (error.request) {
    console.error('Request Error - No response received');
    return {
      success: false,
      error: 'Cannot connect to backend. Make sure backend is running on port 5000.'
    };
  } else {
    console.error('Setup Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getAllProducts = async () => {
  try {
    console.log('Fetching products from:', `${API_BASE_URL}/products`);
    const response = await api.get('/products');
    console.log('Products response:', response.data);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addProduct = async (productData) => {
  try {
    const response = await api.post('/products/add', productData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateProduct = async (id, updates) => {
  try {
    const response = await api.put(`/products/update/${id}`, updates);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await api.post('/products/search', { query });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions/add', transactionData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const processVoiceTransaction = async (transcript) => {
  try {
    const response = await api.post('/transactions/voice-process', { transcript });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getDailySummary = async (date = null) => {
  try {
    const params = date ? { date } : {};
    const response = await api.get('/transactions/daily-summary', { params });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const detectMismatch = async (expected, actual) => {
  try {
    const response = await api.post('/transactions/detect-mismatch', { expected, actual });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const checkBackendHealth = async () => {
  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('Backend health check:', response.data);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export default api;
