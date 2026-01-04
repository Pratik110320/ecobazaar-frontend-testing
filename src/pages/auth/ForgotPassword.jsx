import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiSend } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await authService.forgotPassword({ email });
      setMessage('Password reset instructions have been sent to your email');
      setEmailSent(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

            {!emailSent ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-gray-500">Enter your email address and we'll send you instructions to reset your password</p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                  <FiCheckCircle className="text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-500">We've sent password reset instructions to your email</p>
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
          
          {/* Success Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start"
            >
              <FiCheckCircle className="text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-emerald-700 text-sm">{message}</span>
            </motion.div>
          )}

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-modern pl-11"
                    placeholder="you@example.com"
                    required
                  />
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
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5" />
                    Send Reset Instructions
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 text-center">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button 
                    onClick={() => {
                      setEmailSent(false);
                      setMessage('');
                      setError('');
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    try again
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
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

export default ForgotPassword;