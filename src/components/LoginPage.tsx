import React, { useState } from 'react';
import { Phone, Lock, LogIn, Eye, EyeOff, X } from 'lucide-react';
import { fetchWhitelistCsv } from '../utils/whitelistCsv';
import { saveAuthSession, validatePhoneNumber, validatePassword } from '../utils/auth';

interface LoginPageProps {
  onLogin: (phoneNumber: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Local whitelist fallback for phone/password validation
  const localWhitelist: Array<{ phone: string; password: string }> = [
    { phone: '8921697857', password: '8921' },
    { phone: '9745895354', password: '1234' },
    { phone: '9876543210', password: 'admin123' },
    { phone: '9876543211', password: 'user123' },
    { phone: '9876543212', password: 'user123' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    // Validate password is entered
    if (!validatePassword(password)) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Check CSV whitelist first
      const csvList = await fetchWhitelistCsv();
      const isCsvWhitelisted = csvList.some(
        (entry) => entry.phone === phoneNumber && entry.password === password
      );
      if (isCsvWhitelisted) {
        saveAuthSession(phoneNumber);
        onLogin(phoneNumber);
        return;
      }

      // Then check local in-code whitelist as a fallback
      const isLocallyWhitelisted = localWhitelist.some(
        (entry) => entry.phone === phoneNumber && entry.password === password
      );
      if (isLocallyWhitelisted) {
        saveAuthSession(phoneNumber);
        onLogin(phoneNumber);
        return;
      }

      // If neither whitelist validates, show error
      setError('Invalid phone number or password. Please check your credentials and try again.');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password field key press for Enter key validation
  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && phoneNumber && password) {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 flex flex-col justify-center items-center font-sans relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
      <div className="absolute top-32 right-16 w-16 h-16 bg-white/5 rounded-full animate-bounce"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
      
      {/* Animated/Blurred Background */}
      <div className="fixed inset-0 z-0 backdrop-blur-2xl bg-gradient-to-br from-orange-100/30 via-orange-300/20 to-amber-200/30"></div>
      
      <div className="relative z-10 w-full max-w-md p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl transition-transform duration-300 hover:scale-[1.02] border border-white/20">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow-2xl mb-3 sm:mb-4">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/512px-Bharatiya_Janata_Party_logo.svg.png"
                  alt="BJP Logo" 
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto object-contain"
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src='https://placehold.co/64x64/FFFFFF/F97316?text=BJP&font=sans'; 
                  }}
                />
              </div>
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Kerala Map
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 sm:mb-4">
              Interactive Political Map
            </h2>
            <p className="text-gray-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed px-2">
              Access the interactive Kerala political map with comprehensive data visualization
            </p>
            <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mx-auto mt-4 sm:mt-6"></div>
          </div>
          
          {/* Login Form */}
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit} aria-label="Login form">
            <div className="space-y-3 sm:space-y-4">
              {/* Phone Number Field - Mobile Optimized */}
              <div className="relative group">
                <div className="absolute top-1/2 left-3 sm:left-4 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors duration-300 z-10">
                  <Phone size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="absolute left-10 sm:left-12 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm font-medium">+91</div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(value);
                    setError(''); // Clear error when user types
                  }}
                  disabled={isLoading}
                  className="w-full pl-16 sm:pl-20 pr-4 py-3 sm:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 text-base"
                  aria-label="Phone Number"
                  required
                />
              </div>

              {/* Password Field - Mobile Optimized */}
              <div className="relative group">
                <div className="absolute top-1/2 left-3 sm:left-4 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors duration-300 z-10">
                  <Lock size={18} className="sm:w-5 sm:h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(''); // Clear error when user types
                  }}
                  onKeyPress={handlePasswordKeyPress}
                  disabled={isLoading}
                  className="w-full pl-10 sm:pl-12 pr-12 py-3 sm:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 text-base"
                  aria-label="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors duration-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="text-xs text-orange-300 hover:underline focus:outline-none"
                  tabIndex={0}
                  onClick={() => alert('Please contact your admin to reset your password.')}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button - Mobile Optimized */}
              <button
                type="submit"
                disabled={isLoading || !phoneNumber || !password}
                className={`w-full py-3 sm:py-4 px-6 rounded-xl font-medium text-white transition-all duration-300 ${
                  isLoading || !phoneNumber || !password
                    ? 'bg-orange-400/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-orange-500/30 transform hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm sm:text-base">Validating credentials...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">{phoneNumber && password ? 'Validate & Sign In' : 'Sign In'}</span>
                  </span>
                )}
              </button>
            </div>
            {/* Error Message with animation */}
            {error && (
              <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center backdrop-blur-md">
                <X size={16} className="mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{error}</span>
              </div>
            )}
          </form>
          {/* Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/20">
            <p className="text-xs text-gray-300 text-center mt-3 sm:mt-4 px-2">
              For authorized use only. 2025 BJP Kerala. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      {/* Responsive mobile hint */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-20 sm:hidden text-xs text-gray-200 bg-white/20 px-3 py-1 rounded-full shadow-md backdrop-blur-md">
        Best viewed in portrait mode
      </div>
    </div>
  );
};