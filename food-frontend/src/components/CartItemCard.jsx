import React from 'react'
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { removeItemInCart, updateQuantityInCart } from '../redux/userSlice';

function CartItemCard({ data }) {
  const dispatch = useDispatch();
  
  const handleIncrement = (id, current_quantity) => {
    dispatch(updateQuantityInCart({ id, quantity: current_quantity + 1 }));
  }

  const handleDecrement = (id, current_quantity) => {
    if (current_quantity > 1) {
      dispatch(updateQuantityInCart({ id, quantity: current_quantity - 1 }));
    }
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden transition-all duration-300'>
      
      <div className='p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4'>
        
        {/* Image & Details */}
        <div className='flex items-center gap-4 w-full sm:w-auto'>
          {/* Image Container */}
          <div className='relative shrink-0'>
            <img 
              src={data.image} 
              alt={data.name}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl object-cover border-2 border-orange-100"
            />
            {/* Quantity Badge */}
            <div className='absolute -top-2 -right-2 bg-[#ec4a09] text-white text-xs font-bold rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg'>
              {data.quantity}
            </div>
          </div>
          
          {/* Details */}
          <div className='flex-1 min-w-0'>
            <h1 className='font-mulish-regular font-bold text-gray-900 text-base sm:text-lg line-clamp-1'>
              {data.name}
            </h1>
            <p className='font-mulish-regular text-gray-500 text-sm mt-1'>
              Rs.{data.price} per item
            </p>
            <div className='flex flex-col sm:flex-row sm:items-center gap-2 mt-2'>
              <span className='font-mulish-regular font-semibold text-lg text-[#ec4a09]'>
                Rs.{data.price * data.quantity}
              </span>
              <span className='text-gray-400 text-sm hidden sm:inline'>
                (Rs.{data.price} × {data.quantity})
              </span>
            </div>
          </div>
        </div>
        
        {/*Quantity */}
        <div className='flex items-center justify-between w-full sm:w-auto gap-4'>
          
          {/* Quantity Controls */}
          <div className='flex items-center gap-2 bg-orange-50 rounded-full p-2'>
            <button 
              className='w-8 h-8 rounded-full cursor-pointer bg-white shadow-md flex items-center justify-center hover:bg-orange-100 hover:scale-110 transition-all duration-200 disabled:opacity-50'
              onClick={() => handleDecrement(data.id, data.quantity)}
              disabled={data.quantity <= 1}
            >
              <FaMinus size={12} className="text-gray-700" />
            </button>
            
            <span className="font-mulish-regular font-bold text-gray-800 w-8 text-center text-sm sm:text-base">
              {data.quantity}
            </span>
            
            <button 
              className='w-8 h-8 rounded-full cursor-pointer bg-white shadow-md flex items-center justify-center hover:bg-orange-100 hover:scale-110 transition-all duration-200'
              onClick={() => handleIncrement(data.id, data.quantity)}
            >
              <FaPlus size={12} className="text-gray-700" />
            </button>
          </div>
          
          {/* Delete Button */}
          <button 
            className="p-3 bg-gradient-to-r from-rose-50 cursor-pointer to-pink-50 text-rose-600 rounded-xl shadow-md hover:from-rose-100 hover:to-pink-100 hover:shadow-lg hover:text-rose-700 transition-all duration-300"
            onClick={() => dispatch(removeItemInCart(data.id))}
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>
    </div>
  ) 
}

export default CartItemCard