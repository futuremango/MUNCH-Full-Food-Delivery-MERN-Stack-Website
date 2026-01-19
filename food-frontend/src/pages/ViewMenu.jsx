import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FaFilter, 
  FaSearch, 
  FaStar, 
  FaFire, 
  FaLeaf, 
  FaDrumstickBite,
  FaUtensils,
  FaArrowLeft,
  FaSortAmountDown,
  FaSortAmountUp,
  FaImage,
  FaEye,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import { MdLocalOffer, MdFastfood, MdOutlineCategory } from 'react-icons/md';
import { GiKnifeFork } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import OwnerSidebar from '../components/OwnerSidebar';
import axios from 'axios';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setGetShopData } from '../redux/ownerSlice';

function ViewMenu() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getShopData } = useSelector((state) => state.owner);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState('');

  // Get unique categories from items
  const categories = ['All', ...new Set(getShopData?.items?.map(item => item.category) || [])];
  
  // Filter and sort items
  const filteredItems = getShopData?.items?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'price') {
      return sortOrder === 'asc' 
        ? a.price - b.price
        : b.price - a.price;
    } else if (sortBy === 'popularity') {
      // This would be based on actual order data, using random for demo
      const aPopularity = a.orderCount || Math.floor(Math.random() * 100);
      const bPopularity = b.orderCount || Math.floor(Math.random() * 100);
      return sortOrder === 'asc' 
        ? aPopularity - bPopularity
        : bPopularity - aPopularity;
    }
    return 0;
  });

  // Get stats
  const totalItems = getShopData?.items?.length || 0;
  const totalVeg = getShopData?.items?.filter(item => item.foodType === 'Veg').length || 0;
  const totalNonVeg = getShopData?.items?.filter(item => item.foodType === 'Non-Veg').length || 0;
  const averagePrice = getShopData?.items?.reduce((sum, item) => sum + item.price, 0) / totalItems || 0;

  // Handle delete item
  const handleDeleteItem = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }
    
    setDeletingId(itemId);
    try {
      const result = await axios.delete(`${serverUrl}/api/item/delete-item/${itemId}`,
        { withCredentials: true }
      );
      dispatch(setGetShopData(result.data));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle image fullscreen
  const handleImageClick = (imageUrl) => {
    setFullscreenImage(imageUrl);
    setIsImageFullscreen(true);
  };

  // Get food type icon
  const getFoodTypeIcon = (type) => {
    switch(type) {
      case 'Veg': return <FaLeaf className="text-green-600" />;
      case 'Non-Veg': return <FaDrumstickBite className="text-red-600" />;
      default: return <FaUtensils className="text-gray-600" />;
    }
  };

  // Get food type color
  const getFoodTypeColor = (type) => {
    switch(type) {
      case 'Veg': return 'bg-green-100 text-green-800 border-green-200';
      case 'Non-Veg': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // If no shop data
  if (!getShopData) {
    return (
      <div className="w-full min-h-screen bg-linear-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/40 shadow-2xl text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center">
            <FaUtensils className="text-white text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Restaurant Found</h2>
          <p className="text-gray-600 mb-6">You need to create a restaurant first to view the menu.</p>
          <button
            onClick={() => navigate('/create-edit-shop')}
            className="px-8 py-3 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Create Restaurant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-[#fff9f6] via-white to-orange-50/30">
      <OwnerSidebar />
      
      <div className="md:ml-64 min-h-screen flex flex-col">
        {/* Fullscreen Image Modal */}
        <AnimatePresence>
          {isImageFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
              onClick={() => setIsImageFullscreen(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-4xl max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={fullscreenImage}
                  alt="Fullscreen"
                  className="w-full h-full object-contain rounded-2xl"
                />
                <button
                  onClick={() => setIsImageFullscreen(false)}
                  className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header with Back Button */}
              <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate('/')}
                      className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-x-1 transition-all duration-300 group"
                    >
                      <FaArrowLeft className="text-gray-600 group-hover:text-orange-600 transition-colors" size={20} />
                    </button>
                    <div className="flex-1">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {getShopData.name}'s <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-red-600">Menu</span>
                      </h1>
                      <p className="text-gray-600 flex items-center gap-2">
                        <FaUtensils className="text-orange-500" />
                        <span>Manage your restaurant's delicious offerings</span>
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate('/add-item')}
                    className="px-6 py-3.5 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 group"
                  >
                    <span>+ Add New Item</span>
                    <GiKnifeFork className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <div className="bg-linear-to-br from-white to-orange-50/50 rounded-2xl p-5 border border-orange-100/50 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Items</p>
                        <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-linear-to-r from-orange-100 to-red-100 flex items-center justify-center">
                        <MdFastfood className="text-orange-600 text-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-white to-green-50/50 rounded-2xl p-5 border border-green-100/50 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Veg Items</p>
                        <p className="text-2xl font-bold text-gray-900">{totalVeg}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-linear-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                        <FaLeaf className="text-green-600 text-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-white to-red-50/50 rounded-2xl p-5 border border-red-100/50 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Non-Veg</p>
                        <p className="text-2xl font-bold text-gray-900">{totalNonVeg}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-linear-to-r from-red-100 to-rose-100 flex items-center justify-center">
                        <FaDrumstickBite className="text-red-600 text-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-white to-purple-50/50 rounded-2xl p-5 border border-purple-100/50 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Avg. Price</p>
                        <p className="text-2xl font-bold text-gray-900">Rs.{averagePrice.toFixed(0)}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-linear-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                        <MdLocalOffer className="text-purple-600 text-xl" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls Section */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/40 p-6 mb-10 shadow-xl">
                  <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                    {/* Search Bar */}
                    <div className="flex-1 w-full">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search menu items..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-xl 
                            focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500
                            transition-all duration-300 placeholder:text-gray-400 text-gray-800"
                        />
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-3">
                      <MdOutlineCategory className="text-gray-400 text-xl" />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none 
                          focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-800"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="p-3 rounded-xl bg-white/50 border border-gray-200 hover:border-orange-300 
                          hover:bg-orange-50/30 transition-all duration-300"
                      >
                        {sortOrder === 'asc' ? (
                          <FaSortAmountDown className="text-gray-600" />
                        ) : (
                          <FaSortAmountUp className="text-gray-600" />
                        )}
                      </button>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none 
                          focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-gray-800"
                      >
                        <option value="name">Name</option>
                        <option value="price">Price</option>
                        <option value="popularity">Popularity</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items Grid */}
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
                </div>
              ) : sortedItems.length === 0 ? (
                <div className="text-center py-16 bg-white/50 rounded-3xl border border-white/40 backdrop-blur-sm">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                    <MdFastfood className="text-gray-400 text-4xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">No items found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchQuery || selectedCategory !== 'All' 
                      ? 'Try changing your search or filter criteria'
                      : 'Start by adding your first menu item'}
                  </p>
                  <button
                    onClick={() => navigate('/add-item')}
                    className="px-8 py-3 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    + Add First Item
                  </button>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {sortedItems.map((item) => (
                    <motion.div
                      key={item._id}
                      variants={itemVariants}
                      whileHover={{ y: -8, transition: { duration: 0.2 } }}
                      className="group"
                    >
                      <div className="bg-linear-to-br from-white to-orange-50/30 rounded-2xl border border-orange-100/50 
                        overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col"
                      >
                        {/* Image Section */}
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800'}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                            onClick={() => handleImageClick(item.image)}
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          {/* Top Badges */}
                          <div className="absolute top-4 left-4 flex gap-2">
                            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${getFoodTypeColor(item.foodType)} 
                              backdrop-blur-sm flex items-center gap-1.5`}>
                              {getFoodTypeIcon(item.foodType)}
                              <span>{item.foodType}</span>
                            </div>
                            {item.orderCount > 50 && (
                              <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 
                                border border-orange-200 backdrop-blur-sm flex items-center gap-1.5">
                                <FaFire />
                                <span>Popular</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 
                            transition-opacity duration-300">
                            <button
                              onClick={() => handleImageClick(item.image)}
                              className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-gray-600 hover:text-orange-600 
                                hover:scale-110 transition-all duration-200 shadow-lg"
                              title="View Image"
                            >
                              <FaEye size={14} />
                            </button>
                            <button
                              onClick={() => navigate(`/edit-item/${item._id}`)}
                              className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-blue-600 hover:text-blue-700 
                                hover:scale-110 transition-all duration-200 shadow-lg"
                              title="Edit Item"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id, item.name)}
                              disabled={deletingId === item._id}
                              className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-red-600 hover:text-red-700 
                                hover:scale-110 transition-all duration-200 shadow-lg disabled:opacity-50"
                              title="Delete Item"
                            >
                              {deletingId === item._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                              ) : (
                                <FaTrash size={14} />
                              )}
                            </button>
                          </div>
                          
                          {/* Category Badge */}
                          <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 text-white 
                              backdrop-blur-sm border border-white/20">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1 flex-1 mr-3">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-1 bg-linear-to-r from-orange-500 to-red-500 text-white 
                              px-3 py-1.5 rounded-full font-bold text-lg">
                              <span>Rs.</span>
                              <span>{item.price}</span>
                            </div>
                          </div>

                          {item.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                              {item.description}
                            </p>
                          )}

                          {/* Stats Row */}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <FaStar className="text-yellow-500" />
                                <span>4.5</span>
                                <span className="text-gray-300">•</span>
                                <span>{item.orderCount || '0'} orders</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => navigate(`/edit-item/${item._id}`)}
                              className="px-4 py-2 bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg 
                                font-medium hover:from-gray-200 hover:to-gray-300 hover:text-gray-900 
                                transition-all duration-300 text-sm flex items-center gap-2"
                            >
                              <FaEdit size={12} />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Floating Add Button for Mobile */}
              <button
                onClick={() => navigate('/add-item')}
                className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-linear-to-r from-orange-500 to-red-500 
                  text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 
                  flex items-center justify-center z-40"
              >
                <span className="text-2xl">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewMenu;