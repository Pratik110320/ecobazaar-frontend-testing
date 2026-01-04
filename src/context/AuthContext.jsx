// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('ecobazaar_token'));

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing auth...');
      
      const savedToken = localStorage.getItem('ecobazaar_token');
      const savedUser = localStorage.getItem('ecobazaar_user');
      
      console.log('📦 Saved token exists:', !!savedToken);
      console.log('📦 Saved user exists:', !!savedUser);
      
      if (savedToken && savedUser) {
        try {
          // Parse the saved user data
          const userData = JSON.parse(savedUser);
          console.log('✅ Restored user:', userData);
          
          // Restore auth state
          setToken(savedToken);
          setUser(userData);
        } catch (error) {
          console.error('❌ Failed to parse saved user data:', error);
          // Clear corrupted data
          localStorage.removeItem('ecobazaar_token');
          localStorage.removeItem('ecobazaar_user');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('⚠️ No saved auth data found');
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login...');
      const response = await authService.login({ email, password });
      
      console.log('📡 Login response:', response.data);
      
      if (response.data.token && response.data.user) {
        const { token: newToken, user: userData } = response.data;
        
        // Store in localStorage
        localStorage.setItem('ecobazaar_token', newToken);
        localStorage.setItem('ecobazaar_user', JSON.stringify(userData));
        
        console.log('✅ Token saved:', newToken.substring(0, 20) + '...');
        console.log('✅ User saved:', userData);
        
        // Update state
        setToken(newToken);
        setUser(userData);
        
        return { success: true, data: userData };
      } else {
        console.error('❌ Login response missing token or user');
        return { 
          success: false, 
          error: response.data.error || 'Login failed - no token received' 
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration...');
      const response = await authService.register(userData);
      
      console.log('📡 Registration response:', response.data);
      
      if (response.data.token && response.data.user) {
        // Auto-login after registration
        const { token: newToken, user: registeredUser } = response.data;
        
        // Store in localStorage
        localStorage.setItem('ecobazaar_token', newToken);
        localStorage.setItem('ecobazaar_user', JSON.stringify(registeredUser));
        
        console.log('✅ Token saved after registration');
        console.log('✅ User saved after registration:', registeredUser);
        
        // Update state
        setToken(newToken);
        setUser(registeredUser);
        
        return { success: true, data: registeredUser };
      } else {
        // Registration succeeded but no auto-login
        console.log('⚠️ Registration succeeded but no token provided');
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    console.log('👋 Logging out...');
    
    // Clear state
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('ecobazaar_token');
    localStorage.removeItem('ecobazaar_user');
    
    console.log('✅ Logout complete');
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem('ecobazaar_user', JSON.stringify(newUserData));
    console.log('✅ User data updated:', newUserData);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user && !!token
  };

  // Show loading screen while initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};