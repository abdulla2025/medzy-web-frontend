// API Configuration with production fallback
const getApiBaseUrl = () => {
  // Check if we have environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Production fallback - force production URL for all vercel deployments
  if (typeof window !== 'undefined' && 
      (window.location.hostname.includes('vercel.app') || 
       window.location.hostname.includes('medzy-web') ||
       import.meta.env.PROD)) {
    return 'https://medzy-web-backend.vercel.app';
  }
  
  // Development fallback
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

// Production override - ensure production URL is always used in production builds
const FINAL_API_BASE_URL = import.meta.env.PROD && !import.meta.env.VITE_API_URL 
  ? 'https://medzy-web-backend.vercel.app' 
  : API_BASE_URL;

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL,
  FINAL_API_BASE_URL,
  environment: import.meta.env.MODE,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
});

// Validate API configuration
if (!FINAL_API_BASE_URL) {
  console.error('❌ FINAL_API_BASE_URL is not defined!');
}

// Database status check utility
export const checkDatabaseStatus = async () => {
  try {
    const response = await fetch(`${FINAL_API_BASE_URL}/api/health`, {
      method: 'GET',
      timeout: 5000 // 5 second timeout
    });
    const data = await response.json();
    return {
      isHealthy: response.ok && data.database === 'connected',
      status: data.database || 'unknown',
      message: data.message || 'Unknown status'
    };
  } catch (error) {
    return {
      isHealthy: false,
      status: 'error',
      message: error.message || 'Connection failed'
    };
  }
};

// Enhanced fetch wrapper with database fallback
export const robustApiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(endpoint, {
      ...options,
      timeout: 10000 // 10 second timeout for API calls
    });
    
    // Handle 503 Service Unavailable (database timeout)
    if (response.status === 503) {
      throw new Error('Database temporarily unavailable. Please try again in a few moments.');
    }
    
    return response;
  } catch (error) {
    if (error.message.includes('timeout') || error.message.includes('Connection timeout')) {
      throw new Error('Service is currently experiencing high traffic. Please try again shortly.');
    }
    throw error;
  }
};

