import { MdAdd } from "react-icons/md";
import { TbReceiptDollar } from "react-icons/tb";
import {  FaEdit, FaSignOutAlt, FaUser } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

function OwnerSidebar() {
  const [Loading, setLoading] = useState(false);
  const { userData } = useSelector((state) => state.user);
  const { getShopData } = useSelector((state) => state.owner);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const result = await axios.get(`${serverUrl}/api/auth/signout`, {withCredentials:true});
      dispatch(setUserData(null));
      setLoading(false);
      console.log(result);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="hidden md:flex w-64 h-screen bg-[#fff9f6] 
    fixed left-0 -top-1 border-r border-orange-100 shadow-sm flex-col z-40 font-mulish-regular">
      
      {/* Logo/Heading */}
      <div className="p-6 border-b border-orange-100">
        <h1 className="font-super-woobly text-3xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Munch'in
        </h1>
      </div>


     { getShopData && <>
      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2">
       
        {/* Add Food Items */}
        <button className="w-full flex items-center gap-3 p-3 cursor-pointer text-[#ec4a09]
          font-semibold rounded-xl transition-all duration-300 hover:bg-orange-50 
          hover:-translate-y-0.5 active:translate-y-0" onClick={()=>navigate('/add-item')}>
          <MdAdd size={20}/>
          <span>Add Menu Items</span>
        </button> 
        

        {/* Order Management */}
        <button className="relative w-full flex items-center gap-3 p-3 cursor-pointer text-[#ec4a09]
          font-semibold rounded-xl transition-all duration-300 hover:bg-orange-50 
          hover:-translate-y-0.5 active:translate-y-0">
          <TbReceiptDollar size={20}/>
          <span>View Orders</span>
          <span className="absolute  left-35 -top-0.5 text-xs font-bold text-white
            bg-[#ec4a09] rounded-full px-1.5 py-px">0</span>
        </button>

        {/* Edit Shop Details */}
        <button className="relative w-full flex items-center gap-3 p-3 cursor-pointer text-[#ec4a09]
          font-semibold rounded-xl transition-all duration-300 hover:bg-orange-50 
          hover:-translate-y-0.5 active:translate-y-0" onClick={()=>navigate("/create-edit-shop")}>
          <FaEdit size={20}/>
          <span>Edit Shop Details</span>
        </button>

      </div>
      </>}

      {/* User Profile at bottom */}
      <div className="p-4 border-t border-orange-100">
        {/* User Info */}
        <div className="flex items-center gap-3 pb-3 border-b border-orange-100">
          <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 
            flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {userData?.fullName?.slice(0, 1)}
          </div>
          
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-sm font-semibold text-gray-800 truncate">
              {userData?.fullName || "User"}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {userData?.email || "user@email.com"}
            </div>
          </div>
        </div>

        {/* Profile and Sign Out */}
        <div className="space-y-2 pt-3">
          <div className="flex items-center gap-3 text-gray-700 hover:text-orange-500 
            cursor-pointer transition-colors duration-200 p-2 rounded-lg hover:bg-orange-50">
            <FaUser size={14} />
            <span className="text-sm font-medium">Profile</span>
          </div>
          
          <div className="flex items-center gap-3 text-red-500 hover:text-red-600 
            cursor-pointer transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
            onClick={handleSignOut}>
            <FaSignOutAlt size={14} />
            <span className="text-sm font-medium">
              {Loading ? <ClipLoader size={16} color="red" /> : "Sign Out"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerSidebar;