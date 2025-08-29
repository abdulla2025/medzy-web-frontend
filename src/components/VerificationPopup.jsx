import React from 'react';
import { Mail, CheckCircle, Clock } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const VerificationPopup = ({ email, onClose, onProceedToVerification }) => {
  const { isDarkMode } = useDarkMode();
  
  console.log('🚀 VerificationPopup rendered! Email:', email);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full rounded-2xl shadow-2xl p-6 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Account Created Successfully! 🎉
          </h2>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-5 w-5 text-blue-500 mr-2" />
            <span className="font-medium">{email}</span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We've sent a 6-digit verification code to your email address.
          </p>

          <div className="flex items-center justify-center text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3">
            <Clock className="h-4 w-4 mr-2" />
            <span>Code expires in 15 minutes</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onProceedToVerification}
            className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-green-600 transition-all duration-200 transform hover:scale-105"
          >
            Verify Email Address →
          </button>
          
          <button
            onClick={onClose}
            className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            I'll verify later
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPopup;