// API endpoints
export const API_ENDPOINTS = {
  // Base URL
  BASE_URL: FINAL_API_BASE_URL,
  
  // Authentication
  AUTH: {
    SIGNUP: `${FINAL_API_BASE_URL}/api/auth/signup`,
    SIGNIN: `${FINAL_API_BASE_URL}/api/auth/signin`,
    LOGOUT: `${FINAL_API_BASE_URL}/api/auth/logout`,
    ME: `${FINAL_API_BASE_URL}/api/auth/me`,
    SESSION_CHECK: `${FINAL_API_BASE_URL}/api/auth/session-check`,
    FORGOT_PASSWORD: `${FINAL_API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${FINAL_API_BASE_URL}/api/auth/reset-password`,
    VERIFY_EMAIL: `${FINAL_API_BASE_URL}/api/auth/verify-email`,
    RESEND_VERIFICATION: `${FINAL_API_BASE_URL}/api/auth/resend-verification`,
    FORCE_LOGIN: `${FINAL_API_BASE_URL}/api/auth/force-login`,
  },
  
  // Users
  USERS: {
    BASE: `${FINAL_API_BASE_URL}/api/users`,
    PROFILE: `${FINAL_API_BASE_URL}/api/profile`,
  },
  
  // Profile
  PROFILE: {
    BASE: `${FINAL_API_BASE_URL}/api/profile`,
    CHANGE_PASSWORD: `${FINAL_API_BASE_URL}/api/profile/change-password`,
  },
  
  // Medicines
  MEDICINES: {
    BASE: `${FINAL_API_BASE_URL}/api/medicines`,
    SEARCH: `${FINAL_API_BASE_URL}/api/medicines/search`,
  },
  
  // Orders
  ORDERS: {
    BASE: `${FINAL_API_BASE_URL}/api/orders`,
    MY_ORDERS: `${FINAL_API_BASE_URL}/api/orders/my-orders`,
    VENDOR: {
      STATS: `${FINAL_API_BASE_URL}/api/orders/vendor/stats`,
    }
  },
  
  // Cart
  CART: {
    BASE: `${FINAL_API_BASE_URL}/api/cart`,
    COUNT: `${FINAL_API_BASE_URL}/api/cart/count`,
    ADD: `${FINAL_API_BASE_URL}/api/cart/add`,
  },
  
  // Medicine Requests
  MEDICINE_REQUESTS: {
    BASE: `${FINAL_API_BASE_URL}/api/medicine-requests`,
    MY_REQUESTS: `${FINAL_API_BASE_URL}/api/medicine-requests/my-requests`,
    ALL: `${FINAL_API_BASE_URL}/api/medicine-requests/all`,
  },
  
  // Donations
  DONATIONS: {
    BASE: `${FINAL_API_BASE_URL}/api/donations`,
    SUBMIT: `${FINAL_API_BASE_URL}/api/donations/submit`,
    BROWSE: `${FINAL_API_BASE_URL}/api/donations/browse`,
    MY_DONATIONS: `${FINAL_API_BASE_URL}/api/donations/my-donations`,
  },
  
  // Payments
  PAYMENTS: {
    BASE: `${FINAL_API_BASE_URL}/api/payments`,
    CREATE: `${FINAL_API_BASE_URL}/api/payments/create`,
    BKASH: `${FINAL_API_BASE_URL}/api/payments/bkash`,
    SSLCOMMERZ: `${FINAL_API_BASE_URL}/api/payments/sslcommerz`,
    STRIPE: `${FINAL_API_BASE_URL}/api/payments/stripe`,
    PROCESS_SUCCESS: `${FINAL_API_BASE_URL}/api/payments/process-success`,
    PROCESS_FAILURE: `${FINAL_API_BASE_URL}/api/payments/process-failure`,
    VENDOR: {
      EARNINGS: `${FINAL_API_BASE_URL}/api/payments/vendor/earnings`,
    }
  },
  
  // Reviews
  REVIEWS: {
    BASE: `${FINAL_API_BASE_URL}/api/reviews`,
    PUBLIC: `${FINAL_API_BASE_URL}/api/reviews/public`,
    VENDOR: {
      MY_REVIEWS: `${FINAL_API_BASE_URL}/api/reviews/vendor/my-reviews`,
    }
  },
  
  // Service Reviews
  SERVICE_REVIEWS: {
    BASE: `${FINAL_API_BASE_URL}/api/service-reviews`,
    PUBLIC: `${FINAL_API_BASE_URL}/api/service-reviews/public`,
  },
  
  // Support
  SUPPORT: {
    BASE: `${FINAL_API_BASE_URL}/api/support`,
    MY_TICKETS: `${FINAL_API_BASE_URL}/api/support/my-tickets`,
  },
  
  // Smart Doctor
  SMART_DOCTOR: {
    BASE: `${FINAL_API_BASE_URL}/api/smart-doctor`,
    ANALYZE_SYMPTOMS: `${FINAL_API_BASE_URL}/api/smart-doctor/analyze-symptoms`,
    EXTRACT_PRESCRIPTION: `${FINAL_API_BASE_URL}/api/smart-doctor/extract-prescription`,
    PERSONALIZED_PROFILE: `${FINAL_API_BASE_URL}/api/smart-doctor/personalized-profile`,
    MEDICINE_RECOMMENDATIONS: `${FINAL_API_BASE_URL}/api/smart-doctor/medicine-recommendations`,
  },
  
  // Medicine Reminders
  MEDICINE_REMINDERS: {
    BASE: `${FINAL_API_BASE_URL}/api/medicine-reminders`,
    TODAY: `${FINAL_API_BASE_URL}/api/medicine-reminders/today`,
    ADHERENCE: `${FINAL_API_BASE_URL}/api/medicine-reminders/adherence`,
  },
  
  // Daily Updates
  DAILY_UPDATES: {
    BASE: `${FINAL_API_BASE_URL}/api/daily-updates`,
  },
  
  // Disputes
  DISPUTES: {
    BASE: `${FINAL_API_BASE_URL}/api/disputes`,
  },
  
  // Customer Points
  CUSTOMER_POINTS: {
    BASE: `${FINAL_API_BASE_URL}/api/customer-points`,
    BALANCE: `${FINAL_API_BASE_URL}/api/customer-points/balance`,
    TRANSACTIONS: `${FINAL_API_BASE_URL}/api/customer-points/transactions`,
  },
  
  // Medical Profile
  MEDICAL_PROFILE: {
    BASE: `${FINAL_API_BASE_URL}/api/medical-profile`,
    MEDICAL_HISTORY: `${FINAL_API_BASE_URL}/api/medical-profile/medical-history`,
  },
  
  // Revenue Adjustments
  REVENUE_ADJUSTMENTS: {
    BASE: `${FINAL_API_BASE_URL}/api/revenue-adjustments`,
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
