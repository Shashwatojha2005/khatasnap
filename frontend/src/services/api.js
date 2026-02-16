import axios from "axios";

// ✅ Proper base URL setup (works in local + production)
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

const handleError = (error) => {
  console.error("API Error Details:", error);

  if (error.response) {
    return {
      success: false,
      error: error.response.data?.error || "Server error",
    };
  } else if (error.request) {
    return {
      success: false,
      error: "Cannot connect to backend.",
    };
  } else {
    return {
      success: false,
      error: error.message,
    };
  }
};

// ================= PRODUCTS =================

export const getAllProducts = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addProduct = async (productData) => {
  try {
    const response = await api.post("/products/add", productData);
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
    const response = await api.post("/products/search", { query });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// ================= TRANSACTIONS =================

export const addTransaction = async (transactionData) => {
  try {
    const response = await api.post("/transactions/add", transactionData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const processVoiceTransaction = async (transcript) => {
  try {
    const response = await api.post("/transactions/voice-process", {
      transcript,
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getDailySummary = async (date = null) => {
  try {
    const params = date ? { date } : {};
    const response = await api.get("/transactions/daily-summary", { params });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const detectMismatch = async (expected, actual) => {
  try {
    const response = await api.post("/transactions/detect-mismatch", {
      expected,
      actual,
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// ================= HEALTH CHECK =================

export const checkBackendHealth = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export default api;
