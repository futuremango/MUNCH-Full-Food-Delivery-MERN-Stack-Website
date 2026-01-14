import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoRefresh } from "react-icons/io5";
import UserOrdersCard from '../components/UserOrdersCard';
import OwnerOrdersCard from '../components/OwnerOrdersCard';
import { FaBox, FaShoppingBag } from "react-icons/fa";
import { setMyOrders } from '../redux/userSlice';
import axios from 'axios';
import { serverUrl } from '../App';

function MyOrders() {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const { userData, myOrders } = useSelector((state) => state.user)
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Use useCallback to memoize the function
    const fetchOrders = useCallback(async () => {
        try {
            setIsRefreshing(true);
            const response = await axios.get(`${serverUrl}/api/order/get-orders`, {
                withCredentials: true
            });
            dispatch(setMyOrders(response.data));
            setLastUpdated(new Date()); // Update timestamp
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch]);

    // Initial fetch
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

useEffect(() => {
  const intervalId = setInterval(() => {
    console.log("Auto-refreshing orders...");
    fetchOrders();
    
    if (myOrders.some(order => 
      order.shopOrders?.some(so => 
        so.status === "out for delivery" || so.status === "delivered"
      )
    )) {
      console.log("Refreshing delivery status...");
      fetchOrders(); 
    }
  }, 10000); 
  
  return () => clearInterval(intervalId);
}, [fetchOrders, myOrders]);

    // Format last updated time
    const formatTime = (date) => {
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 
                                transition-colors duration-200 group"
                        >
                            <IoArrowBack className="group-hover:-translate-x-1 transition-transform" size={20} />
                            <span className="text-sm font-medium">Back</span>
                        </button>
                        
                        {/* Refresh Button */}
                        <div className="flex items-center gap-3">
                            <div className="text-xs text-gray-500 hidden sm:block">
                                Last updated: {formatTime(lastUpdated)}
                            </div>
                            <button
                                onClick={fetchOrders}
                                disabled={isRefreshing}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                                    ${isRefreshing 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700'}`}
                            >
                                <IoRefresh 
                                    className={`${isRefreshing ? 'animate-spin' : ''}`} 
                                    size={16} 
                                />
                                <span className="hidden sm:inline">
                                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-orange-500 shadow-sm border border-gray-100">
                                <FaBox className="text-white" size={24} />
                            </div>
                          
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
                                    {userData?.role === "owner" ? "Shop Orders" : "My Orders"}
                                </h1>
                                <p className="text-gray-500 mt-1">
                                    {userData?.role === "owner" 
                                        ? "Manage your shop orders and update status" 
                                        : "Take a look at your delicious orders"}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Order Count & Auto-refresh Info */}
                {myOrders && myOrders.length > 0 && (
                    <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <p className="text-sm text-blue-700">
                                    <span className="font-medium">{myOrders.length} order{myOrders.length !== 1 ? 's' : ''}</span>
                                    {userData?.role === "owner" 
                                        ? " in your shop" 
                                        : " in your history"}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <p className="text-xs text-gray-600">Auto-refreshes every 10s</p>
                                </div>
                                <div className="text-xs text-gray-500">
                                    Updated: {formatTime(lastUpdated)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main>
                    {myOrders && myOrders.length > 0 ? (
                        <div className="space-y-5">
                            <div className="space-y-5">
                                {myOrders?.map((order, index) => (
                                    userData.role === "user" ? (
                                        <UserOrdersCard 
                                            data={order} 
                                            key={order._id || index} 
                                            lastUpdated={lastUpdated} // Pass last updated time
                                        />
                                    ) : userData.role === "owner" ? (
                                        <OwnerOrdersCard 
                                            data={order} 
                                            key={order._id || index} 
                                            onOrderUpdate={fetchOrders} // Still pass for immediate updates
                                        />
                                    ) : null
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 
                            flex flex-col items-center justify-center text-center">
                            <div className="p-4 rounded-full bg-gray-50 mb-6">
                                <FaShoppingBag className="text-gray-300" size={40} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {userData?.role === "owner" ? "No orders yet" : "No orders yet"}
                            </h3>
                            <p className="text-gray-500 mb-8 max-w-md">
                                {userData?.role === "owner" 
                                    ? "Orders from customers will appear here" 
                                    : "Your order history will appear here once you start shopping"}
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate("/")}
                                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium 
                                        hover:bg-orange-600 active:scale-[0.98] transition-all duration-200"
                                >
                                    {userData?.role === "owner" ? "View Dashboard" : "Browse Restaurants"}
                                </button>
                                <button
                                    onClick={fetchOrders}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium 
                                        hover:bg-orange-50 active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
                                >
                                    <IoRefresh size={16} />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer Note */}
                {myOrders && myOrders.length > 0 && (
                    <footer className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-500">
                                Need help?{" "}
                                <button 
                                    onClick={() => navigate("/support")}
                                    className="text-gray-700 font-medium hover:text-gray-900 underline transition-colors"
                                >
                                    Contact Support
                                </button>
                            </p>
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Auto-refresh enabled • Last: {formatTime(lastUpdated)}</span>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    )
}

export default MyOrders