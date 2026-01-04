// src/context/WishlistContext.jsx - COMPLETE CORRECTED VERSION

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { wishlistService, debugWishlistEndpoints } from '../services/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.id) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const loadWishlist = async () => {
  if (!user?.id) return;
  
  setLoading(true);
  setError(null);
  try {
    const response = await wishlistService.getUserWishlist(user.id);
    setWishlist(response.data || []);
  } catch (error) {
    console.error('Failed to load wishlist:', error);
    // Silently fail - don't block navigation
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.warn('Wishlist access forbidden - user may need to re-login');
      setWishlist([]);
      setError(null); // Don't show error to user
    } else {
      setError('Failed to load wishlist');
      setWishlist([]);
    }
  } finally {
    setLoading(false);
  }
};

  const checkInWishlist = (productId) => {
    if (!wishlist || wishlist.length === 0) return false;
    
    return wishlist.some(item => {
      if (item.product && item.product.id === productId) return true;
      if (item.productId === productId) return true;
      return false;
    });
  };

  const toggleWishlist = async (productId) => {
    if (!user?.id) {
      setError('Please log in to manage your wishlist');
      return false;
    }

    try {
      setError(null);
      
      if (checkInWishlist(productId)) {
        // Remove from wishlist
        console.log('🔄 Removing product from wishlist:', productId);
        await wishlistService.removeFromWishlist(user.id, productId);
      } else {
        // Add to wishlist
        console.log('✅ Adding product to wishlist:', productId);
        await wishlistService.addToWishlist(user.id, productId);
      }
      
      await loadWishlist();
      return true;
    } catch (error) {
      console.error('❌ Failed to update wishlist:', error);
      
      // If it's a 404, debug the endpoints
      if (error.response?.status === 404) {
        console.log('🔍 Endpoint not found, testing alternatives...');
        await debugWishlistEndpoints(user.id, productId);
      }
      
      setError(error.response?.data?.message || 'Failed to update wishlist');
      throw error;
    }
  };

  const removeFromWishlist = async (wishlistEntryId) => {
    if (!user?.id) {
      setError('Please log in to manage your wishlist');
      return false;
    }

    try {
      setError(null);
      
      // Find the product ID from the wishlist entry
      const wishlistItem = wishlist.find(item => item.id === wishlistEntryId);
      if (!wishlistItem) {
        throw new Error('Wishlist item not found');
      }
      
      const productId = wishlistItem.productId || (wishlistItem.product && wishlistItem.product.id);
      if (!productId) {
        throw new Error('Could not find product ID for wishlist entry');
      }
      
      console.log('🔄 Removing from wishlist - entry:', wishlistEntryId, 'product:', productId);
      await wishlistService.removeFromWishlist(user.id, productId);
      
      await loadWishlist();
      return true;
    } catch (error) {
      console.error('❌ Failed to remove from wishlist:', error);
      
      // Debug endpoints if needed
      if (error.response?.status === 404) {
        const wishlistItem = wishlist.find(item => item.id === wishlistEntryId);
        const productId = wishlistItem?.productId || (wishlistItem?.product && wishlistItem.product.id);
        if (productId) {
          await debugWishlistEndpoints(user.id, productId);
        }
      }
      
      setError(error.response?.data?.message || 'Failed to remove from wishlist');
      throw error;
    }
  };

  const clearError = () => setError(null);

  const value = {
    wishlist,
    loading,
    error,
    checkInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearError,
    reloadWishlist: loadWishlist,
    getProductFromWishlistEntry: (wishlistEntryId) => {
      const entry = wishlist.find(item => item.id === wishlistEntryId);
      return entry?.product || entry;
    }
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
