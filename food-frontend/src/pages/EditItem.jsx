import React, { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaImage, FaEdit } from "react-icons/fa";
import { MdCategory, MdAttachMoney } from "react-icons/md";
import { ClipLoader } from 'react-spinners';
import axios from "axios";
import { serverUrl } from "../App";
import { setGetShopData } from "../redux/ownerSlice";

function EditItem() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("");
  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState(null);
  
  const dispatch = useDispatch();

  const categories = [
    "Snacks", "Main Course", "Dessert", "Pizza", "Burger", 
    "Sandwiches", "Pasta", "Desi Food", "Fast Food", "Homemade", 
    "Chinese", "Bakery", "Indian Food", "All"
  ];

  const foodTypes = ["Veg", "Non-veg", "Drink", "Sweet", "Other"];

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-item-by-id/${itemId}`,
          { withCredentials: true }
        );
        setCurrentItem(result.data);
      } catch (error) {
        setError(error?.response?.data?.message || "Failed to load item");
      } finally {
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [itemId]);

  useEffect(() => {
    if (currentItem) {
      setName(currentItem.name || "");
      setPrice(currentItem.price || "");
      setCategory(currentItem.category || "");
      setFoodType(currentItem.foodType || "");
      setFrontendImage(currentItem.image || "");
    }
  }, [currentItem]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFrontendImage(imageUrl);
      setBackendImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("foodType", foodType);
      formData.append("category", category);
      
      if (backendImage) {
        formData.append("image", backendImage);
      }
      
      const result = await axios.put(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        { withCredentials: true }
      );
      
      dispatch(setGetShopData(result.data));
      navigate('/');
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <ClipLoader size={40} color="#f97316" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2.5 bg-white text-orange-600 rounded-xl hover:bg-orange-50 
              transition-colors duration-200 shadow-sm hover:shadow"
          >
            <IoArrowBack size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Menu Item</h1>
            <p className="text-gray-500 text-sm">Update your item details</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center 
              justify-center mx-auto mb-4 backdrop-blur-sm">
              <FaEdit className="text-white text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-white">Edit Item</h2>
            <p className="text-orange-100 text-sm mt-1">Update your menu item</p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 
                rounded-xl text-center text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3
                    focus:outline-none focus:ring-2 focus:ring-orange-500 
                    focus:border-transparent transition-all bg-gray-50 
                    placeholder-gray-400 text-gray-800"
                  placeholder="Enter item name"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (Rs.)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 
                    text-gray-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl 
                      pl-10 pr-4 py-3 focus:outline-none focus:ring-2 
                      focus:ring-orange-500 focus:border-transparent 
                      transition-all bg-gray-50 placeholder-gray-400 
                      text-gray-800"
                    placeholder="0.00"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl 
                  p-4 text-center hover:border-orange-400 transition-colors 
                  cursor-pointer bg-gray-50">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    accept="image/*"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <FaImage className="text-gray-400 text-2xl mb-2" />
                      <p className="text-sm text-gray-600">Change image</p>
                      <p className="text-xs text-gray-400 mt-1">Click to upload new image</p>
                    </div>
                  </label>
                </div>
                
                {frontendImage && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                    <img 
                      src={frontendImage} 
                      alt="Item preview" 
                      className="w-full h-40 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Category & Food Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3
                      focus:outline-none focus:ring-2 focus:ring-orange-500 
                      focus:border-transparent transition-all bg-gray-50 
                      text-gray-800"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Food Type
                  </label>
                  <select
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3
                      focus:outline-none focus:ring-2 focus:ring-orange-500 
                      focus:border-transparent transition-all bg-gray-50 
                      text-gray-800"
                    required
                  >
                    <option value="">Select Type</option>
                    {foodTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 
                  text-white font-semibold py-3.5 rounded-xl transition-all 
                  duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 
                  disabled:cursor-not-allowed disabled:hover:scale-100 
                  disabled:hover:shadow-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <ClipLoader size={18} color="white" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Item"
                )}
              </button>
            </form>

            {/* Footer Note */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Changes will be visible to customers immediately
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditItem;