import React, { useEffect, useRef, useState } from 'react'
import Navbar from './Navbar.jsx'
import { categories } from '../category.js'
import CategoryCard from './CategoryCard.jsx'
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import SuggestedItems from './SuggestedItems.jsx';
import { FaShopSlash } from "react-icons/fa6";
import { MdNoFood, MdFastfood, MdOutlineStorefront } from "react-icons/md";
import AreaShops from './AreaShops';
import { useNavigate } from 'react-router-dom';
import { setSearchItems } from '../redux/userSlice.js';
import { useDispatch } from 'react-redux';
import { FaStore, FaSearch, FaTimes } from "react-icons/fa";

function UserDashboard() {
  //refs
  const catScrollRef = useRef();
  const shopScrollRef = useRef();

  //useStates
  const { getCity, getShopsinCity, getItemsinCity, searchItems, userData } = useSelector((state) => state.user);
  const [scrollButton, setScrollButton] = useState({ left: false, right: true })
  const [scrollShopButton, setScrollShopButton] = useState({ left: false, right: true })
  const [updatedItemsList, setUpdatedItemsList] = useState(getItemsinCity);
  const [activeCategory, setActiveCategory] = useState("All");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFilterByCategory = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setUpdatedItemsList(getItemsinCity)
    } else {
      const filter = getItemsinCity?.filter((item) => item.category === category)
      setUpdatedItemsList(filter)
    }
  }

  React.useEffect(() => {
    setUpdatedItemsList(getItemsinCity)
  }, [getItemsinCity])


  const handleScroll = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth"
      })
      setTimeout(() => {
        if (ref === catScrollRef) {
          checkScrollPosition()
        } else {
          checkShopScrollPosition()
        }
      }, 300)
    }
  }

  //this one is for Categories..
  const checkScrollPosition = () => {
    if (catScrollRef?.current) {
      const { scrollLeft, clientWidth, scrollWidth } = catScrollRef.current
      setScrollButton({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 10
      });
    }
  }
  //this for shop
  const checkShopScrollPosition = () => {
    if (shopScrollRef?.current) {
      const { scrollLeft, clientWidth, scrollWidth } = shopScrollRef.current
      setScrollShopButton({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 10
      });
    }
  }

  useEffect(() => {
    const element = catScrollRef?.current
    if (element) {
      element.addEventListener('scroll', checkScrollPosition)
      //initial position? -> downward arrow *this is embarrasing
      checkScrollPosition();
    }
    return () => {
      if (element) {
        element.removeEventListener('scroll', checkScrollPosition)
      }
    }
  }, [])

  useEffect(() => {
    const element = shopScrollRef?.current
    if (element) {
      element.addEventListener('scroll', checkShopScrollPosition)
      //initial position -> *yk what im tryna say rom
      checkShopScrollPosition();
    }
    return () => {
      if (element) {
        element.removeEventListener('scroll', checkShopScrollPosition)
      }
    }
  }, [])

  // Debug log
  console.log("UserDashboard - State:", {
    getCity,
    shopsCount: getShopsinCity?.length,
    itemsCount: getItemsinCity?.length
  });
   const getTransformedSearchItems = () => {
    if (!searchItems) return [];

    if (Array.isArray(searchItems) && searchItems[0]?.type) {
      return searchItems;
    }

    if (searchItems.items || searchItems.shops) {
      return [
        ...(searchItems.shops || []).map(shop => ({
          ...shop,
          type: 'shop'
        })),
        ...(searchItems.items || []).map(item => ({
          ...item,
          type: 'item'
        }))
      ];
    }

    return [];
  };


  // Then use it in your component
  const transformedSearchItems = getTransformedSearchItems();

  return (
    <div className="w-screen min-h-screen font-mulish-regular flex flex-col 
    items-center bg-linear-to-b from-orange-50 to-white overflow-y-auto">
      <Navbar />

{/* SEARCH RESULTS  */}
{userData.role === "user" && transformedSearchItems.length > 0 && (
  <div className="w-full max-w-7xl px-4 py-6 sm:px-6 mt-6 animate-fadeIn bg-white flex flex-col gap-6 shadow-md rounded-3xl">
    {/* Search Header */}
    <div className="mb-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-sm">
            <FaSearch className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Search Results
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Found {transformedSearchItems.length} results in <span className="font-semibold text-orange-600">{getCity}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => dispatch(setSearchItems(null))}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 
          hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300"
        >
          <FaTimes size={14} />
          Clear
        </button>
      </div>

      {/* Results Count Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {transformedSearchItems.some(item => item.type === 'shop') && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full">
            <MdOutlineStorefront className="text-orange-600" size={16} />
            <span className="text-sm font-medium text-gray-800">
              {transformedSearchItems.filter(i => i.type === 'shop').length} Shops
            </span>
          </div>
        )}
        {transformedSearchItems.some(item => item.type === 'item') && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full">
            <MdFastfood className="text-orange-600" size={16} />
            <span className="text-sm font-medium text-gray-800">
              {transformedSearchItems.filter(i => i.type === 'item').length} Items
            </span>
          </div>
        )}
      </div>
    </div>

    {/* Search Results Grid - Using Existing Components */}
    <div className="space-y-8">
      {/* Shops Section - Using AreaShops Component */}
      {transformedSearchItems.some(item => item.type === 'shop') && (
        <section className="space-y-4">
          <div className="flex items-center mb-2 gap-2">
            <FaStore className="text-orange-500" size={20} />
            <h3 className="text-xl font-bold text-gray-900">Shops</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {transformedSearchItems
              .filter(item => item.type === 'shop')
              .map((shop) => (
                <AreaShops 
                  key={shop._id}
                  name={shop.name}
                  image={shop.image}
                  onClick={() => navigate(`/shop/${shop._id}`)}
                />
              ))}
          </div>
        </section>
      )}

      {/* Items Section - Using SuggestedItems Component */}
      {transformedSearchItems.some(item => item.type === 'item') && (
        <section className="space-y-4">
          <div className="flex items-center mb-2 gap-2">
            <MdFastfood className="text-orange-500" size={22} />
            <h3 className="text-xl font-bold text-gray-900">Menu Items</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {transformedSearchItems
              .filter(item => item.type === 'item')
              .map((item) => (
                <SuggestedItems 
                  key={item._id}
                  data={item}
                  onClick={()=>navigate(`/shop/${item.shop._id}`)}
                />
              ))}
          </div>
        </section>
      )}
    </div>

  </div>
)}




      {/* Main Content Container */}
      <div className="w-full max-w-7xl px-4 sm:px-6 py-6 space-y-10">

        {/* Shops in your area Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold">
                Best Shops in <span className="text-orange-600">{getCity || "Your City"}</span>
              </h1>
              <p className="text-gray-600 text-sm mt-1">Top-rated shops near you</p>
            </div>
            {getShopsinCity && getShopsinCity.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleScroll(shopScrollRef, "left")}
                  className={`p-2 rounded-full transition-all ${scrollShopButton.left ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  disabled={!scrollShopButton.left}
                >
                  <FaCircleChevronLeft size={20} />
                </button>
                <button
                  onClick={() => handleScroll(shopScrollRef, "right")}
                  className={`p-2 rounded-full transition-all ${scrollShopButton.right ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  disabled={!scrollShopButton.right}
                >
                  <FaCircleChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {getShopsinCity && getShopsinCity.length > 0 ? (
            <div className="relative">
              <div
                className="w-full flex overflow-x-auto gap-5 pb-4 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100 scroll-smooth"
                ref={shopScrollRef}
              >
                {getShopsinCity.map((shop, index) => (
                  <AreaShops name={shop.name} image={shop.image} key={index} onClick={() => navigate(`/shop/${shop._id}`)} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-linear-to-r from-orange-50 to-white rounded-2xl border border-orange-100">
              <div className="max-w-md mx-auto">
                <div className="text-[#ec4a09] text-5xl mb-4"><FaShopSlash className="mx-auto block" /></div>
                <h3 className="text-gray-700 text-lg font-semibold">
                  {getCity ? `No shops found in ${getCity}` : "Detecting your location..."}
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  {getCity ? "We're working on adding more shops in your area" : "Please wait while we get your location"}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold">
                Inspiration for your first order
              </h1>
              <p className="text-gray-600 text-sm mt-1">Explore delicious options to get started</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleScroll(catScrollRef, "left")}
                className={`p-2 rounded-full transition-all ${scrollButton.left ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!scrollButton.left}
              >
                <FaCircleChevronLeft size={20} />
              </button>
              <button
                onClick={() => handleScroll(catScrollRef, "right")}
                className={`p-2 rounded-full transition-all ${scrollButton.right ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!scrollButton.right}
              >
                <FaCircleChevronRight size={20} />
              </button>
            </div>
          </div>

          {categories && categories.length > 0 ? (
            <div className="relative">
              <div
                className="w-full flex overflow-x-auto gap-5 pb-4 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100 scroll-smooth"
                ref={catScrollRef}
              >
                {categories.map((cat, index) => (
                  <CategoryCard name={cat.category || cat.name} image={cat.image} key={index}
                    onClick={() => handleFilterByCategory(cat.category)} isActive={activeCategory === cat.category} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">No categories available</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for delicious options!</p>
            </div>
          )}
        </section>

        {/* Suggestions Section */}
        {updatedItemsList && updatedItemsList.length > 0 ? (
          <section className="space-y-4">
            <div>
              <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold">
                {updatedItemsList === getItemsinCity ? "Items You'd Love" : `${updatedItemsList[0]?.category || "Filtered"} Items`}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {updatedItemsList === getItemsinCity
                  ? "Popular items from local shops"
                  : `${updatedItemsList.length} items found`}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3">
              {updatedItemsList?.map((data, index) => (
                <div key={index} className="transform transition-transform hover:-translate-y-1">
                  <SuggestedItems key={index} data={data} />
                </div>
              ))}
            </div>

            {/* Show "Show All" button only when filtered */}
            {updatedItemsList !== getItemsinCity && (
              <div className="text-center pt-4">
                <button
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors"
                  onClick={() => handleFilterByCategory("All")}
                >
                  Show All Items →
                </button>
              </div>
            )}
          </section>
        ) : getCity ? (
          <section className="space-y-4">
            <div>
              <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold">
                Items You'd Love
              </h1>
              <p className="text-gray-600 text-sm mt-1">Popular items from local shops</p>
            </div>
            <div className="text-center py-10 bg-linear-to-r from-orange-50 to-white rounded-2xl border border-orange-100">
              <div className="max-w-md mx-auto">
                <div className="text-[#ec4a09] text-5xl mb-4"><MdNoFood className="mx-auto block" /></div>
                <h3 className="text-gray-700 text-lg font-semibold">
                  {updatedItemsList === getItemsinCity ? "No items found yet" : "No items in this category"}
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  {updatedItemsList === getItemsinCity
                    ? `Shops in ${getCity} haven't added items yet`
                    : "Try a different category"}
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      {/* Bottom Padding */}
      <div className="h-10"></div>
    </div>
  )
}

export default UserDashboard