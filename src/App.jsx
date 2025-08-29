import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { User, Shield, Users, Heart, Phone, Mail, Home, CreditCard } from 'lucide-react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import Homepage from './components/Homepage';
import VerificationPage from './components/VerificationPage';
import PaymentStatus from './components/PaymentStatus';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailed from './components/PaymentFailed';
import PaymentCancelled from './components/PaymentCancelled';
import DemoSSLCommerzPage from './components/DemoSSLCommerzPage';
import DarkModeToggle from './components/DarkModeToggle';
import PaymentDemoPage from './components/PaymentDemoPage';
import MedicineReminderManager from './components/MedicineReminderManager';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext';

function AppContent() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [showHomepage, setShowHomepage] = useState(!user); // Start with homepage if not logged in
  const [isGuest, setIsGuest] = useState(!user); // Track if user is browsing as guest
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [startWithSignup, setStartWithSignup] = useState(false); // Track if should start with sign-up form
  const [showPaymentDemo, setShowPaymentDemo] = useState(false); // Track if showing payment demo
  const [isInVerificationFlow, setIsInVerificationFlow] = useState(false); // Track if in email verification

  // Check for reset token in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const resetToken = urlParams.get('token');
    const paymentDemo = urlParams.get('payment-demo');
    
    if (resetToken) {
      setShowResetPassword(true);
      setShowHomepage(false);
    }
    
    if (paymentDemo === 'true') {
      setShowPaymentDemo(true);
      setShowHomepage(false);
    }
  }, [location]);

  // Handle reset password completion
  const handleResetComplete = () => {
    setShowResetPassword(false);
    setShowHomepage(false);
    // Clear URL parameters
    navigate('/', { replace: true });
  };

  // If showing reset password page
  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => {
              setShowResetPassword(false);
              setShowHomepage(true);
              navigate('/', { replace: true });
            }}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 hover:shadow-xl transition-shadow"
            title="Back to Homepage"
          >
            <Home className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div className="fixed top-4 right-4 z-50">
          <DarkModeToggle />
        </div>
        <AuthForm 
          setShowHomepage={setShowHomepage}
          onResetComplete={handleResetComplete}
        />
      </div>
    );
  }

  // Show payment demo page if requested
  if (showPaymentDemo) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Payment Gateway Demo</h1>
              <button
                onClick={() => {
                  setShowPaymentDemo(false);
                  setShowHomepage(true);
                }}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </header>
        <PaymentDemoPage />
      </div>
    );
  }

  // Always show homepage if showHomepage is true, but NOT if in verification flow
  if (showHomepage && !isInVerificationFlow) {
    console.log('🔍 App.jsx: Showing homepage because showHomepage is true and not in verification');
    return (
      <Homepage 
        onGetStarted={() => {
          setShowHomepage(false);
          setIsGuest(false);
          setStartWithSignup(true); // Start with sign-up form
        }}
        onSignIn={() => {
          setShowHomepage(false);
          setIsGuest(false);
          setStartWithSignup(false); // Start with sign-in form
        }}
        user={user}
        onGoToDashboard={() => {
          if (user) {
            setShowHomepage(false);
            setIsGuest(false);
          } else {
            setShowHomepage(false);
          }
        }}
        isGuest={isGuest}
      />
    );
  }

  if (!user) {
    console.log('🔍 App.jsx: No user, showing AuthForm');
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setShowHomepage(true)}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 hover:shadow-xl transition-shadow"
            title="Back to Homepage"
          >
            <Home className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div className="fixed top-4 right-4 z-50">
          <DarkModeToggle />
        </div>
        <AuthForm 
          setShowHomepage={setShowHomepage} 
          startWithSignup={startWithSignup}
          onAuthComplete={() => setStartWithSignup(false)}
          onVerificationStart={() => {
            console.log('🔍 App.jsx: Verification flow started');
            setIsInVerificationFlow(true);
            setShowHomepage(false);
          }}
          onVerificationEnd={() => {
            console.log('🔍 App.jsx: Verification flow ended');
            setIsInVerificationFlow(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => {
                setShowHomepage(true);
                setIsGuest(user ? false : true); // If logged in, not a guest; if not logged in, is a guest
              }}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              title="Go to Homepage"
            >
              <div className="bg-gradient-to-r from-blue-600 to-green-500 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MedZy</h1>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHomepage(true)}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700"
              >
                🏠 Home
              </button>
              <button
                onClick={() => setShowHomepage(false)}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700"
              >
                📊 Dashboard
              </button>
              <DarkModeToggle />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full capitalize">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              
              <button
                onClick={async () => {
                  try {
                    await logout();
                    // Small delay to ensure logout is complete
                    setTimeout(() => {
                      setShowHomepage(true);
                    }, 200);
                  } catch (error) {
                    console.error('Logout error:', error);
                    // Fallback - force homepage anyway
                    setShowHomepage(true);
                  }
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard />
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Payment routes - these should always be accessible */}
      <Route path="/payment/success/:tranId" element={<PaymentSuccess />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failed/:tranId" element={<PaymentFailed />} />
      <Route path="/payment/failed" element={<PaymentFailed />} />
      <Route path="/payment/cancelled/:tranId" element={<PaymentCancelled />} />
      <Route path="/payment/cancelled" element={<PaymentCancelled />} />
      <Route path="/payment/status" element={<PaymentStatus />} />
      
      {/* Demo SSL Commerce route */}
      <Route path="/payment/demo-sslcommerz" element={<DemoSSLCommerzPage />} />
      
      {/* Email Verification route */}
      <Route path="/verify-email" element={<VerificationPage />} />
      
      {/* Medicine Reminder Manager route */}
      <Route path="/medicine-reminders" element={<MedicineReminderManager />} />
      
      {/* Main app route */}
      <Route path="/" element={<AppContent />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <AppRoutes />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;