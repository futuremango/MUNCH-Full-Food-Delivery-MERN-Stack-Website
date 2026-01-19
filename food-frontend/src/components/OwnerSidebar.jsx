import { MdAdd, MdRestaurantMenu } from "react-icons/md";
import { TbReceiptDollar } from "react-icons/tb";
import { FaEdit, FaSignOutAlt, FaUser, FaStore } from "react-icons/fa";
import { HiHome } from "react-icons/hi";
import { ClipLoader } from "react-spinners";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders, setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

function OwnerSidebar() {
  const [loading, setLoading] = useState(false);
  const { userData, myOrders } = useSelector((state) => state.user);
  const { getShopData } = useSelector((state) => state.owner);
  const [isNavigating, setIsNavigating] = useState({
    dashboard: false,
    addItem: false,
    viewOrders: false,
    editShop: false,
    viewMenu: false
});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
      dispatch(setUserData(null));
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/order/get-orders`, {
        withCredentials: true
      });
      dispatch(setMyOrders(response.data));
    } catch (error) {
      console.error("Error fetching orders in sidebar:", error);
    }
  };

  useEffect(() => {
    if (userData?.role === "owner") {
      fetchOrders();
      const intervalId = setInterval(() => {
        fetchOrders();
      }, 8000); 
      
      return () => clearInterval(intervalId);
    }
  }, [userData?.role]);

  const pendingOrdersCount = myOrders?.filter(order => 
    order.shopOrders?.[0]?.status === "pending"
  ).length || 0;
  
  return (
    <div className="hidden md:flex w-64 h-screen bg-[#fff9f6] 
      fixed left-0 top-0 border-r border-gray-100 flex-col z-40 font-sans">
      
      {/* Logo/Heading */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-red-500 
            flex items-center justify-center shadow-md">
            <FaStore className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900">Munch Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">Restaurant Owner</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-1">
        {/* Dashboard Home */}
        <button 
          onClick={() => {
              setIsNavigating(prev => ({...prev, dashboard: true}));
              setTimeout(() => {
                  navigate("/");
                  setIsNavigating(prev => ({...prev, dashboard: false}));
              }, 300);
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
              hover:bg-gray-50 hover:shadow-sm text-gray-600 hover:text-gray-900 group"
          disabled={isNavigating.dashboard}
        >
          {isNavigating.dashboard ? (
              <ClipLoader size={16} color="#6b7280" />
          ) : (
              <HiHome className="text-gray-400 group-hover:text-orange-500" size={18} />
          )}
          <span className="font-medium text-sm">
              {isNavigating.dashboard ? "Loading..." : "Dashboard"}
          </span>
        </button>

        {getShopData && (
          <>
            {/* Add Menu Items */}
            <button 
              onClick={() => {
                  setIsNavigating(prev => ({...prev, addItem: true}));
                  setTimeout(() => {
                      navigate('/add-item');
                      setIsNavigating(prev => ({...prev, addItem: false}));
                  }, 300);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
                  hover:bg-orange-50 hover:shadow-sm text-gray-600 hover:text-orange-600 group"
              disabled={isNavigating.addItem}
            >
              {isNavigating.addItem ? (
                  <ClipLoader size={16} color="#f97316" />
              ) : (
                  <MdAdd className="text-gray-400 group-hover:text-orange-500" size={18} />
              )}
              <span className="font-medium text-sm">
                  {isNavigating.addItem ? "Loading..." : "Add Menu Items"}
              </span>
            </button>

            {/* View Orders */}
            <button 
              onClick={() => {
                  setIsNavigating(prev => ({...prev, viewOrders: true}));
                  setTimeout(() => {
                      navigate('/myorders');
                      setIsNavigating(prev => ({...prev, viewOrders: false}));
                  }, 300);
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 
                hover:bg-orange-50 hover:shadow-sm text-gray-600 hover:text-orange-600 group relative"
              disabled={isNavigating.viewOrders}
            >
              <div className="flex items-center gap-3">
                {isNavigating.viewOrders ? (
                  <>
                    <ClipLoader size={16} color="#f97316" />
                    <span className="font-medium text-sm">Loading...</span>
                  </>
                ) : (
                  <>
                    <TbReceiptDollar className="text-gray-400 group-hover:text-orange-500" size={18} />
                    <span className="font-medium text-sm">View Orders</span>
                  </>
                )}
              </div>
              
              {!isNavigating.viewOrders && pendingOrdersCount > 0 && (
                <span className="text-xs font-semibold bg-orange-500 text-white 
                  rounded-full px-2 py-0.5 min-w-5 text-center">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* Edit Shop Details */}
            <button 
              onClick={() => {
                setIsNavigating(prev => ({...prev, editShop: true}));
                setTimeout(() => {
                  navigate("/create-edit-shop");
                  setIsNavigating(prev => ({...prev, editShop: false}));
                }, 300);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
                hover:bg-orange-50 hover:shadow-sm text-gray-600 hover:text-orange-600 group"
              disabled={isNavigating.editShop}
            >
              {isNavigating.editShop ? (
                <ClipLoader size={16} color="#f97316" />
              ) : (
                <FaEdit className="text-gray-400 group-hover:text-orange-500" size={16} />
              )}
              <span className="font-medium text-sm">
                {isNavigating.editShop ? "Loading..." : "Edit Shop Details"}
              </span>
            </button>

            {/* View Menu */}
            <button 
              onClick={() => {
                setIsNavigating(prev => ({...prev, viewMenu: true}));
                setTimeout(() => {
                  navigate("/view-menu");
                  setIsNavigating(prev => ({...prev, viewMenu: false}));
                }, 300);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
                hover:bg-orange-50 hover:shadow-sm text-gray-600 hover:text-orange-600 group"
              disabled={isNavigating.viewMenu}
            >
              {isNavigating.viewMenu ? (
                <ClipLoader size={16} color="#f97316" />
              ) : (
                <MdRestaurantMenu className="text-gray-400 group-hover:text-orange-500" size={18} />
              )}
              <span className="font-medium text-sm">
                {isNavigating.viewMenu ? "Loading..." : "View Menu"}
              </span>
            </button>
          </>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        {/* User Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#fff9f6] border border-gray-100 shadow-sm mb-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-500 to-red-500 
            flex items-center justify-center text-white font-semibold text-sm shadow">
            {userData?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userData?.fullName || "Restaurant Owner"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userData?.email || "owner@email.com"}
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-1">
          <button 
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 
              hover:bg-gray-100 text-gray-600 hover:text-gray-900 group"
          >
            <FaUser className="text-gray-400 group-hover:text-gray-600" size={14} />
            <span className="text-sm font-medium">My Profile</span>
          </button>
          
          <button 
            onClick={handleSignOut}
            disabled={loading}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 
              hover:bg-red-50 text-red-500 hover:text-red-600 group disabled:opacity-50"
          >
            {loading ? (
              <ClipLoader size={14} color="#ef4444" />
            ) : (
              <FaSignOutAlt className="text-red-400 group-hover:text-red-500" size={14} />
            )}
            <span className="text-sm font-medium">
              {loading ? "Signing out..." : "Sign Out"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default OwnerSidebar;