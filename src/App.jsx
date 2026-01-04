// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Products from './pages/products/Products';
import ProductDetail from './pages/products/ProductDetail';
import ProductComparison from './pages/products/ProductComparison';
import Cart from './pages/cart/Cart';
import Orders from './pages/orders/Orders';
import Dashboard from './pages/dashboard/Dashboard';
import AdminPanel from './pages/admin/AdminPanel';
import SellerPanel from './pages/seller/SellerPanel';
import Wishlist from './pages/wishlist/Wishlist';
import CategoryManagement from './pages/admin/CategoryManagement';
import CommunityLeaderboard from './pages/community/CommunityLeaderboard';
import CarbonReport from './pages/carbon/CarbonReport';
import { WishlistProvider } from './context/WishlistContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
    if (!user) {
    console.log('🚫 No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    console.log('🚫 User role not authorized, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
    return children;
};

function AppContent() {
  const { user, loading } = useAuth();

    if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {user && <Navbar />}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
          <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          
          <Route path="/products/:id" element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/products/:id/compare" element={
            <ProtectedRoute>
              <ProductComparison />
            </ProtectedRoute>
          } />
          
          <Route path="/cart" element={
            <ProtectedRoute roles={['USER']}>
              <Cart />
            </ProtectedRoute>
          } />
          
          <Route path="/wishlist" element={
            <ProtectedRoute roles={['USER']}>
              <Wishlist />
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          
          <Route path="/community/leaderboard" element={
            <ProtectedRoute>
              <CommunityLeaderboard />
            </ProtectedRoute>
          } />
          
          <Route path="/carbon-report" element={
            <ProtectedRoute>
              <CarbonReport />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/categories" element={
            <ProtectedRoute roles={['ADMIN']}>
              <CategoryManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/*" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          
          <Route path="/seller/*" element={
            <ProtectedRoute roles={['SELLER']}>
              <SellerPanel />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider> 
            <AppContent />
          </WishlistProvider> 
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
