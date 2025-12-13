import React from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { MdOutlineRemoveShoppingCart } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CartItemCard from "../components/CartItemCard";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, totalAmountInCart } = useSelector((state) => state.user);
  
  return (
    <div className="min-h-screen bg-[#fff9f6] p-4 md:p-6">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate("/")}
            className="rounded-4xl transition-all duration-300 hover:bg-white">
            <IoArrowBackCircleOutline
              size={35}
              className="text-[#ec4a09] font-mulish-regular font-bold 
              group-hover:scale-110 transition-transform cursor-pointer duration-300"/>
          </button>
          <div className="flex items-center gap-3">
            
            <h1 className="text-2xl md:text-3xl font-mulish-regular font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Your Shopping Cart
            </h1>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {cartItems?.length === 0 ? (
          // Empty Cart State
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-8 rounded-3xl mb-6">
              <MdOutlineRemoveShoppingCart size={80} className="text-[#ec4a09] mx-auto mb-4" />
            </div>
            <h2 className="text-2xl font-mulish-regular font-bold text-gray-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Looks like you haven't added any delicious items to your cart yet!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r cursor-pointer from-orange-500 to-red-500 text-white font-mulish-regular font-bold px-8 py-3 rounded-full shadow-lg hover:from-orange-600 hover:to-red-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems?.map((item, index) => (
                <CartItemCard key={index} data={item} />
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-6 sticky top-6">
                <h3 className="font-mulish-regular font-bold text-xl text-gray-900 mb-6 pb-4 border-b border-gray-100">
                  Order Summary
                </h3>
                
                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">Rs.{totalAmountInCart}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                 
                  
                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mulish-regular font-extrabold text-lg text-gray-900">Total</span>
                      <div className="text-right">
                        <p className="font-mulish-regular font-extrabold text-2xl text-[#ec4a09]">
                          Rs.{totalAmountInCart}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <button
                  onClick={() =>navigate("/checkout")}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white 
                  font-mulish-regular font-extrabold py-4 rounded-xl shadow-lg
                   hover:from-orange-600 hover:to-red-600 hover:shadow-xl
                    transition-all duration-300 transform hover:-translate-y-1 
                    active:translate-y-0 mb-4 cursor-pointer">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;