import React, { useEffect, useState, useCallback } from 'react'
import Navbar from './Navbar'
import { useSelector } from 'react-redux'
import axios from 'axios';
import { serverUrl } from '../App';
import { 
  FaMapMarkerAlt, 
  FaBox, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaClock,
  FaCalendarDay,
  FaMotorcycle
} from 'react-icons/fa';
import { IoRefresh, IoCheckmarkCircle } from 'react-icons/io5';
import { MdRestaurant, MdDeliveryDining, MdOutlineAttachMoney } from "react-icons/md";
import { GiDeliveryDrone } from "react-icons/gi";
import DeliveryBoyTracking from './DeliveryBoyTracking';
import { useSocket } from '../hooks/useSocket'; 

function DeliveryBoy() {
  const { userData } = useSelector((state) => state.user);
  const [availableAssign, setAvailableAssign] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, emit, on, off } = useSocket();
  const [refreshing, setRefreshing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOTPbox, setShowOTPbox] = useState(false);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [otp, setOTP] = useState("");
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [isAccepting, setIsAccepting] = useState({});

  // In DeliveryBoy.jsx location watcher - ADD THROTTLING
useEffect(() => {
    if (!socket || userData?.role !== "deliveryBoy") return;

    let watchId;
    let lastEmitTime = 0; // ✅ Track last emit time
    
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const latitude = position.coords?.latitude;
                const longitude = position.coords?.longitude;
                setDeliveryBoyLocation({ lat: latitude, lng: longitude });
                
                // ✅ Throttle socket emissions (every 10 seconds)
                const now = Date.now();
                if (now - lastEmitTime > 10000 && socket.connected) {
                    lastEmitTime = now;
                    emit('updateLocation', {
                        latitude,
                        longitude,
                        userId: userData._id,
                    });
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000, // ✅ Cache for 10 seconds
                timeout: 5000
            }
        );
    }
    
    return () => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
        }
    };
}, [socket, userData, emit]);

  const formattedName = userData?.fullName 
    ? userData.fullName.split(' ')[0]
    : "Partner";

  const locationText = userData?.location?.coordinates 
    ? `${userData.location.coordinates[1]?.toFixed(4)}, ${userData.location.coordinates[0]?.toFixed(4)}`
    : "Location not set";

  // Memoized functions
  const getTodayDeliveries = useCallback(async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { withCredentials: true });
      setTodayDeliveries(result?.data?.todayDeliveries || []);
    } catch (error) {
      console.error("Error fetching today's deliveries:", error);
    }
  }, []);

  const getAssignments = useCallback(async () => {
    try {
      setRefreshing(true);
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, { withCredentials: true });
      setAvailableAssign(result.data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAvailableAssign([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const getCurrentOrder = useCallback(async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true }
      );
      if (response.data.success && response.data.hasOrder) {
        setCurrentOrder(response.data);
      } else {
        setCurrentOrder(null);
      }
    } catch (error) {
      console.error("Error getting current order:", error);
      setCurrentOrder(null);
    }
  }, []);

  // Single interval for all data fetching
  useEffect(() => {
    const fetchAllData = () => {
      getCurrentOrder();
      getAssignments();
      getTodayDeliveries();
    };

    fetchAllData(); // Initial fetch
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, [getCurrentOrder, getAssignments, getTodayDeliveries]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !userData) return;

    const handleNewAssignment = () => {
      getAssignments();
    };

    const handleStatusUpdate = (data) => {
      if (currentOrder && data.orderId === currentOrder._id) {
        getCurrentOrder();
      }
    };

    const handleDeliveryCompleted = (data) => {
      if (currentOrder && data.orderId === currentOrder._id) {
        setCurrentOrder(null);
        getAssignments();
      }
    };

    on('newDeliveryAssignment', handleNewAssignment);
    on('deliveryStatusUpdate', handleStatusUpdate);
    on('deliveryBoyAccepted', handleDeliveryCompleted);

    return () => {
      off('newDeliveryAssignment', handleNewAssignment);
      off('deliveryStatusUpdate', handleStatusUpdate);
      off('deliveryBoyAccepted', handleDeliveryCompleted);
    };
  }, [socket, userData, currentOrder, getAssignments, getCurrentOrder, on, off]);

  // Accept delivery with debounce protection
  const acceptDelivery = async (assignmentId) => {
    if (isAccepting[assignmentId]) return; // Prevent multiple clicks
    
    setIsAccepting(prev => ({ ...prev, [assignmentId]: true }));
    
    try {
      await axios.post(
        `${serverUrl}/api/order/accept-assignment`,
        { assignmentId },
        { withCredentials: true }
      );
      
      // Optimistic update
      setAvailableAssign(prev => prev.filter(a => a.assignmentId !== assignmentId));
      
      // Fetch updated data with slight delay
      setTimeout(() => {
        getCurrentOrder();
        getAssignments();
      }, 300);
    } catch (error) {
      console.error("Error accepting delivery:", error);
      alert("Failed to accept delivery: " + (error.response?.data?.message || error.message));
      // Revert optimistic update on error
      getAssignments();
    } finally {
      setIsAccepting(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  const handleSendOTP = async () => {
    try {
      await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id },
        { withCredentials: true }
      );
      setShowOTPbox(true);
    } catch (error) {
      console.error("Error Sending OTP:", error);
      alert("Failed to send OTP: " + (error.response?.data?.message || error.message));
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp: otp,
        },
        { withCredentials: true }
      );
      alert("Order marked as delivered successfully!");
      setCurrentOrder(null);
      setShowOTPbox(false);
      setOTP("");
      getAssignments();
      getTodayDeliveries();
    } catch (error) {
      console.error("Error Verifying OTP:", error);
      alert("Failed to verify OTP: " + (error.response?.data?.message || error.message));
    }
  };

  const calculateCurrentOrderTotal = () => {
    if (!currentOrder?.shopOrder?.shopOrderItems) return 0;
    return currentOrder.shopOrder.shopOrderItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
  };

  const totalEarnings = todayDeliveries.reduce((sum) => {
    const deliveryFee = 50; // Assuming fixed delivery fee
    return sum + deliveryFee;
  }, 0);

  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
      <Navbar />
      
      <div className='max-w-4xl mx-auto px-4 py-6'>
        {/* Dashboard Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-sm text-gray-500 mb-1 '>Today's Deliveries</p>
                <p className='text-2xl font-bold text-gray-900'>{todayDeliveries.length}</p>
              </div>
              <div className='w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center'>
                <FaCalendarDay className='text-orange-600' size={18} />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Available Orders</p>
                <p className='text-2xl font-bold text-gray-900'>{availableAssign.length}</p>
              </div>
              <div className='w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center'>
                <FaBox className='text-blue-600' size={18} />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Today's Earnings</p>
                <p className='text-2xl font-bold text-gray-900'>Rs.{totalEarnings}</p>
              </div>
              <div className='w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center'>
                <MdOutlineAttachMoney className='text-green-600' size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Header Card */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>Delivery Dashboard</h1>
              <p className='text-gray-600 text-sm mt-1'>
                Welcome, <span className='text-orange-600 font-medium'>{formattedName}</span>
              </p>
            </div>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
              <div className='text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border'>
                <span className='font-medium text-gray-600'>📍 </span>
                {locationText}
              </div>
              <button
                onClick={() => {
                  getAssignments();
                  getCurrentOrder();
                  getTodayDeliveries();
                }}
                disabled={refreshing}
                className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <IoRefresh className={refreshing ? "animate-spin" : ""} size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Current Active Order */}
        {currentOrder ? (
          <div className='space-y-6'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
              {/* Order Header */}
              <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <GiDeliveryDrone className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Active Delivery</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <FaClock size={12} />
                        <span>Order #{currentOrder._id?.slice(-6)?.toUpperCase()}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          In Progress
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <FaUser className='text-orange-600' size={14} />
                      </div>
                      <h3 className="font-medium text-gray-900">Customer Details</h3>
                    </div>
                    <div className="pl-2">
                      <p className="font-medium text-gray-800">{currentOrder.user?.fullName || 'Customer'}</p>
                      <div className="space-y-1 mt-2">
                        {currentOrder.user?.mobile && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaPhone size={12} />
                            <span>{currentOrder.user.mobile}</span>
                          </div>
                        )}
                        {currentOrder.user?.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaEnvelope size={12} />
                            <span className="truncate">{currentOrder.user.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {currentOrder.deliveryAddress && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FaMapMarkerAlt className="text-blue-600" size={14} />
                        </div>
                        <h3 className="font-medium text-gray-900">Delivery Address</h3>
                      </div>
                      <div className="pl-2">
                        <p className="text-sm text-gray-700 line-clamp-2">{currentOrder.deliveryAddress.text}</p>
                        <p className='text-xs text-gray-500 mt-1'>
                          Lat: {currentOrder.deliveryAddress.latitude?.toFixed(4)} • Lon: {currentOrder.deliveryAddress.longitude?.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <MdRestaurant className="text-purple-600" size={16} />
                      </div>
                      <h3 className="font-medium text-gray-900">Order Items</h3>
                    </div>
                    <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      {currentOrder.shopOrder?.shopOrderItems?.length || 0} items
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {currentOrder.shopOrder?.shopOrderItems?.map((item, index) => (
                      <div key={item._id || index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
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

                {/* Live Tracking */}
                <div className="mb-6">
                  <DeliveryBoyTracking 
                    data={{
                      deliveryBoyLocation: deliveryBoyLocation || { 
                        lat: userData?.location?.coordinates?.[1],
                        lng: userData?.location?.coordinates?.[0]
                      },
                      customerLocation: {
                        lat: currentOrder?.deliveryAddress?.latitude,
                        lng: currentOrder?.deliveryAddress?.longitude
                      }
                    }} 
                  />
                </div>

                {/* Total & Actions */}
                <div className="border-t pt-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order Total</p>
                      <p className="text-2xl font-bold text-gray-900">Rs.{calculateCurrentOrderTotal()}</p>
                    </div>
                    
                    {!showOTPbox ? (
                      <button 
                        onClick={handleSendOTP}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium shadow-sm hover:shadow transition-all w-full sm:w-auto"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <IoCheckmarkCircle size={18} />
                          Mark as Delivered
                        </div>
                      </button>
                    ) : (
                      <div className='w-full sm:w-96'>
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                          <p className='font-medium text-gray-800 mb-3 text-center'>
                            Enter OTP sent to customer
                          </p>
                          <div className='flex gap-2 mb-3'>
                            <input 
                              type='text' 
                              value={otp}
                              placeholder='Enter 4-digit OTP' 
                              className='flex-1 border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-lg'
                              onChange={(e) => setOTP(e.target.value)}
                              maxLength={4}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={handleVerifyOTP}
                              className='flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-all'
                            >
                              Verify OTP
                            </button>
                            <button 
                              onClick={() => setShowOTPbox(false)}
                              className='px-4 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all'
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Available Orders */
          <div className='space-y-6'>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <FaMotorcycle className="text-white" size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Available Orders</h2>
                    <p className="text-gray-500 text-sm">
                      {loading ? 'Loading orders...' : `${availableAssign.length} order${availableAssign.length !== 1 ? 's' : ''} available`}
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
                </div>
              ) : availableAssign.length > 0 ? (
                <div className="grid gap-4">
                  {availableAssign.map((assignment, index) => {
                    const totalAmount = assignment.totalAmount || 
                      assignment.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                    
                    return (
                      <div 
                        className='bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all p-4'
                        key={assignment.assignmentId || index}
                      >
                        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                          <div className='flex-1'>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                <FaBox className="text-orange-600" size={16} />
                              </div>
                              <div>
                                <h3 className='font-bold text-gray-900'>{assignment.shopName}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                  <span>Order: {assignment.orderId?.slice(-6)?.toUpperCase()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2 text-sm mb-3 pl-1">
                              <FaMapMarkerAlt className="text-orange-400 mt-0.5 flex-shrink-0" size={14} />
                              <p className="text-gray-600 line-clamp-2">
                                {assignment.deliveryAddress?.text || "Address not available"}
                              </p>
                            </div>
                            
                            <div className="text-sm text-gray-700 flex flex-wrap items-center gap-2">
                              <span className="font-medium">{assignment.items?.length || 0} items</span>
                              <span className="text-gray-400">•</span>
                              <span className="font-bold text-gray-900">Rs.{totalAmount}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => acceptDelivery(assignment.assignmentId)}
                            disabled={isAccepting[assignment.assignmentId]}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                          >
                            {isAccepting[assignment.assignmentId] ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Accepting...
                              </div>
                            ) : (
                              "Accept Delivery"
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <FaBox className="text-gray-400" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No deliveries available</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    When restaurants mark orders as ready for delivery, they'll appear here.
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>Your current location: {locationText}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Footer */}
        <div className='mt-8 text-center'>
          <p className='text-sm text-gray-500'>
            {userData?.location?.coordinates 
              ? currentOrder 
                ? "Focus on your active delivery. Complete it to accept new orders."
                : "Ready to accept deliveries in your area. Stay online!"
              : "⚠️ Please enable location services to receive delivery requests"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DeliveryBoy;