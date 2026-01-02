import axios from 'axios'
import React, { useState } from 'react'
import { serverUrl } from '../App'
import { IoArrowBack } from "react-icons/io5";
import { FaStore, FaMapMarkerAlt, FaBox, FaMotorcycle, FaCheckCircle } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { useNavigate, useParams } from 'react-router-dom'
import DeliveryBoyTracking from '../components/DeliveryBoyTracking';

function TrackOrderPage() {
    const [currentOrder, setCurrentOrder] = useState(null)
    const { orderId } = useParams();
    const navigate = useNavigate();
    
    const handleGetOrder = async () => {
        try {
            const result = await axios.get(
                `${serverUrl}/api/order/get-order-id/${orderId}`, 
                { withCredentials: true }
            )
            console.log("handle Get Order", result.data)
            setCurrentOrder(result.data)
        } catch (error) {
            console.log(error)
        }
    }
    
    React.useEffect(() => {
        handleGetOrder();
    }, [orderId])

    return (
        <div className='min-h-screen bg-[#fff9f6] p-4 font-mulish-regular'>
            <div className='max-w-4xl mx-auto'>
                {/* Header */}
                <div className='mb-8'>
                    <button
                        onClick={() => navigate("/myorders")}
                        className="flex items-center gap-2 w-fit text-orange-600 hover:text-orange-700 
                        transition-colors duration-200 group mb-6"
                    >
                        <IoArrowBack className="group-hover:-translate-x-1 transition-transform" size={20} />
                        <span className="text-sm font-medium">Back to Orders</span>
                    </button>
                    
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 rounded-xl bg-orange-500 shadow-sm">
                            <MdDeliveryDining className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-orange-600">Track Order</h1>
                            <p className="text-gray-600">Order ID: {orderId?.slice(-8)?.toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Order Cards */}
                <div className='space-y-6'>
                    {currentOrder?.shopOrders?.map((shopOrder, index) => (
                        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5' key={index}>
                            {/* Shop Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-100">
                                        <FaStore className="text-orange-600" size={18} />
                                    </div>
                                    <div>
                                        <h3 className='text-lg font-bold text-gray-900'>{shopOrder.shop?.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2.5 py-1 rounded-full ${
                                                shopOrder.status === "delivered" ? "bg-green-100 text-green-800" :
                                                shopOrder.status === "out for delivery" ? "bg-blue-100 text-blue-800" :
                                                shopOrder.status === "preparing" ? "bg-amber-100 text-amber-800" :
                                                "bg-gray-100 text-gray-800"
                                            } font-medium`}>
                                                {shopOrder.status || "pending"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Items */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FaBox className="text-orange-400" size={14} />
                                        <p className="font-medium text-gray-700">Items</p>
                                    </div>
                                    <div className="space-y-1">
                                        {shopOrder.shopOrderItems?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{item.name} × {item.quantity}</span>
                                                <span className="font-medium text-gray-800">Rs.{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-2 border-t border-gray-100">
                                        <div className="flex justify-between font-medium">
                                            <span className="text-gray-700">Subtotal</span>
                                            <span className="text-gray-900">Rs.{currentOrder?.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-orange-400" size={14} />
                                        <p className="font-medium text-gray-700">Delivery Address</p>
                                    </div>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        {currentOrder?.deliveryAddress?.text}
                                    </p>
                                </div>
                            </div>

                            {/* Delivery Boy Info */}
                            {shopOrder.status !== "delivered" ? (
                                <div className="border-t border-gray-100 pt-4">
                                    {shopOrder.assignedDeliveryBoy ? (
                                        <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100/30 rounded-lg">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 rounded-lg bg-white border border-orange-200">
                                                    <FaMotorcycle className="text-orange-600" size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">Delivery Partner</p>
                                                    <p className="text-sm text-gray-600">Your order is on the way!</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500">Name</p>
                                                    <p className="font-medium text-gray-800">{shopOrder.assignedDeliveryBoy.fullName}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500">Contact</p>
                                                    <p className="font-medium text-gray-800">{shopOrder.assignedDeliveryBoy.mobile}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <div className="p-3 rounded-full bg-gray-100 inline-block mb-2">
                                                <FaMotorcycle className="text-gray-400" size={20} />
                                            </div>
                                            <p className="text-gray-600">Delivery partner will be assigned soon</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100/30 rounded-lg">
                                        <FaCheckCircle className="text-green-600" size={24} />
                                        <div>
                                            <p className="font-bold text-green-700">Order Delivered!</p>
                                            <p className="text-sm text-green-600">Your order has been successfully delivered</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tracking Map */}
                            {shopOrder.assignedDeliveryBoy && shopOrder.assignedDeliveryBoy.location?.coordinates && currentOrder?.deliveryAddress && (
                                <div className='mt-4'>
                                    <div className="flex items-center gap-2 mb-3">
                                        <FaMapMarkerAlt className="text-orange-400" size={16} />
                                        <p className="font-medium text-gray-700">Live Tracking</p>
                                    </div>
                                    <div className='h-[350px] w-full rounded-xl overflow-hidden border border-gray-200'>
                                        <DeliveryBoyTracking data={{
                                            deliveryBoyLocation: { 
                                                lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                                                lng: shopOrder.assignedDeliveryBoy.location.coordinates[0]
                                            },
                                            customerLocation: {
                                                lat: currentOrder.deliveryAddress.latitude,
                                                lng: currentOrder.deliveryAddress.longitude
                                            }
                                        }} /> 
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                {currentOrder && (
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>Need help with your order? Contact support for assistance</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TrackOrderPage