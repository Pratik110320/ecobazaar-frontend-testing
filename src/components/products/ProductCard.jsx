import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Combined imports
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { motion } from 'framer-motion';
import {
  FiShoppingBag,
  FiClock,
  FiStar,
  FiPackage,
  FiTag,
  FiHeart,
} from 'react-icons/fi';

const LOCAL_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgxIGZpbGw9IiM5Njk2OTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { checkInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();

  const [adding, setAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = imageError || !product.imageUrl ? LOCAL_PLACEHOLDER : product.imageUrl;

  const getEcoRatingConfig = (rating) => {
    const configs = {
      'A+': { bg: 'bg-emerald-500', text: 'text-white', label: 'Excellent' },
      'A': { bg: 'bg-green-500', text: 'text-white', label: 'Great' },
      'B': { bg: 'bg-yellow-500', text: 'text-white', label: 'Good' },
      'C': { bg: 'bg-orange-500', text: 'text-white', label: 'Fair' },
      'D': { bg: 'bg-red-500', text: 'text-white', label: 'Poor' },
    };
    return configs[rating] || { bg: 'bg-gray-300', text: 'text-gray-700', label: 'N/A' };
  };

  const ecoConfig = getEcoRatingConfig(product.ecoRating);
  const isInWishlist = checkInWishlist(product.id);

  // Helper function for navigation
  const handleProductClick = (e) => {
    e.preventDefault();
    console.log('🔍 Product clicked:', product.id);
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Stop navigation from triggering
    if (!user || user.role !== 'USER') return;
    setAdding(true);
    try {
      const result = await addToCart(product.id, 1);
      if (!result.success) alert(result.error);
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation(); // Stop navigation from triggering
    if (!user || user.role !== 'USER') return;
    try {
      await toggleWishlist(product.id);
    } catch (error) {
      alert('Failed to update wishlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col hover:shadow-md transition-all duration-300"
    >
      {/* Clickable Image Section */}
      <div 
        onClick={handleProductClick}
        className="relative flex-shrink-0 cursor-pointer group"
      >
        <div className="w-full h-48 bg-gray-100 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md">
              <FiStar /> Featured
            </span>
          )}
          {!product.verified && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-amber-600 shadow-sm">
              <FiClock /> Pending
            </span>
          )}
        </div>

        {/* Eco Rating */}
        <div className={`absolute top-3 right-12 ${ecoConfig.bg} ${ecoConfig.text} px-3 py-1.5 rounded-full shadow-md`}>
          <div className="text-xs font-bold flex items-center gap-1">
            <FiPackage /> {product.ecoRating || 'N/A'}
          </div>
        </div>

        {/* Wishlist Button */}
        {user?.role === 'USER' && (
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition z-10 ${
              isInWishlist ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {wishlistLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <FiHeart className={isInWishlist ? 'fill-current' : ''} />
            )}
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        <div onClick={handleProductClick} className="cursor-pointer mb-2">
          <h4 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 hover:text-emerald-600 transition-colors">
            {product.name}
          </h4>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4 mt-auto">
          <div>
            <div className="text-2xl font-bold text-emerald-600">${product.price}</div>
            <div className="text-xs text-gray-500">per unit</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-gray-700 font-semibold">
              <FiPackage className="text-emerald-600" />
              <span className="text-sm">{product.carbonFootprint}kg</span>
            </div>
            <div className="text-xs text-gray-500">CO₂</div>
          </div>
        </div>

        {/* Actions */}
        {user?.role === 'USER' && (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAddToCart}
              disabled={adding || !product.verified}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                product.verified
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm hover:shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {adding ? 'Adding...' : product.verified ? <><FiShoppingBag /> Add to Cart</> : 'Pending Verification'}
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}/compare`); }}
              className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            >
              Compare
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;