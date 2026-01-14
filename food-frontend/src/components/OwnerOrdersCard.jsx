import React, { useState, useEffect } from 'react'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaBox, FaChevronDown, FaChevronUp, FaUser } from 'react-icons/fa'
import { MdRestaurant, MdEdit, MdCheckCircle, MdCancel } from 'react-icons/md'
import axios from 'axios'
import { serverUrl } from '../App'

function OwnerOrdersCard({ data, onStatusUpdate, onOrderUpdate}) {
    const { _id, createdAt, user, deliveryAddress, shopOrders } = data;
    const shortOrderId = _id?.slice(-8).toUpperCase();
    
    const orderDate = new Date(createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const orderTime = new Date(createdAt).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Get shop order (owner only sees their shop's order)
    const shopOrder = shopOrders?.[0];
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(shopOrder?.status || "pending");
    const [availableBoys, setAvailableBoys] = useState([]);
    const [acceptedDeliveryBoy, setAcceptedDeliveryBoy] = useState(shopOrder?.assignedDeliveryBoy || null);
    
    // Track accepted delivery boy
    useEffect(() => {
        if (shopOrder?.assignedDeliveryBoy) {
            setAcceptedDeliveryBoy(shopOrder.assignedDeliveryBoy);
        }
    }, [shopOrder]);

    const statusConfig = {
        "pending": { 
            color: "bg-blue-100 text-blue-800", 
            text: "Pending", 
            nextStatus: "preparing",
            actions: ["Accept", "Decline"]
        },
        "preparing": { 
            color: "bg-amber-100 text-amber-800", 
            text: "Preparing", 
            nextStatus: "out for delivery",
            actions: ["Mark as Ready"]
        },
        "out for delivery": { 
            color: "bg-orange-100 text-orange-800", 
            text: "Out for Delivery", 
            nextStatus: "delivered",
            actions: ["Mark as Delivered"]
        },
        "delivered": { 
            color: "bg-emerald-100 text-emerald-800", 
            text: "Delivered", 
            actions: ["View Details"]
        },
        "cancelled": { 
            color: "bg-red-100 text-red-800", 
            text: "Cancelled", 
            actions: ["View Details"]
        }
    };

    const status = statusConfig[currentStatus] || statusConfig.pending;

    const calculateTotal = () => {
        if (!shopOrder?.shopOrderItems) return 0;
        const itemsTotal = shopOrder.shopOrderItems.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        const deliveryFee = itemsTotal > 500 ? 0 : 50;
        return itemsTotal + deliveryFee;
    };
    const totalAmount = calculateTotal();

    const getShopId = () => {
        if (!shopOrder?.shop) {
            console.error("No shop found in shopOrder:", shopOrder);
            return null;
        }
        
        if (shopOrder.shop._id) {
            return shopOrder.shop._id;
        }
        
        if (typeof shopOrder.shop === 'string') {
            return shopOrder.shop;
        }
        
        if (shopOrder.shop && typeof shopOrder.shop.toString === 'function') {
            return shopOrder.shop.toString();
        }
        
        return null;
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setIsUpdating(true);
            
            const shopId = getShopId();
            if (!shopId) {
                throw new Error("Could not determine shop ID.");
            }

            // Update local state immediately
            setCurrentStatus(newStatus);
            setShowStatusDropdown(false);

            // Send update to backend
            const result = await axios.put(`${serverUrl}/api/order/update-status`, {
                orderId: _id,
                shopId: shopId,
                status: newStatus
            }, { withCredentials: true });

            // Update parent component
            if (onStatusUpdate) {
                onStatusUpdate(result.data.order || data);
            }
            
            // Trigger order refresh for user side
            if (onOrderUpdate) {
                onOrderUpdate(); // This will trigger refetch in MyOrders
            }
            setAvailableBoys(result.data.availableBoys || [])
            
            console.log("Full response:", result.data);
            console.log("Available boys:", result.data.availableBoys);
        } catch (error) {
            console.log(error)
        } finally {
            setIsUpdating(false);
        }
    };

    // Auto-refresh order status when in "out for delivery" or "delivered" state
useEffect(() => {
  if (currentStatus === "out for delivery" || currentStatus === "delivered") {
    const interval = setInterval(async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/get-orders`, 
          { withCredentials: true });
        
        // Find updated order
        const updatedOrder = result.data.find(order => order._id === _id);
        if (updatedOrder) {
          const updatedShopOrder = updatedOrder.shopOrders?.[0];
          if (updatedShopOrder && updatedShopOrder.status !== currentStatus) {
            setCurrentStatus(updatedShopOrder.status);
            
            if (updatedShopOrder.status === "delivered") {
              setAcceptedDeliveryBoy(updatedShopOrder.assignedDeliveryBoy);
            }
            
            // Notify parent component
            if (onStatusUpdate) {
              onStatusUpdate(updatedOrder);
            }
          }
        }
      } catch (error) {
        console.error("Error refreshing order status:", error);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }
}, [currentStatus, _id, onStatusUpdate]);

    return (
        <div className='bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition-all duration-200 p-4'>
            {/* Header - Order ID, Time, Status */}
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                        <span className="font-semibold text-white text-sm">#</span>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Order {shortOrderId}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{orderDate}</span>
                            <span>•</span>
                            <span>{orderTime}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full ${
                        data.paymentMethod === "online" 
                            ? "bg-green-50 text-green-700 border border-green-200" 
                            : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    } font-medium`}>
                        {data.paymentMethod === "online" ? "Paid" : "Pay on Delivery"}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${status.color} font-medium`}>
                        {status.text}
                    </span>
                    
                    {status.actions.length > 0 && currentStatus !== "delivered" && currentStatus !== "cancelled" && (
                        <div className="relative">
                            <button
                                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                disabled={isUpdating}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                {isUpdating ? (
                                    <span className="text-xs">Updating...</span>
                                ) : (
                                    <>
                                        {showStatusDropdown ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                    </>
                                )}
                            </button>
                            
                            {showStatusDropdown && !isUpdating && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                                    {status.actions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (action === "Accept") handleStatusUpdate("preparing");
                                                else if (action === "Decline") handleStatusUpdate("cancelled");
                                                else if (action === "Mark as Ready") handleStatusUpdate("out for delivery");
                                                else if (action === "Mark as Delivered") handleStatusUpdate("delivered");
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                                            {action === "Accept" && <MdCheckCircle className="text-green-600" />}
                                            {action === "Decline" && <MdCancel className="text-red-600" />}
                                            {action === "Mark as Ready" && <MdEdit className="text-amber-600" />}
                                            {action === "Mark as Delivered" && <MdCheckCircle className="text-blue-600" />}
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {currentStatus === "out for delivery" && (
                <div className='mb-4 p-3 border border-orange-200 rounded-lg bg-orange-50'>
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-orange-800 text-sm">
                            Delivery Assignment Status
                        </p>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            {acceptedDeliveryBoy 
                                ? 'Assigned ✓' 
                                : availableBoys.length > 0 
                                    ? `${availableBoys.length} available` 
                                    : 'No riders'}
                        </span>
                    </div>
                    
                    {/* Show accepted delivery boy */}
                    {acceptedDeliveryBoy ? (
                        <div className="space-y-2">
                            <p className="text-xs text-orange-600 mb-2">
                                Delivery has been accepted by:
                            </p>
                            <div className="p-3 bg-white rounded-lg border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <FaUser className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">
                                                {typeof acceptedDeliveryBoy === 'object' 
                                                    ? acceptedDeliveryBoy.fullName || 'Delivery Partner'
                                                    : 'Delivery Partner'}
                                            </p>
                                            {typeof acceptedDeliveryBoy === 'object' && acceptedDeliveryBoy.mobile && (
                                                <p className="flex text-xs text-gray-500 mt-1 gap-2">
                                                 <FaPhone/> {acceptedDeliveryBoy.mobile}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                        Assigned ✓
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : availableBoys.length > 0 ? (
                        <div className="space-y-2">
                            <p className="text-xs text-orange-600 mb-2">
                                The following delivery boys have been notified:
                            </p>
                            {availableBoys.map((boy, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-orange-100">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{boy.fullName}</p>
                                        <p className="text-xs text-gray-500">{boy.mobile}</p>
                                    </div>
                                    <span className="text-xs text-green-600 font-medium">Available</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-2">
                            <p className="text-sm text-gray-600 font-mulish-regular font-semibold">
                                Sorry, no delivery boys available in your area currently.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                The order will remain in "out for delivery" status until a rider accepts.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Customer & Address */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Customer Info */}
                <div className="flex-1">
                    <div className="mb-2">
                        <p className="font-medium text-gray-900 text-sm mb-1">
                            {user?.fullName ? 
                                user.fullName.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
                                : "Customer"}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                            <FaEnvelope className='text-orange-400' size={12} />
                            <span className='text-gray-600'>{user?.email || "Email not Found"}</span>
                        </div>
                    </div>
                    
                    {user?.mobile && (
                        <div className="flex items-center gap-2 text-xs">
                            <FaPhone className='text-orange-400' size={12} />
                            <span className='text-gray-600'>{user.mobile}</span>
                        </div>
                    )}
                </div>

                {/* Delivery Address */}
                {deliveryAddress?.text && (
                    <div className="flex-1">
                        <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="text-orange-400 mt-0.5" size={14} />
                            <div className='flex-col'>
                                <p className="font-medium text-gray-900 text-sm mb-1">Delivery To</p>
                                <p className="text-xs text-gray-700 line-clamp-2">{deliveryAddress.text}</p>
                                <p className='text-xs text-gray-500'>Lat: {deliveryAddress.latitude} , Lon: {deliveryAddress.longitude}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Items - Compact */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <MdRestaurant className="text-orange-400" size={14} />
                    <p className="font-medium text-gray-900 text-sm">Items</p>
                </div>
                
                <div className="space-y-2">
                    {shopOrder?.shopOrderItems?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                                {item.item?.image ? (
                                    <div className="w-10 h-10 rounded overflow-hidden">
                                        <img 
                                            src={item.item.image} 
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                                        <FaBox className="text-gray-400" size={14} />
                                    </div>
                                )}
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

            {/* Footer - Total Amount and Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div>
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">Rs.{totalAmount}</p>
                </div>
               
                
                <div className="flex gap-2">
                    {currentStatus === "delivered" || currentStatus === "cancelled" ? (
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 
                            hover:bg-gray-50 rounded-lg transition-colors duration-200">
                            View Details
                        </button>
                    ) : null}
                    
                    {isUpdating && (
                        <div className="flex items-center px-3 py-2 text-sm text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                            Updating...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default OwnerOrdersCard