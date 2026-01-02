import React, { useState } from "react";
import { FaStar, FaRegStar, FaShoppingCart, FaPlus, FaMinus } from "react-icons/fa";
import { addToCart } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";

function SuggestedItems({ data }) {
  const dispatch = useDispatch();
  const { cartItems } = useSelector(state=>state.user)
  const [quantity, setQuantity] = useState(0);

  const foodRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-500 text-xs sm:text-sm" />
        ) : (
          <FaRegStar key={i} className="text-yellow-500 text-xs sm:text-sm" />
        )
      );
    }
    return stars;
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 0) {
      setQuantity(prev => prev - 1);
    }
  };

  const foodTypeColors = {
    Veg: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    NonVeg: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" }
  };

  const typeConfig = data.foodType === "Veg" ? foodTypeColors.Veg : foodTypeColors.NonVeg;

  return (
    <div className="relative group w-full">
      <div className="absolute inset-0 bg-linear-to-br from-orange-50/0 to-orange-100/0 group-hover:to-orange-100/30 rounded-2xl transition-all duration-300"></div>
      
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:border-orange-200 flex flex-col h-full">
        
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-linear-to-br from-gray-50 to-gray-100">
          <img
            src={data.image}
            alt={data.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Food Type Badge */}
          <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-mulish-regular font-semibold border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border} backdrop-blur-sm`}>
            {data.foodType}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-2 sm:p-3 grow flex flex-col">
          
          {/* Name and Price Row */}
          <div className="flex items-start justify-between sm:items-start mb-1 sm:mb-2 gap-1">
            {/* Name - Full width on mobile, 70% on larger */}
            <h3 className="font-mulish-regular font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-tight sm:pr-2 flex-1">
              {data.name}
            </h3>
            
            {/* Price */}
            <div className="shrink-0">
              <span className="font-mulish-regular font-bold text-orange-600 text-xs sm:text-sm whitespace-nowrap">
                Rs.{data.price}
              </span>
            </div>
          </div>

          {/* Category Badge */}
          <div className="mb-2 sm:mb-3">
            <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-mulish-regular font-medium ${typeConfig.bg} ${typeConfig.text}`}>
              {data.category}
            </span>
          </div>

          {/* Rating + Quantity Controls */}
          <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            
            {/* Rating */}
            <div className="flex items-center gap-1 justify-between sm:justify-start">
              <div className="flex items-center gap-0.5">
                {foodRating(data.rating?.average || 0)}
              </div>
              {data.rating?.count > 0 && (
                <span className="text-xs text-gray-500 ml-1 font-mulish-regular font-medium hidden sm:inline">
                  ({data.rating.count})
                </span>
              )}
            </div>

            {/*Add to cart */}
            <div className="flex items-center justify-center border border-orange-200 rounded-full overflow-hidden shadow-sm w-full sm:w-auto">
              <button 
                onClick={decreaseQuantity}
                className="px-1.5 py-1 sm:px-2 sm:py-1 hover:bg-orange-50 transition-colors flex-1 sm:flex-none"
                disabled={quantity === 0}>
                <FaMinus size={10} className={`${quantity === 0 ? "text-gray-400" : "text-gray-700"} mx-auto`} />
              </button>
              
              <span className="px-1.5 py-1 text-xs sm:text-sm font-medium min-w-[20px] text-center flex-1 sm:flex-none">
                {quantity || 0}
              </span>
              
              <button 
                onClick={increaseQuantity}
                className="px-1.5 py-1 sm:px-2 sm:py-1 hover:bg-orange-50 transition-colors flex-1 sm:flex-none"
              >
                <FaPlus size={10} className="text-gray-700 mx-auto" />
              </button>
              
              <button 
                className={`px-2 py-1.5 sm:px-3 sm:py-2 transition-colors flex-1 sm:flex-none ${
                  cartItems.some(item => item.id === data._id) 
                    ? "bg-gray-800 hover:bg-gray-900"  // Gray when already in cart
                    : quantity > 0 
                      ? "bg-[#ec4a09] hover:bg-orange-600"  // Orange when quantity > 0
                      : "bg-gray-200 cursor-not-allowed"    // Gray when quantity = 0
                }`}
                disabled={quantity === 0} 
                onClick={()=> //onclick py it sends items to cart with these details attached to it
                 dispatch(addToCart({
                    id: data._id,
                    name:data.name,
                    price: data.price,
                    image: data.image,
                    foodType: data.foodType,
                    quantity: quantity,
                    shop: data.shop,
                }))}
              >
                <FaShoppingCart size={12} 
                className={`${
                cartItems.some(item => item.id === data._id) ? "text-white"  // White when in cart
                : quantity > 0 ? "text-white" : "text-gray-400"  // Gray when quantity = 0
                } mx-auto`}  /> 
              </button>
            </div>
            
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-400/20 rounded-xl transition-all duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
}

export default SuggestedItems;