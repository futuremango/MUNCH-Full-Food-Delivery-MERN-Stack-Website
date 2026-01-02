import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import { useSelector } from 'react-redux'
import axios from 'axios';
import { serverUrl } from '../App';
import { FaMapMarkerAlt, FaBox, FaShoppingBag } from 'react-icons/fa';
import { IoRefresh } from 'react-icons/io5';

function DeliveryBoy() {
  const { userData } = useSelector((state) => state.user);
  const [availableAssign, setAvailableAssign] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formattedName = userData?.fullName 
    ? userData.fullName.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    : "Delivery Partner";
  
  const latitude = userData?.location?.coordinates?.[1] || null;
  const longitude = userData?.location?.coordinates?.[0] || null;
  
  const getAssignments = async () => {
    try {
      setRefreshing(true);
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, 
        { withCredentials: true });
      
      console.log("Assignments received:", result.data);
      setAvailableAssign(result.data || []);
      
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAvailableAssign([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getAssignments();
  }, [userData]);

  useEffect(() => {
    const interval = setInterval(getAssignments, 10000);
    return () => clearInterval(interval);
  }, []);


  const getCurrentOrder = async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true }
      );
      console.log("Current Order:", response.data);
    } catch (error) {
      console.error("Error getting current order:", error);
    }
  };

  const acceptDelivery = async (assignmentId) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/order/accept-assignment`, {assignmentId},
        { withCredentials: true }
      );
      console.log("Delivery accepted:", response.data);
      getCurrentOrder()
      setAvailableAssign(prev => prev.filter(a => a.assignmentId !== assignmentId));
      alert("Delivery accepted successfully!");
      
    } catch (error) {
      console.error("Error accepting delivery:", error);
      alert("Failed to accept delivery: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
      <Navbar/>
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center mt-20'>
       
        {/* Header Card */}
        <div className='bg-white rounded-2xl shadow-md p-5 flex flex-col md:flex-row justify-between items-start md:items-center w-[90%] border border-orange-100 font-mulish-regular'>
          <div className='mb-3 md:mb-0'>
            <h2 className='text-xl font-bold text-gray-900'>Delivery Dashboard</h2>
            <p className='text-gray-600 mt-1'>
              Welcome, <span className='text-orange-600 font-semibold'>{formattedName}</span>
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <div className='bg-orange-50 px-4 py-2 rounded-lg border border-orange-100'>
              <p className='text-sm text-gray-700'>
                <span className='font-semibold text-orange-600'>Location: </span>
                {latitude && longitude 
                  ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                  : "Setting up location..."
                }
              </p>
            </div>
            <button
              onClick={getAssignments}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <IoRefresh className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
        
        {/* Status Message */}
        <div className='w-[90%] text-center'>
          <p className='text-gray-500 text-sm'>
            {userData?.location?.coordinates 
              ? "Your location is being tracked. You'll see available orders here."
              : "Please enable location services to receive delivery requests."
            }
          </p>
        </div>

        {/* Available Orders Card */}
        <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
          <div className="flex items-center justify-between mb-4">
            <h1 className='text-lg font-bold flex items-center gap-2'>
              <FaShoppingBag className="text-orange-500" />
              Available Orders
              {availableAssign.length > 0 && (
                <span className="text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                  {availableAssign.length}
                </span>
              )}
            </h1>
            {loading && (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                Loading...
              </div>
            )}
          </div>
          
          <div className='space-y-4'>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading available deliveries...</p>
              </div>
            ) : availableAssign.length > 0 ? (
              availableAssign.map((assignment, index) => (
                <div 
                  className='border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-sm transition-all duration-200'
                  key={assignment.assignmentId || index}
                >
                  <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div className='flex-1'>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <FaBox className="text-orange-500" size={18} />
                        </div>
                        <div>
                          <h3 className='font-bold text-gray-900'>{assignment.shopName}</h3>
                          <p className='text-sm text-gray-600'>
                            Order ID: {assignment.orderId?.slice(-8)?.toUpperCase() || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 mt-3 text-sm">
                        <FaMapMarkerAlt className="text-orange-400 mt-0.5" size={14} />
                        <div>
                          <p className="font-medium text-gray-700">Delivery Address:</p>
                          <p className="text-gray-600 line-clamp-2">
                            {assignment.deliveryAddress?.text || "Address not available"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Items List */}
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Items ({assignment.items?.length || 0}):</p>
                        <div className="space-y-1">
                          {assignment.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.name} × {item.quantity}
                              </span>
                              <span className="font-medium">Rs.{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side - Action Button & Total */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-xl font-bold text-gray-900">
                          Rs.{assignment.totalAmount || assignment.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => acceptDelivery(assignment.assignmentId)}
                        className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        Accept Delivery
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FaShoppingBag className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries available</h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  You'll see delivery requests here when restaurants mark orders as "Out for Delivery" in your area.
                </p>
                <div className="text-sm text-gray-500">
                  <p>Your current location:</p>
                  <p className="font-medium mt-1">
                    {latitude && longitude 
                      ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                      : "Location not set"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryBoy