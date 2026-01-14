import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import { useSelector } from 'react-redux'
import axios from 'axios';
import { serverUrl } from '../App';
import { FaMapMarkerAlt, FaBox, FaShoppingBag, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import { IoRefresh } from 'react-icons/io5';
import { MdRestaurant, MdDeliveryDining } from "react-icons/md";
import DeliveryBoyTracking from './DeliveryBoyTracking';

function DeliveryBoy() {
  const { userData } = useSelector((state) => state.user);
  const [availableAssign, setAvailableAssign] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOTPbox, setShowOTPbox] = useState(null)
  const [otp, setOTP]=useState("")

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
    const interval = setInterval(getAssignments, 10000);
    return () => clearInterval(interval);
  }, []);


  const getCurrentOrder = async () => {
    try {
      console.log("Fetching current active order...");
      const response = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true }
      );
      console.log("Current Order:", response.data);
      if(response.data.success && response.data.hasOrder){
        setCurrentOrder(response.data);
      }else{
        setCurrentOrder(null);
      }
    } catch (error) {
      console.error("Error getting current order:", error);
      setCurrentOrder(null);
    }
  };

  const acceptDelivery = async (assignmentId) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/order/accept-assignment`, {assignmentId},
        { withCredentials: true }
      );
      console.log("Delivery accepted:", response.data);
      setTimeout(() => {
            getCurrentOrder();
            getAssignments();
        }, 500);
      setAvailableAssign(prev => prev.filter(a => a.assignmentId !== assignmentId));
      alert("Delivery accepted successfully!");
      
    } catch (error) {
      console.error("Error accepting delivery:", error);
      alert("Failed to accept delivery: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSendOTP = async()=>{
   
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`, {orderId:currentOrder._id, shopOrderId:currentOrder.shopOrder._id},
        { withCredentials: true }
      );
      console.log("Current Order:", result.data);
       setShowOTPbox(true)
    } catch (error) {
      console.error("Error Sending OTP:", error);
      setCurrentOrder(null);
    }
  };

  const handleVerifyOTP = async()=>{
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`, {
          orderId:currentOrder._id, 
          shopOrderId:currentOrder.shopOrder._id,
          otp: otp,
        }, 
        { withCredentials: true }
      );
      console.log("OTP Verified Successfully:", result.data);
      alert("Order marked as delivered successfully!");
      setCurrentOrder(null);
      setShowOTPbox(false);
      setOTP("");
      await getAssignments();
    } catch (error) {
      console.error("Error Verifying OTP:", error);
      alert("Failed to verify OTP: " + (error.response?.data?.message || error.message));
    }
};

  useEffect(() => {
    getCurrentOrder();
    getAssignments();
  }, [userData]);

  // Calculate total for current order
  const calculateCurrentOrderTotal = () => {
    if (!currentOrder?.shopOrder?.shopOrderItems) return 0;
    return currentOrder.shopOrder.shopOrderItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
  };

  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
      <Navbar/>
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center mt-20'>
       
        {/* Header Card - Simple like OwnerCard */}
        <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-4 w-[90%]'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-3'>
            <div>
              <h2 className='text-lg font-bold text-gray-900'>Delivery Dashboard</h2>
              <p className='text-gray-600 text-sm mt-1'>
                Welcome, <span className='text-orange-600 font-medium'>{formattedName}</span>
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <div className='text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border'>
                <span className='font-medium text-orange-600'>Location: </span>
                {latitude && longitude 
                  ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                  : "Setting up..."}
              </div>
              <button
                onClick={() => {
                  getAssignments();
                  getCurrentOrder();
                }}
                disabled={refreshing}
                className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <IoRefresh className={refreshing ? "animate-spin" : ""} size={14} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Current Active Order - Clean & Compact */}
        {currentOrder && (
          <div className='bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition-all duration-200 p-4 w-[90%]'>
            {/* Header */}
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                  <MdDeliveryDining className="text-white" size={16} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Active Delivery</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Order #{currentOrder._id?.slice(-8)?.toUpperCase()}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      In Progress
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Address in one row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              {/* Customer Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FaUser className='text-orange-400' size={12} />
                  <p className="font-medium text-gray-900 text-sm">Customer</p>
                </div>
                <p className="text-sm text-gray-800 font-medium mb-1">
                  {currentOrder.user?.fullName || 'Customer'}
                </p>
                <div className="space-y-1">
                  {currentOrder.user?.mobile && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <FaPhone size={10} />
                      <span>{currentOrder.user.mobile}</span>
                    </div>
                  )}
                  {currentOrder.user?.email && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <FaEnvelope size={10} />
                      <span className="truncate">{currentOrder.user.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              {currentOrder.deliveryAddress && (
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-orange-400 mt-0.5" size={12} />
                    <div className='flex-col'>
                      <p className="font-medium text-gray-900 text-sm mb-1">Delivery To</p>
                      <p className="text-xs text-gray-700 line-clamp-2">{currentOrder.deliveryAddress.text}</p>
                      <p className='text-xs text-gray-500 mt-1'>
                        Lat: {currentOrder.deliveryAddress.latitude?.toFixed(4)} , 
                        Lon: {currentOrder.deliveryAddress.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items - Compact */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MdRestaurant className="text-orange-400" size={14} />
                <p className="font-medium text-gray-900 text-sm">Order Items</p>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full ml-auto">
                  {currentOrder.shopOrder?.shopOrderItems?.length || 0} items
                </span>
              </div>
              
              <div className="space-y-2">
                {currentOrder.shopOrder?.shopOrderItems?.map((item, index) => (
                  <div key={item._id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">Rs.{item.price * item.quantity}</p>
                      <p className="text-xs text-gray-500">Rs.{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Total */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              {/* Location Info */}
              {(currentOrder.deliveryBoyLocation || currentOrder.customerLocation) && (
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-blue-400" size={12} />
                    <p className="font-medium text-gray-900 text-sm">Location Details</p>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {currentOrder.deliveryBoyLocation && (
                      <p>
                        <span className="font-medium">Your Location: </span>
                        {currentOrder.deliveryBoyLocation.lat?.toFixed(4)}, {currentOrder.deliveryBoyLocation.lng?.toFixed(4)}
                      </p>
                    )}
                    {currentOrder.customerLocation && (
                      <p>
                        <span className="font-medium">Customer Location: </span>
                        {currentOrder.customerLocation.lat?.toFixed(4)}, {currentOrder.customerLocation.lng?.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div> 
              )}

              {/* Total */}
              <div className="flex-1 text-right sm:text-left">
                <p className="text-xs text-gray-500 mb-1">Order Total</p>
                <p className="text-xl font-bold text-gray-900">Rs.{calculateCurrentOrderTotal()}</p>
              </div>
            </div>

             <DeliveryBoyTracking data={currentOrder}/>
             
            {/* Footer - Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Status: <span className="font-medium text-green-600">Out for Delivery</span>
              </div>
              {!showOTPbox ? <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                onClick={handleSendOTP}>
                 Mark as Delivered
                </button>
              </div> : 
              <div className='mt-4 p-4 border rounded-xl bg-gray-50'>
                <p className='text-sm font-semibold mb-2'>Enter OTP Send to: <span className='text-orange-500'>{currentOrder.user.fullName.toLowerCase().split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span></p>
              <input type='text' 
              value={otp}
              placeholder='Enter OTP' 
              className='w-full border px-3 py-2 rounded-lg mb-3  focus:outline-none 
              focus:ring-2 focus:ring-orange-500'
              onChange={(e)=>setOTP(e.target.value)}
              />
              <button className='w-full bg-orange-500 text-white py-2 rounded-lg font-semibold
              hover:bg-orange-600 transition-all' onClick={handleVerifyOTP}>Submit OTP</button>
              </div>}
            </div>
          </div>
        )}

        {/* Available Orders - Clean & Compact */}
        {!currentOrder && (
          <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-4 w-[90%]'>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                  <span className="font-semibold text-white text-sm">#</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Available Orders</p>
                  <p className="text-xs text-gray-500">
                    {availableAssign.length > 0 
                      ? `${availableAssign.length} order${availableAssign.length !== 1 ? 's' : ''} available`
                      : 'No orders available'}
                  </p>
                </div>
              </div>
              {loading && (
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600"></div>
                  Loading...
                </div>
              )}
            </div>
            
            <div className='space-y-3'>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading available deliveries...</p>
                </div>
              ) : availableAssign.length > 0 ? (
                availableAssign.map((assignment, index) => {
                  const totalAmount = assignment.totalAmount || 
                    assignment.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                  
                  return (
                    <div 
                      className='border border-gray-200 rounded-lg p-3 hover:border-orange-300 transition-all duration-200'
                      key={assignment.assignmentId || index}
                    >
                      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
                        <div className='flex-1'>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                              <FaBox className="text-orange-500" size={12} />
                            </div>
                            <div>
                              <h3 className='font-bold text-gray-900 text-sm'>{assignment.shopName}</h3>
                              <p className='text-xs text-gray-500'>
                                Order: {assignment.orderId?.slice(-8)?.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2 text-xs mb-2">
                            <FaMapMarkerAlt className="text-orange-400 mt-0.5" size={10} />
                            <p className="text-gray-600 line-clamp-2 text-xs">
                              {assignment.deliveryAddress?.text || "Address not available"}
                            </p>
                          </div>
                          
                          <div className="text-xs text-gray-700">
                            <span className="font-medium">{assignment.items?.length || 0} items</span>
                            {assignment.items?.slice(0, 2).map((item, idx) => (
                              <span key={idx} className="ml-2">
                                {item.name} × {item.quantity}
                                {idx < Math.min(2, assignment.items.length - 1) ? ', ' : ''}
                              </span>
                            ))}
                            {assignment.items?.length > 2 && (
                              <span className="text-gray-500 ml-1">+{assignment.items.length - 2} more</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Right Side - Action Button & Total */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Total Amount</p>
                            <p className="font-bold text-gray-900">Rs.{totalAmount}</p>
                          </div>
                          
                          <button
                            onClick={() => acceptDelivery(assignment.assignmentId)}
                            className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                          >
                            Accept Delivery
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <FaShoppingBag className="text-gray-400" size={18} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No deliveries available</h3>
                  <p className="text-xs text-gray-600 mb-3 max-w-sm mx-auto">
                    You'll see delivery requests here when restaurants mark orders as "Out for Delivery" in your area.
                  </p>
                  <div className="text-xs text-gray-500">
                    <p>Your location: {latitude && longitude 
                      ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                      : "Not set"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Simple Status Message */}
        <div className='w-[90%] text-center'>
          <p className='text-xs text-gray-500'>
            {userData?.location?.coordinates 
              ? currentOrder 
                ? "You have an active delivery. Complete it to accept new orders."
                : "Your location is being tracked for nearby deliveries."
              : "Please enable location services to receive delivery requests."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DeliveryBoy