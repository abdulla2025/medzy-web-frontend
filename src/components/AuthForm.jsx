import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart, User, Mail, Phone, Calendar, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useDarkMode } from '../context/DarkModeContext';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import LoginConfirmationModal from './LoginConfirmationModal';

const AuthForm = ({ setShowHomepage, onResetComplete, startWithSignup = false, onAuthComplete, onVerificationStart, onVerificationEnd }) => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(!startWithSignup); // Start with sign-up if startWithSignup is true
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showLoginConfirmation, setShowLoginConfirmation] = useState(false);
  const [existingSessionData, setExistingSessionData] = useState(null);
  const [resetToken, setResetToken] = useState('');
  const { login, signup, forceLogin } = useAuth();
  const { showNotification } = useNotification();

  // Check for reset token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      setShowResetPassword(true);
    }
  }, []);

  // Handle startWithSignup prop
  useEffect(() => {
    if (startWithSignup) {
      setIsLogin(false); // Show sign-up form
    }
  }, [startWithSignup]);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    role: 'customer'
  });

  const handleCancelForceLogin = () => {
    setShowLoginConfirmation(false);
    setExistingSessionData(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login({ email: formData.email, password: formData.password });
        if (result.success) {
          // After login, dashboard will be shown based on user role (handled in AppContent/Dashboard)
          setError('');
          setShowLoginConfirmation(false);
          setExistingSessionData(null);
        } else {
          if (result.errorType === 'EMAIL_NOT_VERIFIED') {
            navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
            showNotification('Please verify your email address to continue', 'warning');
          } else {
            setError(result.error);
            setShowLoginConfirmation(false);
          }
        }
      } else {
        // SIGNUP PROCESS
        console.log('🔍 Starting signup with email:', formData.email);
        result = await signup(formData);
        console.log('🔍 Signup result:', result);
        
        if (result.success) {
          console.log('🔍 Signup successful, checking verification requirement...');
          console.log('🔍 result.requiresVerification:', result.requiresVerification);
          
          if (result.requiresVerification) {
            // REDIRECT TO VERIFICATION PAGE WITH EMAIL PARAMETER
            console.log('🔍 Redirecting to verification page for email:', formData.email);
            
            // Notify parent that verification flow started
            if (onVerificationStart) {
              onVerificationStart();
            }
            
            // Navigate to the verification page with email as query parameter
            navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
            
            console.log('🔍 Navigation initiated to verification page');
            setLoading(false);
            return; // Exit early to prevent any other state changes
          } else {
            console.log('🔍 No verification required');
            setIsLogin(true);
            setError('Signup successful! Please log in.');
            if (setShowHomepage) setShowHomepage(false);
          }
        } else {
          console.log('🔍 Signup failed:', result.error);
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await forceLogin(formData.email, formData.password);
      if (result.success) {
        setShowLoginConfirmation(false);
        setExistingSessionData(null);
        setError('');
        showNotification('Login successful! Previous session terminated.', 'success');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Force login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBackToAuth = () => {
    setShowForgotPassword(false);
    setShowResetPassword(false);
    setError('');
  };

  const handleResetSuccess = () => {
    setShowResetPassword(false);
    setIsLogin(true);
    showNotification('Password reset successfully! Please sign in with your new password.', 'success');
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Call the parent's reset complete handler if provided
    if (onResetComplete) {
      onResetComplete();
    }
  };

  // Render main auth form
  console.log('🔍 AuthForm rendering main form');

  // Show forgot password component
  if (showForgotPassword) {
    return (
      <ForgotPassword
        onBack={handleBackToAuth}
      />
    );
  }

  // Show reset password component
  if (showResetPassword) {
    return (
      <ResetPassword
        token={resetToken}
        onSuccess={handleResetSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => setShowHomepage(true)}
            className="group mx-auto mb-4 flex items-center justify-center"
            title="Back to Homepage"
          >
            <div className="bg-gradient-to-r from-blue-600 to-green-500 p-3 rounded-full w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </button>
          <button 
            onClick={() => setShowHomepage(true)}
            className="hover:opacity-80 transition-opacity"
            title="Back to Homepage"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MedZy</h1>
          </button>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {isLogin ? 'Welcome back to your health companion' : 'Join MedZy - Your health companion'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
          </div>

          {error && (
            <div className={`mb-4 p-4 rounded-lg border-l-4 ${
              error.includes('successful') 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-400 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-300'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {error.includes('successful') ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your first name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    📱 Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">👤 Please select your gender</option>
                      <option value="male">👨 Male</option>
                      <option value="female">👩 Female</option>
                      <option value="other">🏪 Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      I am a
                    </label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="customer">🏥 Patient/Customer - Looking for healthcare services</option>
                        <option value="pharmacy_vendor">💊 Pharmacy Owner/Vendor - Managing pharmacy operations</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose your role to access the right features</p>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a secure password (min 6 characters)"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              )}
            </div>

            {/* Forgot Password Link for Login */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In to Your Account' : 'Create Your Account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setShowLoginConfirmation(false);
                setExistingSessionData(null);
                setFormData({
                  email: '',
                  phone: '',
                  password: '',
                  firstName: '',
                  lastName: '',
                  dateOfBirth: '',
                  gender: '',
                  role: 'customer'
                });
              }}
              className="mt-4 w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-2 px-4 rounded-lg border border-blue-200 hover:border-blue-300 dark:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 flex items-center justify-center"
            >
              {isLogin ? 'Create New Account' : 'Sign In Instead'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Login Confirmation Modal */}
      <LoginConfirmationModal
        isOpen={showLoginConfirmation}
        onConfirm={handleForceLogin}
        onCancel={handleCancelForceLogin}
        existingDevice={existingSessionData?.existingDevice}
        loginTime={existingSessionData?.loginTime}
        lastActivity={existingSessionData?.lastActivity}
      />
    </div>
  );
};

export default AuthForm;