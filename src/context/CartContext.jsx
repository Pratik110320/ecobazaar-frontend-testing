// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const loadCart = async () => {
  if (!user) return;
  
  setLoading(true);
  try {
    const response = await cartService.getCart(user.id);
    setCart(response.data);
  } catch (error) {
    console.error('Failed to load cart:', error);
    // Silently fail - don't block navigation
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.warn('Cart access forbidden - user may need to re-login');
      setCart(null);
    } else {
      setCart(null);
    }
  } finally {
    setLoading(false);
  }
};

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return { success: false, error: 'Please login first' };
    
    try {
      await cartService.addItem(user.id, { productId, quantity });
      await loadCart(); // Reload cart
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to add to cart' 
      };
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) return { success: false, error: 'Please login first' };
    
    try {
      await cartService.removeItem(user.id, itemId);
      await loadCart(); // Reload cart
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to remove from cart' 
      };
    }
  };

  const clearCart = () => {
    setCart(null);
  };

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart: loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
