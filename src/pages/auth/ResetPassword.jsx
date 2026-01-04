import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { motion } from 'framer-motion';
import { FiLock, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }
    
    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await authService.resetPassword({ 
        token, 
        password: formData.password 
      });
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successful! Please login with your new password.' } 
        });
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
            <FiAlertCircle className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
          <Link 
            to="/forgot-password"
            className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition font-medium"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-display font-bold text-emerald-800 tracking-tight">
                EcoBazaar<span className="text-emerald-500">.</span>
              </span>
            </Link>

            {!success ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                <p className="text-gray-500">Enter your new password below</p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                  <FiCheckCircle className="text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
                <p className="text-gray-500">Redirecting to login...</p>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start"
            >
              <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </motion.div>
          )}

          {/* Validation Error */}
          {validationError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start"
            >
              <FiAlertCircle className="text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-amber-700 text-sm">{validationError}</span>
            </motion.div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <FiLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-modern pl-11 pr-12"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 ml-1 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>
              
              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <FiLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-modern pl-11 pr-12"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-5 h-5" />
                    Reset Password
                  </>
                )}
              </button>
            </form>
          )}

          {success && (
            <div className="text-center">
              <div className="animate-pulse text-emerald-600 mb-4">
                <div className="inline-block w-2 h-2 bg-emerald-600 rounded-full mx-1"></div>
                <div className="inline-block w-2 h-2 bg-emerald-600 rounded-full mx-1"></div>
                <div className="inline-block w-2 h-2 bg-emerald-600 rounded-full mx-1"></div>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-400 text-xs">
          © {new Date().getFullYear()} EcoBazaar. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;