import React from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { IoSearchSharp } from "react-icons/io5";
import { MdGpsFixed } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function PaymentMethodPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#fff9f6] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate("/my-cart")}
            className="rounded-4xl transition-all duration-300 hover:bg-white">
            <IoArrowBackCircleOutline
              size={35}
              className="text-[#ec4a09] font-mulish-regular font-bold 
              group-hover:scale-110 transition-transform cursor-pointer duration-300"/>
          </button>
          <div className="flex items-center gap-3">
            
            <h1 className="text-xl md:text-3xl font-mulish-regular font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Order Payment Method
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[900px] bg-white rounded-2xl shadow-xl mx-auto
      p-6 space-y-6">
      <section className="space-y-4">
        <h2 className="font-mulish-regular text-lg font-semibold
        mb-2 flex items-center gap-2 text-gray-800">
        <FaLocationDot className="text-[#ec4a09]"/>
        Delivery Location
        </h2>
        {/* {Input and Icons} */}
        <div className="flex gap-2 mb-3">
        <input
        type="text"
        className="flex-1 border-2 border-gray-200 rounded-xl px-5 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-white/50"
        placeholder="Full Delivery Address"
        required/>
        <button className="bg-[#ec4a09] hover:bg-[#ff4d2d] text-white px-3 py-1 rounded-xl
        text-sm items-center justify-center"><IoSearchSharp size={17}/></button>
        <button className="bg-blue-700 hover:bg-blue-500 text-white px-3 py-1 rounded-xl
        text-sm items-center justify-center">
        <MdGpsFixed size={17}/></button>
        </div>

      </section>
      </div>
    </div>
    </div>
  );
}

export default PaymentMethodPage;