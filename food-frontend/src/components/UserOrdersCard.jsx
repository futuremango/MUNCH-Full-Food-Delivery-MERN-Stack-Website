import React from 'react'
import { useNavigate } from 'react-router-dom';

function UserOrdersCard({ data, onOrderUpdate }) {
    const { _id, createdAt, totalAmount, paymentMethod, deliveryAddress, shopOrders } = data;
    const shortOrderId = _id?.slice(-8).toUpperCase();
    const navigate = useNavigate();
    const orderDate = new Date(createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const statusConfig = {
        "pending": { color: "bg-blue-50 text-blue-700 border border-blue-200", text: "Pending" },
        "preparing": { color: "bg-amber-50 text-amber-700 border border-amber-200", text: "Preparing" },
        "out for delivery": { color: "bg-orange-50 text-orange-700 border border-orange-200", text: "Out for Delivery" },
        "delivered": { color: "bg-emerald-50 text-emerald-700 border border-emerald-200", text: "Delivered" },
        "cancelled": { color: "bg-red-50 text-red-700 border border-red-200", text: "Cancelled" }
    };

    // Calculate overall order status
    const getOverallStatus = () => {
        if (!shopOrders || shopOrders.length === 0) return "pending";
        
        if (shopOrders.some(order => order.status === "cancelled")) return "cancelled";
        if (shopOrders.some(order => order.status === "pending")) return "pending";
        if (shopOrders.some(order => order.status === "preparing")) return "preparing";
        if (shopOrders.some(order => order.status === "out for delivery")) return "out for delivery";
        if (shopOrders.every(order => order.status === "delivered")) return "delivered";
        
        return "pending";
    };

    const overallStatus = getOverallStatus();
    const overallStatusInfo = statusConfig[overallStatus] || statusConfig.pending;

    // Calculate delivery fee and totals
    const calculateTotals = () => {
        const deliveryFee = totalAmount > 500 ? 0 : 50;
        const grandTotal = totalAmount + deliveryFee;
        return {
            subtotal: totalAmount, 
            deliveryFee,
            grandTotal
        };
    };
    const total = calculateTotals();

    React.useEffect(() => {
        if (onOrderUpdate) {
            // Set up interval to check for updates every 10 seconds
            const intervalId = setInterval(() => {
                onOrderUpdate();
            }, 10000); // 10 seconds
            
            return () => clearInterval(intervalId);
        }
    }, [onOrderUpdate]);

    return (
        <div className='bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4 md:p-5'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-100'>
                <div className='flex items-center gap-2'>
                    <span className="text-gray-500 text-sm">Order #</span>
                    <span className="font-semibold text-gray-900 font-mono">{shortOrderId}</span>
                    <span className="hidden sm:inline text-gray-300 mx-2">•</span>
                    <span className="text-sm text-gray-500 hidden sm:block">{orderDate}</span>
                </div>
                
                <div className='flex items-center justify-between sm:justify-normal gap-4'>
                    <span className="text-sm text-gray-500 sm:hidden">{orderDate}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${overallStatusInfo.color} font-medium`}>
                        {overallStatusInfo.text}
                    </span>
                    <span className="text-sm font-medium text-gray-700 px-2 py-1 bg-gray-50 rounded">
                        {paymentMethod?.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Show multiple shops in this order */}
            {shopOrders?.map((shopOrder, index) => {
                const shopStatus = shopOrder.status || "pending";
                const shopStatusInfo = statusConfig[shopStatus] || statusConfig.pending;
                const shopSubtotal = shopOrder.shopOrderItems?.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0
                ) || 0;
                
                return (
                    <div className='mb-4 last:mb-0 border border-gray-100 rounded-lg p-4' key={index}>
                        {/* Shop Header with Status */}
                        <div className='flex items-center justify-between mb-3'>
                            <div className='flex items-center gap-2'>
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <p className="font-medium text-gray-800">{shopOrder.shop.name}</p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full ${shopStatusInfo.color} font-medium`}>
                                {shopStatusInfo.text}
                            </span>
                        </div>
                        
                        {/* Shop Items */}
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3'>
                            {shopOrder.shopOrderItems?.map((item, idx) => (
                                <div key={idx} className='border border-gray-100 rounded-lg p-2 bg-gray-50 hover:bg-white transition-colors'>
                                    <div className="aspect-square mb-2 overflow-hidden rounded">
                                        <img 
                                            src={item.item.image} 
                                            alt={item.name}
                                            className='w-full h-full object-cover hover:scale-105 transition-transform duration-200'
                                        />
                                    </div>
                                    <p className='text-sm font-medium text-gray-800 truncate'>{item.name}</p>
                                    <p className='text-xs text-gray-500 mt-0.5'>
                                        Rs.{item.price} × {item.quantity}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Shop Subtotal */}
                        <div className='flex justify-between items-center pt-3 border-t border-gray-100'>
                            <div>
                                <p className='text-sm text-gray-600'>Shop Subtotal</p>
                                <p className='font-medium text-gray-900'>Rs.{shopSubtotal.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Order Summary - Clean and Simple */}
            <div className='pt-4 border-t border-gray-100'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div className='space-y-1'>
                        <p className='text-sm text-gray-500'>Total Amount</p>
                        <p className='text-xl font-semibold text-gray-900'>Rs.{total.grandTotal.toFixed(2)}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Delivery: {total.deliveryFee === 0 ? 'FREE' : `Rs.${total.deliveryFee}`}</span>
                        </div>
                    </div>
                    
                    <div className='flex gap-3'>
                        <button className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'>
                            View Details
                        </button>
                        <button className='px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm
                         font-medium rounded-lg transition-colors'
                         onClick={()=>navigate(`/trackorder/${data._id}`)}
                         >
                            Track Order
                        </button>
                    </div>
                </div>
                
                {deliveryAddress && (
                    <div className='mt-3 pt-3 border-t border-gray-100'>
                        <p className='text-xs text-gray-500 mb-1'>Delivery Address</p>
                        <p className='text-sm text-gray-700 line-clamp-2'>{deliveryAddress.text}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserOrdersCard; 