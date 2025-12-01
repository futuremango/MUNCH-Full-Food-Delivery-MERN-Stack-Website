import React, { useState } from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useDispatch} from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaStore, FaImage } from "react-icons/fa";
import { ClipLoader } from 'react-spinners';
import axios from "axios";
import { serverUrl } from "../App";
import { setGetShopData } from "../redux/ownerSlice";
import { BiSolidCategory } from "react-icons/bi";
import { FaMoneyCheckDollar } from "react-icons/fa6";

function AddItem() {
  const navigate = useNavigate();
  const [Loading, setLoading] = useState(false)
//const { getShopData } = useSelector((state) => state.owner);
  const [name, setName] = useState("")
  const [category, setCategory] = useState();
  const categories =[
        "Snacks",
        "Main Course",
        "Dessert",
        "Pizza",
        "Burger",
        "Sandwiches",
        "Pasta",
        "Desi Food",
        "Fast Food",
        "Homemade",
        "Chinese",
        "Bakery",
        "Indian Food",
        "Others",
  ]
  const [foodType, setFoodType] = useState();
  const [price, setPrice] = useState("")
  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)
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
       formData.append("price", price)
       formData.append("foodType", foodType)
       formData.append("category", category)
       if(backendImage){
        formData.append("image",backendImage)
       }
       const result= await axios.post(`${serverUrl}/api/item/add-item`,formData,{withCredentials:true})
       dispatch(setGetShopData(result.data))
       setErr("")
       setLoading(false)
       navigate('/')
    } catch (error) {
        console.log("Error details:", error) // Debug log
       setErr(error?.response?.data?.message)
       setLoading(false)
    }
  };

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
            Add New Menu Item
          </h1>
          <p className="text-orange-100 font-mulish-extrabold mt-2 text-sm sm:text-base">
            Bring new flavourful tastes into this world
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

            {/* Item Name */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
               <FaStore className="text-[#ec4a09]" size={16} />
                 Item Name
              </label>
              <input
                type="text"
                value={name}
                className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 bg-white/70 placeholder-gray-400 text-gray-800 font-medium group-hover:border-orange-300"
                placeholder="Enter your item name"
                onChange={(e)=>setName(e.target.value)}
                required
              />
            </div>

             {/* Price */}
              <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <FaMoneyCheckDollar className="text-[#ec4a09]" size={16} />
                 Item Price
              </label>
                <input
                  type="Number"
                  value={price}
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 bg-white/70 placeholder-gray-400 text-gray-800 font-medium group-hover:border-orange-300"
                  placeholder="Price"
                  onChange={(e)=>setPrice(e.target.value)}
                  required
                />
              </div>

            {/* Item Image */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FaImage className="text-[#ec4a09]" size={16} />
                 Item Image
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

            {/* Category Section */}
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <BiSolidCategory className="text-[#ec4a09]" size={16} />
                   Item Category
              </label>
              
              {/* Category & Food Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <select
                    value={category}
                    className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 bg-white/70 placeholder-gray-400 text-gray-800 font-medium group-hover:border-orange-300"
                    onChange={(e)=>setCategory(e.target.value)}
                    required> 
                    <option value="">Select Food Category</option>
                    {categories.map((cat,index)=>(
                        <option value={cat} key={index}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <select
                    value={foodType}
                    className="w-full border-2 border-gray-200 rounded-2xl
                     px-5 py-4 focus:outline-none focus:border-orange-500
                      focus:ring-4 focus:ring-orange-100 transition-all 
                      duration-300 bg-white/70 placeholder-gray-400 text-gray-800 
                      font-medium group-hover:border-orange-300"
                    onChange={(e)=>setFoodType(e.target.value)}
                    required>
                    <option value="">Select Food Type</option>
                    <option value="Veg">Veg</option>
                    <option value="Non-veg">Non-Veg</option>
                    </select>
                </div>
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
                  <span>Adding up new item...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                     Add New Item
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

export default AddItem;