import React, { useState } from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaMapMarkerAlt, FaStore, FaImage } from "react-icons/fa";
import { ClipLoader } from 'react-spinners';
import axios from "axios";
import { serverUrl } from "../App";
import { setGetShopData } from "../redux/ownerSlice";

function CreateEditShop() {
  const navigate = useNavigate();
  const [Loading, setLoading] = useState(false)
  const { getShopData } = useSelector((state) => state.owner);
  const { getCity, getState, getAddress } = useSelector((state) => state.user);
  const [name, setName] = useState(getShopData?.name || "")
  const [address, setAddress] = useState(getShopData?.address || getAddress || "")
  const [city, setCity] = useState(getShopData?.city || getCity || "")
  const [state, setState] = useState(getShopData?.state || getState || "")
  const [frontendImage, setFrontendImage] = useState(getShopData?.image || "")
  const [backendImage, setBackendImage] = useState(getShopData?.image || "")
  const [err, setErr] = useState("")
  const dispatch= useDispatch();

  // Handle file input change
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setLoading(true)
    if (file) {
      // Create URL for frontend preview
      const imageUrl = URL.createObjectURL(file);
      setFrontendImage(imageUrl);
      // You can set backendImage to the actual file for form submission
      setBackendImage(file);
      setLoading(false)
    }
  };

  const handleSubmit =async (e)=>{
    setLoading(true)
    e.preventDefault()
    try {
       const formData = new FormData()
       formData.append("name", name)
       formData.append("city", city)
       formData.append("state",state)
       formData.append("address",address)
       if(backendImage){
        formData.append("image",backendImage)
       }
       const result= await axios.post(`${serverUrl}/api/shop/create-edit-shop`,formData,{withCredentials:true})
       dispatch(setGetShopData(result.data))
       setErr("")
       setLoading(false)
       console.log(result)
    } catch (error) {
       setErr(error?.response?.data?.message)
       setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-4 md:p-6 relative">
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-4 md:left-6 z-10 group">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 hover:bg-white">
          <IoArrowBackCircleOutline size={24} className="text-[#ec4a09] font-mulish-extrabold group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-gray-700 hidden sm:block">Back</span>
        </div>
      </button>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border border-orange-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-linear-to-r from-orange-500 to-red-500 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm">
              <FaUtensils className="text-white w-12 h-12 sm:w-16 sm:h-16" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-mulish-extrabold text-white">
            {getShopData ? "Edit Your Shop" : "Start Your Shop"}
          </h1>
          <p className="text-orange-100 font-mulish-extrabold mt-2 text-sm sm:text-base">
            {getShopData ? "Update your shop details" : "Join thousands of successful restaurants"}
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="font-mulish-extrabold space-y-6">
            
            {/* Showing Error */}
            {err && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-center">
                {err}
              </div>
            )}

            {/* Shop Name */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FaStore className="text-[#ec4a09]" size={16} />
                Shop Name
              </label>
              <input
                type="text"
                value={name}
                className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 bg-white/70 placeholder-gray-400 text-gray-800 font-medium group-hover:border-orange-300"
                placeholder="Enter your shop name"
                onChange={(e)=>setName(e.target.value)}
                required
              />
            </div>

            {/* Shop Image */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FaImage className="text-[#ec4a09]" size={16} />
                Shop Image
              </label>
              
              {/* File Input */}
              <div className="relative">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 bg-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 group-hover:border-orange-300"
                  accept="image/*"
                  required
                />
              </div>
              
              {/* Image Preview - MOVED OUTSIDE the file input div */}
              {frontendImage && (
                <div className="mt-4 transition-all duration-300">
                  <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                  <img 
                    src={frontendImage} 
                    alt="Shop Preview" 
                    className="w-full max-w-xs h-48 object-cover rounded-2xl border-2 border-orange-200 shadow-lg mx-auto" 
                  />
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FaMapMarkerAlt className="text-[#ec4a09]" size={16} />
                Location Details
              </label>
              
              {/* City & State Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={city}
                    className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 bg-white/70 placeholder-gray-400 text-gray-800 font-medium group-hover:border-orange-300"
                    placeholder="City"
                    onChange={(e)=>setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={state}
                    className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 bg-white/70 placeholder-gray-400 text-gray-800 font-medium group-hover:border-orange-300"
                    placeholder="State"
                    onChange={(e)=>setState(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {/* Full Address */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={address}
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 bg-white/70 placeholder-gray-400 text-gray-800 font-medium group-hover:border-orange-300"
                  placeholder="Full shop address"
                  onChange={(e)=>setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={Loading}
              className="w-full bg-linear-to-r from-orange-500
               to-red-500 text-white font-mulish-extrabold text-lg 
               py-5 rounded-2xl transition-all duration-300 hover:from-orange-600
               hover:to-red-600 hover:shadow-2xl transform hover:-translate-y-1 
               active:translate-y-0 disabled:opacity-50 disabled:transform-none 
               disabled:hover:shadow-none group">
              {Loading ? (
                <div className="flex items-center justify-center gap-3">
                  <ClipLoader size={20} color="white" />
                  <span>Setting up your shop...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>{getShopData ? "Update Shop" : "Launch Your Shop"}</span>
                </div>
              )}
            </button>

          </form>

          {/* Additional Info */}
          <div className="text-center mt-6">
            <p className="text-xs font-mulish-extrabold text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

        </div>
        
      </div>
    </div>
  );
}

export default CreateEditShop;