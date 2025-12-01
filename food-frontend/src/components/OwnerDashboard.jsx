import React from "react";
import Navbar from "./Navbar.jsx";
import OwnerSidebar from "./OwnerSidebar.jsx";
import { useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaMapMarkerAlt } from "react-icons/fa";
import ItemCard from "./ItemCard.jsx";

function OwnerDashboard() {
  const navigate = useNavigate();
  const { getShopData } = useSelector((state) => state.owner);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex">
      {/* Fixed Sidebar */}
      <OwnerSidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col ">
        {/* Fixed Navbar */}
        <Navbar />

        {/* Scrollable Content Area - REMOVED mt-20 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              {!getShopData && (
                <div className="flex justify-center items-center min-h-[60vh] p-4 sm:p-6">
                  <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex flex-col items-center text-center">
                      <FaUtensils className="text-[#ec4a09] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                        Add your Restaurant
                      </h2>
                      <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        Join our food delivery platform and reach thousands of
                        hungry customers everyday.
                      </p>
                      <button
                        className="bg-[#ec4a09] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-300"
                        onClick={() => navigate("/create-edit-shop")}
                      >
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* When Shop Exists */}
              {getShopData && (
                <div className="space-y-8">
                  {/* Welcome Header, No Shop */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="bg-linear-to-r from-orange-500 to-red-500 p-4 rounded-2xl shadow-lg">
                        <FaUtensils className="text-white text-2xl" />
                      </div>
                      <h1 className="font-mulish-extrabold text-3xl md:text-4xl bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Welcome to {getShopData.name}
                      </h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                      Manage your restaurant and delight your customers
                    </p>
                  </div>

                  {/* Shop Card - Modern Design */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shop Image & Basic Info */}
                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <div className="relative">
                          <img
                            src={getShopData.image}
                            alt={getShopData.name}
                            className="w-full h-64 md:h-80 object-cover"
                          />
                          <button
                            onClick={() => navigate("/create-edit-shop")}
                            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-orange-600 p-3 rounded-xl shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group"
                          >
                            <FaEdit className="text-lg group-hover:rotate-12 transition-transform" />
                          </button>
                        </div>

                        <div className="p-6 md:p-8">
                          <div className="flex items-start justify-between mb-6">
                            <div>
                              <h2 className="font-mulish-extrabold text-2xl md:text-3xl text-gray-900 mb-2">
                                {getShopData.name}
                              </h2>
                              <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <FaMapMarkerAlt className="text-orange-500" />
                                <span className="font-medium">
                                  {getShopData.city}, {getShopData.state}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-linear-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200">
                            <p className="text-gray-700 text-sm md:text-base">
                              {getShopData.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats & Actions */}
                    <div className="space-y-6">
                      {/* Stats Card */}
                      <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-6 hover:shadow-2xl transition-all duration-500">
                        <h3 className="font-mulish-extrabold text-xl text-gray-900 mb-4">
                          Shop Stats
                        </h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                            <span className="text-gray-700">Active Orders</span>
                            <span className="font-mulish-extrabold text-orange-600">
                              0
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                            <span className="text-gray-700">
                              Completed Orders
                            </span>
                            <span className="font-mulish-extrabold text-orange-600">
                              0
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                            <span className="text-gray-700">
                              Cancelled Orders
                            </span>
                            <span className="font-mulish-extrabold text-orange-600">
                              0
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                            <span className="text-gray-700">Total Items</span>
                            <span className="font-mulish-extrabold text-orange-600">
                              {getShopData.items.length || "0"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                            <span className="text-gray-700">Total Revenue</span>
                            <span className="font-mulish-extrabold text-orange-600">
                              Rs 0
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Section */}
                  {/* Menu Items Section */}
                  <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-6 hover:shadow-2xl transition-all duration-500">
                    <h3 className="font-mulish-extrabold text-xl text-gray-900 mb-6">
                      Menu Items
                    </h3>

                    {getShopData.items.length === 0 ? (
                      <div className="text-center py-8">
                        <FaUtensils className="text-gray-300 text-4xl mx-auto mb-4" />
                        <p className="text-gray-500">No menu items yet</p>
                        <p className="text-gray-400 text-sm">
                          Start by adding your menu items!
                        </p>
                        <button
                          className="mt-4 bg-[#ec4a09] text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-300"
                          onClick={() => navigate("/add-item")}
                        >
                          Add First Item
                        </button>
                      </div>
                    ) : (
                      <div>
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="font-mulish-extrabold text-lg text-gray-900">
                            Total Items: {getShopData.items.length}
                          </h4>
                        </div>

                        {/* Items Grid with Add Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Add New Item Card */}
                          <div
                            onClick={() => navigate("/add-item")}
                            className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 hover:border-orange-400 transition-all duration-300 group min-h-[180px]"
                          >
                            <div className="bg-orange-100 p-4 rounded-full group-hover:bg-orange-200 transition-colors duration-300 mb-3">
                              <FaUtensils className="text-orange-500 text-xl group-hover:text-orange-600" />
                            </div>
                            <p className="text-orange-700 font-semibold text-center">
                              Add New Item
                            </p>
                            <p className="text-orange-500 text-sm text-center mt-1">
                              Click to add more delicious items
                            </p>
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
