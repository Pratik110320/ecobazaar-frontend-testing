// src/pages/products/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productService, reviewService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiCheckCircle,
  FiStar,
  FiTag,
  FiHeart,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight,
  FiTruck,
  FiUsers,
  FiEye,
  FiCalendar,
  FiClock,
} from 'react-icons/fi';
import AddReview from '../../components/reviews/AddReview';
import ReviewList from '../../components/reviews/ReviewList';

const LOCAL_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2ltaXp6PSIxOCIgZmlsbD0iIzk2OTY5NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { checkInWishlist, toggleWishlist } = useWishlist();

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching product with ID:', id);
      const response = await productService.getById(id);
      console.log('✅ Product API Response:', response);
      
      const productData = response.data?.product ?? response.data;
      console.log('📦 Product data:', productData);
      
      setProduct(productData);
    } catch (err) {
      console.error('❌ loadProduct error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load product details';
        
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewService.getProductReviews(id);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    }
  };

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [id, user]);

  const handleAddToCart = async () => {
    if (!user) return;
    setAddingToCart(true);
    try {
      const result = await addToCart(product.id, 1);
      if (!result.success) {
        alert(result.error);
      }
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      alert('Please log in to manage your wishlist');
      return;
    }
    
    try {
      setWishlistLoading(true);
      await toggleWishlist(product.id);
    } catch (error) {
      console.error('❌ Wishlist error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update wishlist';
      alert(errorMessage);
    } finally {
      setWishlistLoading(false);
    }
  };

  const getEcoRatingClass = rating => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    switch (rating) {
      case 'A+': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'D': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleReviewAdded = () => {
    loadReviews();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={loadProduct} className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium">Retry</button>
            <button onClick={() => window.history.back()} className="px-5 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          <button onClick={() => window.history.back()} className="mt-4 px-5 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium">Browse Products</button>
        </div>
      </div>
    );
  }

  const isInWishlist = checkInWishlist(product.id);
  const imgSrc = imageError ? LOCAL_PLACEHOLDER : product.imageUrl || LOCAL_PLACEHOLDER;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            <div className="flex flex-col">
              <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square mb-4">
                <img src={imgSrc} alt={product.name || 'Product image'} onError={() => setImageError(true)} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 flex space-x-2">
                  {product.featured && <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200"><FiStar className="mr-1" />Featured</span>}
                  {!product.verified && <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200"><FiClock className="mr-1" />Pending</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name || 'Unnamed Product'}</h1>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">{product.description || 'No description available'}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-600">${product.price || '0.00'}</div>
                    <div className="text-sm text-emerald-700">Price</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{product.carbonFootprint || '0'}kg</div>
                    <div className="text-sm text-gray-600">Carbon Footprint</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"><FiTag className="mr-1" />{product.category || 'Uncategorized'}</span>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getEcoRatingClass(product.ecoRating)}`}><FiPackage className="mr-1" />Eco Rating: {product.ecoRating || 'N/A'}</span>
                </div>
              </div>

              {user?.role === 'USER' && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <button onClick={handleAddToCart} disabled={addingToCart || !product.verified} className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${product.verified ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm hover:shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                      {addingToCart ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Adding...</> : product.verified ? <><FiShoppingBag />Add to Cart</> : <><FiClock />Pending Verification</>}
                    </button>

                    <button onClick={handleWishlist} disabled={wishlistLoading} className={`py-3 px-4 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${isInWishlist ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      {wishlistLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>Updating...</> : <><FiHeart className={isInWishlist ? 'fill-current' : ''} />{isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}</>}
                    </button>
                  </div>
                  
                  {/* Compare Button */}
                  <a
                    href={`/products/${product.id}/compare`}
                    className="w-full py-3 px-4 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Compare with Alternatives
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            <button className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'details' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`} onClick={() => setActiveTab('details')}>Product Details</button>
            <button className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`} onClick={() => setActiveTab('reviews')}>Reviews ({reviews.length})</button>
            {product.carbonBreakdown && <button className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'carbon' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`} onClick={() => setActiveTab('carbon')}>Carbon Breakdown</button>}
          </div>
        </motion.div>

        <div>
          {activeTab === 'details' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center"><FiPackage className="mr-2 text-emerald-500" />Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl"><div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 mr-3"><FiUsers /></div><div><div className="font-medium text-gray-600">Seller</div><div className="text-gray-900">{product.sellerName || 'Unknown Seller'}</div></div></div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl"><div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 mr-3"><FiTag /></div><div><div className="font-medium text-gray-600">Category</div><div className="text-gray-900">{product.category || 'Uncategorized'}</div></div></div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl"><div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 mr-3"><FiPackage /></div><div><div className="font-medium text-gray-600">Stock Available</div><div className="text-gray-900">{product.quantity || 0} units</div></div></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl"><div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 mr-3"><FiEye /></div><div><div className="font-medium text-gray-600">Views</div><div className="text-gray-900">{product.viewCount || 0}</div></div></div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl"><div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 mr-3"><FiStar /></div><div><div className="font-medium text-gray-600">Average Rating</div><div className="text-gray-900">{product.averageRating || 0} ⭐ ({product.reviewCount || 0} reviews)</div></div></div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl"><div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 mr-3"><FiCheckCircle /></div><div><div className="font-medium text-gray-600">Verification Status</div><div className={product.verified ? 'text-emerald-600 font-medium' : 'text-orange-600 font-medium'}>{product.verified ? 'Verified' : 'Pending Verification'}</div></div></div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
              {user?.role === 'USER' && <AddReview productId={product.id} onReviewAdded={handleReviewAdded} />}
              <ReviewList reviews={reviews} />
            </motion.div>
          )}

          {activeTab === 'carbon' && product.carbonBreakdown && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center"><FiPackage className="mr-2 text-emerald-500" />Carbon Footprint Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100"><h4 className="font-semibold text-emerald-800 mb-2 flex items-center"><FiPackage className="mr-2" />Manufacturing</h4><div className="text-2xl font-bold text-emerald-600">{product.carbonBreakdown.manufacturing || 0}kg</div><p className="text-sm text-emerald-700 mt-1">Production process emissions</p></div>
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100"><h4 className="font-semibold text-blue-800 mb-2 flex items-center"><FiTruck className="mr-2" />Transportation</h4><div className="text-2xl font-bold text-blue-600">{product.carbonBreakdown.transportation || 0}kg</div><p className="text-sm text-blue-700 mt-1">Shipping and logistics</p></div>
                </div>
                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-xl p-5 border border-purple-100"><h4 className="font-semibold text-purple-800 mb-2 flex items-center"><FiPackage className="mr-2" />Packaging</h4><div className="text-2xl font-bold text-purple-600">{product.carbonBreakdown.packaging || 0}kg</div><p className="text-sm text-purple-700 mt-1">Materials and waste</p></div>
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-100"><h4 className="font-semibold text-amber-800 mb-2 flex items-center"><FiUsers className="mr-2" />Usage & Disposal</h4><div className="text-2xl font-bold text-amber-600">{(product.carbonBreakdown.usage || 0) + (product.carbonBreakdown.disposal || 0)}kg</div><p className="text-sm text-amber-700 mt-1">Product lifecycle impact</p></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
