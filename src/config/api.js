// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://medzy-web-backend.vercel.app';
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL,
  environment: import.meta.env.MODE
});

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
    RESEND_VERIFICATION: `${API_BASE_URL}/api/auth/resend-verification`,
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
    MY_ORDERS: `${API_BASE_URL}/api/orders/my-orders`,
    VENDOR: {
      STATS: `${API_BASE_URL}/api/orders/vendor/stats`,
    }
  },
  
  // Cart
  CART: {
    BASE: `${API_BASE_URL}/api/cart`,
    COUNT: `${API_BASE_URL}/api/cart/count`,
    ADD: `${API_BASE_URL}/api/cart/add`,
  },
  
  // Medicine Requests
  MEDICINE_REQUESTS: {
    BASE: `${API_BASE_URL}/api/medicine-requests`,
    MY_REQUESTS: `${API_BASE_URL}/api/medicine-requests/my-requests`,
    ALL: `${API_BASE_URL}/api/medicine-requests/all`,
  },
  
  // Donations
  DONATIONS: {
    BASE: `${API_BASE_URL}/api/donations`,
    SUBMIT: `${API_BASE_URL}/api/donations/submit`,
    BROWSE: `${API_BASE_URL}/api/donations/browse`,
    MY_DONATIONS: `${API_BASE_URL}/api/donations/my-donations`,
  },
  
  // Payments
  PAYMENTS: {
    BASE: `${API_BASE_URL}/api/payments`,
    CREATE: `${API_BASE_URL}/api/payments/create`,
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
    MY_TICKETS: `${API_BASE_URL}/api/support/my-tickets`,
  },
  
  // Smart Doctor
  SMART_DOCTOR: {
    BASE: `${API_BASE_URL}/api/smart-doctor`,
    ANALYZE_SYMPTOMS: `${API_BASE_URL}/api/smart-doctor/analyze-symptoms`,
    EXTRACT_PRESCRIPTION: `${API_BASE_URL}/api/smart-doctor/extract-prescription`,
    PERSONALIZED_PROFILE: `${API_BASE_URL}/api/smart-doctor/personalized-profile`,
    MEDICINE_RECOMMENDATIONS: `${API_BASE_URL}/api/smart-doctor/medicine-recommendations`,
  },
  
  // Medicine Reminders
  MEDICINE_REMINDERS: {
    BASE: `${API_BASE_URL}/api/medicine-reminders`,
    TODAY: `${API_BASE_URL}/api/medicine-reminders/today`,
    ADHERENCE: `${API_BASE_URL}/api/medicine-reminders/adherence`,
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
    BALANCE: `${API_BASE_URL}/api/customer-points/balance`,
    TRANSACTIONS: `${API_BASE_URL}/api/customer-points/transactions`,
  },
  
  // Medical Profile
  MEDICAL_PROFILE: {
    BASE: `${API_BASE_URL}/api/medical-profile`,
    MEDICAL_HISTORY: `${API_BASE_URL}/api/medical-profile/medical-history`,
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
