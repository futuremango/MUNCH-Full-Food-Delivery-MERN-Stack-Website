import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaListAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ClipLoader } from "react-spinners";

function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAnimation, setShowAnimation] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get order data from location state or localStorage
    const orderFromState = location.state?.order;
    const orderFromStorage = localStorage.getItem("lastOrder");
    
    let order = null;
    
    if (orderFromState) {
      order = orderFromState;
      localStorage.setItem("lastOrder", JSON.stringify(orderFromState));
    } else if (orderFromStorage) {
      order = JSON.parse(orderFromStorage);
    }
    
    // Small delay to show loading state
    setTimeout(() => {
      setOrderData(order);
      setIsLoading(false);
    }, 800);

    // Trigger confetti animation
    if (order) {
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        
        const particleCount = 40 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 200);

      // Auto-hide success animation after 2.5 seconds
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 2500);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [location.state]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <ClipLoader color="#f97316" size={40} className="mb-4" />
          <p className="text-gray-600 font-medium">Loading your order...</p>
        </div>
      </div>
    );
  }

  // No order found
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-gray-400" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Order Found</h2>
          <p className="text-gray-600 mb-6">Redirecting to orders page...</p>
          <button
            onClick={() => navigate("/myorders")}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  const { _id, totalAmount, shopOrders } = orderData;
  const shortOrderId = _id?.slice(-8).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ 
                type: "spring", 
                duration: 0.8,
                bounce: 0.4
              }}
              className="text-center px-4"
            >
              <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <FaCheckCircle className="text-white" size={60} />
              </div>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-900 mb-3"
              >
                Order Placed!
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600"
              >
                Your order has been confirmed
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 mb-4">
            <FaCheckCircle className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Confirmed
          </h1>
          <p className="text-gray-600">
            ID: <span className="font-mono font-semibold text-gray-800">{shortOrderId}</span>
          </p>
        </motion.div>

        {/* Order Summary Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">
            Order Summary
          </h2>
          
          <div className="space-y-3 mb-6">
            {shopOrders?.map((shopOrder, shopIndex) => (
              <div key={shopIndex} className="space-y-2">
                {shopOrder.shopOrderItems?.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (itemIndex * 0.1) }}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">Rs.{item.price * item.quantity}</p>
                      <p className="text-xs text-gray-500">Rs.{item.price} each</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}

            {/* Total Amount */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="pt-4 border-t border-gray-200"
            >
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">Rs.{totalAmount}</span>
              </div>
            </motion.div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium mx-auto block w-fit">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Order Confirmed
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <button
            onClick={() => navigate("/myorders")}
            className="w-full max-w-xs bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 mx-auto hover:shadow-md active:scale-[0.98]"
          >
            <FaListAlt />
            View My Orders
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            You'll be redirected to track your order
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;