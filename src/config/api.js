// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

// API endpoints
export const API_ENDPOINTS = {
  // Base URL
  BASE_URL: API_BASE_URL,
  
  // Authentication
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    SIGNIN: `${API_BASE_URL}/api/auth/signin`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    ME: `${API_BASE_URL}/api/auth/me`,
    SESSION_CHECK: `${API_BASE_URL}/api/auth/session-check`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
    FORCE_LOGIN: `${API_BASE_URL}/api/auth/force-login`,
  },
  
  // Users
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    PROFILE: `${API_BASE_URL}/api/profile`,
  },
  
  // Profile
  PROFILE: {
    BASE: `${API_BASE_URL}/api/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/profile/change-password`,
  },
  
  // Medicines
  MEDICINES: {
    BASE: `${API_BASE_URL}/api/medicines`,
    SEARCH: `${API_BASE_URL}/api/medicines/search`,
  },
  
  // Orders
  ORDERS: {
    BASE: `${API_BASE_URL}/api/orders`,
    VENDOR: {
      STATS: `${API_BASE_URL}/api/orders/vendor/stats`,
    }
  },
  
  // Cart
  CART: {
    BASE: `${API_BASE_URL}/api/cart`,
  },
  
  // Medicine Requests
  MEDICINE_REQUESTS: {
    BASE: `${API_BASE_URL}/api/medicine-requests`,
    MY_REQUESTS: `${API_BASE_URL}/api/medicine-requests/my-requests`,
  },
  
  // Donations
  DONATIONS: {
    BASE: `${API_BASE_URL}/api/donations`,
  },
  
  // Payments
  PAYMENTS: {
    BASE: `${API_BASE_URL}/api/payments`,
    BKASH: `${API_BASE_URL}/api/payments/bkash`,
    SSLCOMMERZ: `${API_BASE_URL}/api/payments/sslcommerz`,
    STRIPE: `${API_BASE_URL}/api/payments/stripe`,
    PROCESS_SUCCESS: `${API_BASE_URL}/api/payments/process-success`,
    PROCESS_FAILURE: `${API_BASE_URL}/api/payments/process-failure`,
    VENDOR: {
      EARNINGS: `${API_BASE_URL}/api/payments/vendor/earnings`,
    }
  },
  
  // Reviews
  REVIEWS: {
    BASE: `${API_BASE_URL}/api/reviews`,
    PUBLIC: `${API_BASE_URL}/api/reviews/public`,
    VENDOR: {
      MY_REVIEWS: `${API_BASE_URL}/api/reviews/vendor/my-reviews`,
    }
  },
  
  // Service Reviews
  SERVICE_REVIEWS: {
    BASE: `${API_BASE_URL}/api/service-reviews`,
    PUBLIC: `${API_BASE_URL}/api/service-reviews/public`,
  },
  
  // Support
  SUPPORT: {
    BASE: `${API_BASE_URL}/api/support`,
  },
  
  // Smart Doctor
  SMART_DOCTOR: {
    BASE: `${API_BASE_URL}/api/smart-doctor`,
  },
  
  // Medicine Reminders
  MEDICINE_REMINDERS: {
    BASE: `${API_BASE_URL}/api/medicine-reminders`,
  },
  
  // Daily Updates
  DAILY_UPDATES: {
    BASE: `${API_BASE_URL}/api/daily-updates`,
  },
  
  // Disputes
  DISPUTES: {
    BASE: `${API_BASE_URL}/api/disputes`,
  },
  
  // Customer Points
  CUSTOMER_POINTS: {
    BASE: `${API_BASE_URL}/api/customer-points`,
  },
  
  // Medical Profile
  MEDICAL_PROFILE: {
    BASE: `${API_BASE_URL}/api/medical-profile`,
  },
  
  // Revenue Adjustments
  REVENUE_ADJUSTMENTS: {
    BASE: `${API_BASE_URL}/api/revenue-adjustments`,
  },
};

// App Configuration
export const APP_CONFIG = {
  API_BASE_URL,
  FRONTEND_URL,
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Helper function to get authorization headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? {
    ...DEFAULT_HEADERS,
    'Authorization': `Bearer ${token}`,
  } : DEFAULT_HEADERS;
};

// Helper function to make API requests
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default API_ENDPOINTS;
