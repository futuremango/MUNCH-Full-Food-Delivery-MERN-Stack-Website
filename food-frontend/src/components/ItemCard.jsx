import axios from 'axios'
import React from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setGetShopData } from "../redux/ownerSlice";

function ItemCard({ data }) { 
  const navigate = useNavigate()
   const dispatch = useDispatch()
    const handleDeleteItem = async () => {
      if (!window.confirm(`Are you sure you want to delete "${data.name}"?`)) {
      return;
      }
      try {
        const result = await axios.delete(`${serverUrl}/api/item/delete-item/${data._id}`,
          {withCredentials:true}
        )
        dispatch(setGetShopData(result.data));
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete item');
      }
    }

  return (
    <div className='bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group'>
      
      {/* Item Image */}
      <div className='relative overflow-hidden'>
        <img 
          src={data.image}  
          alt={data.name}   
          className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
        />
        
        {/* Food Type Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
          data.foodType === 'Veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' 
        }`}>
          {data.foodType} 
        </div>
        
        {/* Action Buttons */}
        <div className='absolute top-3 right-3 flex gap-2 group-hover:opacity-100 transition-opacity duration-300'>
          <button 
            onClick={() => navigate(`/edit-item/${data._id}`)} 
            className='bg-white/90 backdrop-blur-sm text-orange-600 p-2
             rounded-lg shadow-md hover:bg-white hover:scale-110 
             transition-all duration-200 cursor-pointer'>
            <FaEdit size={14} />
          </button>
          <button 
            onClick={handleDeleteItem} 
            className='bg-white/90 cursor-pointer backdrop-blur-sm text-red-600 p-2 rounded-lg shadow-md hover:bg-white hover:scale-110 transition-all duration-200'
          >
            <FaTrash size={14} />
          </button>
        </div>

        {/* For Small Devices */}
        <div className='md:hidden absolute top-3 right-3 flex gap-2 group-hover:opacity-100 transition-opacity duration-300'>
          <button 
            onClick={() => navigate(`/edit-item/${data._id}`)} 
            className='bg-white/90 backdrop-blur-sm text-orange-600 p-2
             rounded-lg shadow-md hover:bg-white hover:scale-110 
             transition-all duration-200 cursor-pointer'>
            <FaEdit size={14} />
          </button>
          <button 
            onClick={handleDeleteItem} 
            className='bg-white/90 cursor-pointer backdrop-blur-sm text-red-600 p-2 rounded-lg shadow-md hover:bg-white hover:scale-110 transition-all duration-200'
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>

      {/* Item Details */}
      <div className='p-4'>
        <div className='flex justify-between items-start mb-2'>
          <h3 className='font-mulish-extrabold text-lg text-gray-900 line-clamp-1 flex-1 mr-2'>
            {data.name} 
          </h3>
          <span className='font-mulish-extrabold text-xl text-[#ec4a09] whitespace-nowrap'>
            Rs.{data.price}
          </span>
        </div>

        <p className='text-sm text-gray-600 mb-3 bg-orange-50 px-3 py-1 rounded-full inline-block'>
          {data.category} 
        </p>
      </div>
    </div>
  )
}

export default ItemCard