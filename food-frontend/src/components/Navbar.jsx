import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { FaSearch, FaSignOutAlt, FaUser } from "react-icons/fa";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { MdAdd } from "react-icons/md";
import { TbReceiptDollar } from "react-icons/tb";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import CitySelector from './CitySelector';

function Navbar() {

  //useStates used
  const { userData , cartItems } = useSelector((state) => state.user);
  const { getShopData } = useSelector((state) => state.owner);
  const [showPopup, setShowPopup] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [Loading, setLoading] = useState(false);

  //refs to close outside when clicked
  const popupRef = useRef(null);
  const searchRef = useRef(null);

  //useDispatch used to get userData, getCity
  const dispatch = useDispatch();

  //navigate
  const navigate = useNavigate();

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
       if (searchRef.current && !searchRef.current.contains(event.target)) {
        const searchIcon = event.target.closest('.search-icon') || event.target.classList.contains('search-icon')
        if(!searchIcon){
          setShowSearch(false)
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  

  //Handle Sign Out button
  const handleSignOut = async () => {
    setLoading(true);
    try {
      const result = await axios.get(`${serverUrl}/api/auth/signout`, {withCredentials:true});
      dispatch(setUserData(null));
      setLoading(false)
      console.log(result);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-20 flex bg-[#fff9f6] items-center justify-between md:justify-center gap-6 px-6 fixed top-0 z-50 border-b border-orange-100 shadow-sm">

      {/* Heading */}
      {userData.role==="user"? <div className="flex items-center">
          <h1 className="font-super-woobly flex text-3xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Munch
          </h1>
        </div> : <> <div className="md:hidden flex items-center">
          <h1 className="font-super-woobly flex text-3xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
             Munch
          </h1>
        </div>
        </>
        } 
        

        {/* Mobile k liye Search Bar */}
        {userData.role==="user" && showSearch && (
          <div className="flex w-[90%] h-[70px] md:hidden bg-white/90 backdrop-blur-sm 
          shadow-xl rounded-2xl items-center gap-5 border border-orange-200 
          hover:shadow-xl transition-all duration-300 fixed top-20 left-[5%] z-50" ref={searchRef}>
       

               {/* CitySelector INSIDE Mobile Search Bar */}
              <div className="flex md:hidden items-center w-[35%] gap-3 px-3 border-r-2 border-orange-200">
                <div className="min-w-0">
                  <CitySelector />
                </div>
              </div>

              {/* Searchbar */}
              <div className="flex w-[65%] items-center gap-3">
                <FaSearch size={25} id="search-icon" className="text-[#ec4a09]" />
                <input
                  type="text"
                  placeholder="Search Category, Foods, Stores..."
                  className="px-2.5 text-gray-700 truncate outline-0 w-full bg-transparent 
                    placeholder-gray-400 text-sm focus:placeholder-orange-300 
                    transition-colors"/>
              </div>
            </div>
    )}

    {/* Search Container for Big Devices */}
    {userData.role==="user" && <div className="md:flex hidden md:w-[60%] lg:w-[40%] h-14 bg-white/90 backdrop-blur-sm 
    shadow-lg rounded-2xl items-center gap-4 border border-orange-200 
    hover:shadow-xl transition-all duration-300">

            {/* Location */}
            <div className="md:flex hidden items-center w-[30%] min-w-0 gap-3 px-3 border-r-2 border-orange-200">
              <CitySelector />
            </div>
   
            {/* Searchbar */}
            <div className="flex w-full items-center gap-3 px-4">
              <FaSearch size={25} className="text-[#ec4a09]" />
              <input
                type="text"
                placeholder="Search Category, Foods, Stores..."
                className="px-2.5 text-gray-700 outline-0 w-full bg-transparent 
                  placeholder-gray-400 text-sm focus:placeholder-orange-300 transition-colors"/>
              </div>
            </div>
             }

    

      {/* Right side icons container */}
      <div className="flex items-center gap-4">
        
        {userData.role==="user" && (showSearch? <IoClose size={25} className="text-[#ec4a09] md:hidden 
        cursor-pointer hover:text-orange-600 transition-colors" 
        onClick={()=>setShowSearch(false)}/>: <FaSearch size={25} className="text-[#ec4a09] 
        md:hidden cursor-pointer hover:text-orange-600 transition-colors"
        onClick={() => setShowSearch(true)}/>)
        }

       { userData.role === "owner" ? (
        <>
        {getShopData && <>
            <button className="md:hidden flex items-center p-2.5 cursor-pointer font-semibold rounded-full 
            bg-[#ec4a09]/10 text-[#ec4a09] shadow-lg transition-all duration-300 
            hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            onClick={()=>navigate('/add-item')}>
            <MdAdd size={20}/>
          </button>

          <button className="relative md:hidden flex items-center p-2.5 cursor-pointer font-semibold rounded-full 
            bg-[#ec4a09]/10 text-[#ec4a09] shadow-lg transition-all duration-300 
            hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
            <TbReceiptDollar size={20}/>
            <span className="absolute -right-1.5 -top-1 text-xs font-bold text-white
              bg-[#ec4a09] rounded-full px-1.5 py-px">0</span>
          </button>
        </>
        }
    

    {/* USER AVATAR FOR OWNERS - ONLY SHOW ON MOBILE */}
    <div className="md:hidden relative" ref={popupRef}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center
       bg-linear-to-r from-orange-500 to-red-500 text-white text-lg 
       shadow-lg font-semibold cursor-pointer hover:shadow-xl 
       transform hover:scale-105 transition-all duration-300"
        onClick={() => setShowPopup((prev) => !prev)}>
        {userData?.fullName?.slice(0, 1).toUpperCase()}
      </div>
     
      {/* Popup Menu for Owners - ONLY ON MOBILE */}
      {showPopup && (
        <div className="absolute top-12 right-0 w-48 bg-white/95 backdrop-blur-lg 
        shadow-2xl rounded-xl p-4 z-50 border border-orange-100 
        animate-in fade-in-0 zoom-in-95">
         
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

          {/* Menu Items */}
          <div className="space-y-2 pt-3">
            <div className="flex items-center gap-3 text-gray-700 hover:text-orange-500 
              cursor-pointer transition-colors duration-200">
              <FaUser size={14} />
              <span className="text-sm font-medium">Profile</span>
            </div>
           
            <div className="flex items-center gap-3 text-red-500 hover:text-red-600 
              cursor-pointer transition-colors duration-200" onClick={handleSignOut}>
              <FaSignOutAlt size={14} />
              <span className="text-sm font-medium">
                {Loading ? (
                  <ClipLoader size={23} color="white" />
                ) : (
                  "Sign Out"
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
) : (
          <>
         {/* Cart */}
        <div className="relative cursor-pointer group" onClick={()=>navigate('/my-cart')}>
          <HiOutlineShoppingCart
            size={26}
            className="text-orange-500 group-hover:text-orange-600 transition-colors duration-200"/>
          <span className="absolute -right-2 -top-2 bg-linear-to-r from-orange-500 to-red-500 text-white text-xs 
          w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg transition-transform group-hover:scale-110">
            {cartItems.length}
          </span>
        </div>

         {/* My Orders button */}
        <button className="hidden md:block px-4 py-2.5 text-sm font-semibold rounded-xl 
        bg-linear-to-r bg-[#ec4a09]/10 text-[#ec4a09] shadow-lg
        transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5
         active:translate-y-0">
          My Orders
        </button>

        {/* User avatar with popup */}
        <div className="relative" ref={popupRef}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center
           bg-linear-to-r from-orange-500 to-red-500 text-white text-lg 
           shadow-lg font-semibold cursor-pointer hover:shadow-xl 
           transform hover:scale-105 transition-all duration-300"
            onClick={() => setShowPopup((prev) => !prev)}>
            {userData?.fullName?.slice(0, 1).toUpperCase()}
          </div>
         
          {/* Popup Menu */}
          {showPopup && (
            <div className="absolute top-12 right-0 w-48 bg-white/95 backdrop-blur-lg 
            shadow-2xl rounded-xl p-4 z-50 border border-orange-100 
            animate-in fade-in-0 zoom-in-95">
             
              {/* User Info */}
              <div className="flex items-center gap-3 pb-3 border-b border-orange-100">
                <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 
                  flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {userData?.fullName?.slice(0, 1).toUpperCase()}
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

              {/* Menu Items */}
              <div className="space-y-2 pt-3">
                {/* cart */}
                <div className="flex items-center gap-3 text-gray-700 hover:text-orange-500 
                 cursor-pointer transition-colors duration-200 md:hidden"
                 onClick={()=>navigate('/my-cart')}>
                  <HiOutlineShoppingCart size={16} />
                  <span className="text-sm font-medium">My Orders</span>
                </div>
                
                {/* profile */}
                <div
                  className="flex items-center gap-3 text-gray-700 hover:text-orange-500 
                cursor-pointer transition-colors duration-200">
                  <FaUser size={14} />
                  <span className="text-sm font-medium">Profile</span>
                </div>
               
                {/* logout */}
                <div className="flex items-center gap-3 text-red-500 hover:text-red-600 
                cursor-pointer transition-colors duration-200" onClick={handleSignOut}>
                  <FaSignOutAlt size={14} />
                  <span className="text-sm font-medium">
                    {Loading ? (
                      <ClipLoader size={23} color="white" />
                    ) : (
                      "Sign Out"
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  
  );
}

export default Navbar;