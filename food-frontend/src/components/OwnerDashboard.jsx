import React from "react";
import Navbar from "./Navbar.jsx";
import OwnerSidebar from "./OwnerSidebar.jsx";
import { useSelector } from "react-redux";
import { FaUtensils, FaStore, FaChartLine, FaChevronRight } from "react-icons/fa";
import { HiTrendingUp } from "react-icons/hi";
import { TbReceipt } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import ItemCard from "./ItemCard.jsx";

function OwnerDashboard() {
  const navigate = useNavigate();
  const { getShopData } = useSelector((state) => state.owner);
  const { myOrders } = useSelector((state) => state.user);

  // Calculate stats
  const pendingOrders = myOrders?.filter(order => 
    order?.shopOrders?.[0]?.status === "pending"
  ).length || 0;

  const deliveredOrders = myOrders?.filter(order => 
    order?.shopOrders?.[0]?.status === "delivered"
  ).length || 0;

  const cancelledOrders = myOrders?.filter(order=>
    order?.shopOrders?.[0]?.status === "cancelled"
  ).length || 0;

  const totalRevenue = myOrders?.reduce((sum,order)=>
    sum + (order?.totalAmount || 0), 0
  ) || 0;

  const menuItemsCount = getShopData?.items?.length || 0;

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex">
      <OwnerSidebar />
      
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-6">
            <div className="max-w-6xl mx-auto">
              {!getShopData ? (
                <div className="flex justify-center items-center min-h-[60vh] p-4">
                  <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-orange-100">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-linear-to-r from-orange-100 to-red-100 flex items-center justify-center mb-5">
                        <FaStore className="text-orange-500 text-3xl" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-3">Add your Restaurant</h2>
                      <p className="text-gray-600 mb-6 max-w-sm">
                        Join our food delivery platform and reach thousands of hungry customers everyday.
                      </p>
                      <button
                        onClick={() => navigate("/create-edit-shop")}
                        className="px-6 py-3 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                        <FaStore className="text-white text-2xl" />
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                          Welcome to <span className="text-transparent bg-linear-to-r from-orange-600 to-red-600 bg-clip-text">{getShopData.name}</span>
                        </h1>
                        <p className="text-gray-600 mt-1">Manage your restaurant and track performance</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Active Orders</p>
                          <p className="text-2xl font-bold text-gray-800">{pendingOrders}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <TbReceipt className="text-orange-500" size={18} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Completed</p>
                          <p className="text-2xl font-bold text-gray-800">{deliveredOrders}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <HiTrendingUp className="text-emerald-500" size={18} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Menu Items</p>
                          <p className="text-2xl font-bold text-gray-800">{menuItemsCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FaUtensils className="text-blue-500" size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                          <p className="text-2xl font-bold text-gray-800">Rs.{totalRevenue}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <FaChartLine className="text-purple-500" size={16} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shop Details & Menu */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Shop Info */}
                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                        <div className="relative h-52 md:h-56">
                          <img
                            src={getShopData.image}
                            alt={getShopData.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent"></div>
                          <button
                            onClick={() => navigate("/create-edit-shop")}
                            className="absolute top-4 right-4 bg-white text-gray-700 px-3 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            Edit Details
                          </button>
                        </div>
                        
                        <div className="p-5">
                          <h2 className="text-xl font-bold text-gray-800 mb-3">{getShopData.name}</h2>
                          <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <FaUtensils className="text-orange-500" size={16} />
                            <span className="text-sm">{getShopData.city}, {getShopData.state}</span>
                          </div>
                          <div className="p-3 bg-orange-50 rounded-lg">
                            <p className="text-gray-700 text-sm">{getShopData.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
                        <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                          <button
                            onClick={() => navigate("/add-item")}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <FaUtensils className="text-orange-500 group-hover:text-orange-600" size={14} />
                              </div>
                              <span className="font-medium text-gray-800">Add Menu Item</span>
                            </div>
                            <FaChevronRight className="text-gray-400 group-hover:text-orange-500" size={14} />
                          </button>
                          
                          <button
                            onClick={() => navigate("/myorders")}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <TbReceipt className="text-orange-500 group-hover:text-orange-600" size={16} />
                              </div>
                              <span className="font-medium text-gray-800">View Orders</span>
                            </div>
                            <FaChevronRight className="text-gray-400 group-hover:text-orange-500" size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Cancelled Orders */}
                      {cancelledOrders > 0 && (
                        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">Cancelled Orders</p>
                              <p className="text-2xl font-bold text-gray-800">{cancelledOrders}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                              <span className="text-red-500 font-bold">!</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Menu Items Section */}
                  <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Menu Items</h3>
                        <p className="text-gray-600 text-sm mt-1">Manage your restaurant's menu</p>
                      </div>
                      <button
                        onClick={() => navigate("/add-item")}
                        className="px-4 py-2 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-md transition-shadow"
                      >
                        Add New
                      </button>
                    </div>

                    {menuItemsCount === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                          <FaUtensils className="text-orange-400 text-2xl" />
                        </div>
                        <p className="text-gray-600 mb-2">No menu items yet</p>
                        <p className="text-gray-400 text-sm mb-6">Start by adding your first menu item</p>
                        <button
                          onClick={() => navigate("/add-item")}
                          className="px-5 py-2.5 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:shadow-md transition-shadow"
                        >
                          Add First Item
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Add New Item Card */}
                          <div
                            onClick={() => navigate("/add-item")}
                            className="border-2 border-dashed border-orange-300 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3 group-hover:bg-orange-200">
                              <FaUtensils className="text-orange-500 group-hover:text-orange-600" size={20} />
                            </div>
                            <p className="font-medium text-gray-800 mb-1">Add New Item</p>
                            <p className="text-sm text-gray-500 text-center">Click to expand your menu</p>
                          </div>

                          {/* Existing Items */}
                          {getShopData.items.map((item) => (
                            <ItemCard data={item} key={item._id} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;