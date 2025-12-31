import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaStore, FaMapMarkerAlt, FaImage } from "react-icons/fa";
import { ClipLoader } from 'react-spinners';
import axios from "axios";
import { serverUrl } from "../App";
import { setGetShopData } from "../redux/ownerSlice";

function CreateEditShop() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { getShopData } = useSelector((state) => state.owner);
  const { getCity, getState, getAddress } = useSelector((state) => state.user);
  
  const [name, setName] = useState(getShopData?.name || "");
  const [address, setAddress] = useState(getShopData?.address || getAddress || "");
  const [city, setCity] = useState(getShopData?.city || getCity || "");
  const [state, setState] = useState(getShopData?.state || getState || "");
  const [frontendImage, setFrontendImage] = useState(getShopData?.image || "");
  const [backendImage, setBackendImage] = useState(getShopData?.image || null);
  
  const dispatch = useDispatch();
  const isEditMode = !!getShopData;

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
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);
      
      if (backendImage && typeof backendImage !== 'string') {
        formData.append("image", backendImage);
      }
      
      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit-shop`, 
        formData, 
        { withCredentials: true }
      );
      
      dispatch(setGetShopData(result.data));
      navigate('/');
    } catch (error) {
      setError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? "Edit Restaurant" : "Create Restaurant"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isEditMode ? "Update your restaurant details" : "Set up your restaurant profile"}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center 
              justify-center mx-auto mb-4 backdrop-blur-sm">
              <FaStore className="text-white text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isEditMode ? "Update Details" : "Restaurant Setup"}
            </h2>
            <p className="text-orange-100 text-sm mt-1">
              {isEditMode ? "Make changes to your restaurant" : "Let's get your restaurant online"}
            </p>
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
              {/* Restaurant Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3
                    focus:outline-none focus:ring-2 focus:ring-orange-500 
                    focus:border-transparent transition-all bg-gray-50 
                    placeholder-gray-400 text-gray-800"
                  placeholder="Enter restaurant name"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Restaurant Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl 
                  p-4 text-center hover:border-orange-400 transition-colors 
                  cursor-pointer bg-gray-50">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="restaurant-image"
                    accept="image/*"
                    required={!isEditMode}
                  />
                  <label htmlFor="restaurant-image" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <FaImage className="text-gray-400 text-2xl mb-2" />
                      <p className="text-sm text-gray-600">
                        {isEditMode ? "Change restaurant image" : "Upload restaurant image"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </label>
                </div>
                
                {(frontendImage || isEditMode) && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img 
                      src={frontendImage || getShopData?.image} 
                      alt="Restaurant preview" 
                      className="w-full h-40 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Location Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-orange-500" />
                    Location Details
                  </div>
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3
                        focus:outline-none focus:ring-2 focus:ring-orange-500 
                        focus:border-transparent transition-all bg-gray-50 
                        placeholder-gray-400 text-gray-800"
                      placeholder="City"
                      required
                    />
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3
                        focus:outline-none focus:ring-2 focus:ring-orange-500 
                        focus:border-transparent transition-all bg-gray-50 
                        placeholder-gray-400 text-gray-800"
                      placeholder="State"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3
                      focus:outline-none focus:ring-2 focus:ring-orange-500 
                      focus:border-transparent transition-all bg-gray-50 
                      placeholder-gray-400 text-gray-800"
                    placeholder="Full address"
                    required
                  />
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
                    <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                  </div>
                ) : (
                  isEditMode ? "Update Restaurant" : "Create Restaurant"
                )}
              </button>
            </form>

            {/* Footer Note */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                {isEditMode 
                  ? "Changes will be visible to customers immediately"
                  : "Your restaurant will be live immediately after creation"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateEditShop;