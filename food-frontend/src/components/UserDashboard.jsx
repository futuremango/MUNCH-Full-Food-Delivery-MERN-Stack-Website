import React, { useEffect, useRef, useState } from 'react'
import Navbar from './Navbar.jsx'
import { categories } from '../category.js'
import CategoryCard from './CategoryCard.jsx'
import { FaCircleChevronLeft } from "react-icons/fa6";
import { FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import useGetShopByCity from '../hooks/useGetShopByCity'; // ✅ Add this import

function UserDashboard () {
  const catScrollRef=useRef();
  const shopScrollRef=useRef();

  const {  getCity, getShopsinCity } = useSelector((state) => state.user); // ✅ Add getShopsinCity
  const [scrollButton, setScrollButton] = useState({left:false, right:true})
  const [scrollShopButton, setScrollShopButton] = useState({left:false, right:true})
  
  // ✅ ADD THIS HOOK CALL
  useGetShopByCity();
  
  const handleScroll=(ref,direction)=>{
    if(ref.current){
      ref.current.scrollBy({
        left:direction=="left"?-300:300,
        behavior:"smooth"
      })
      setTimeout(()=>{
        if(ref === catScrollRef){
          checkScrollPosition()
        }else{
          checkShopScrollPosition()
        }
      }, 300)
    }
  }

  const checkScrollPosition=()=>{
    if(catScrollRef.current){
          const {scrollLeft, clientWidth, scrollWidth}=catScrollRef.current
          setScrollButton({
            left: scrollLeft > 0,
            right: scrollLeft < scrollWidth - clientWidth - 10 
          });
        }
      }
  const checkShopScrollPosition=()=>{
    if(shopScrollRef.current){
          const {scrollLeft, clientWidth, scrollWidth}=shopScrollRef.current
          setScrollShopButton({
            left: scrollLeft > 0,
            right: scrollLeft < scrollWidth - clientWidth - 10 
          });
        }
      }

  useEffect(() => {
   const element = catScrollRef.current
   if(element){
    element.addEventListener('scroll', checkScrollPosition)
   }
    return () => {
      if(element){
        element.removeEventListener('scroll', checkScrollPosition)
      }
    }
  }, [])
  
  return (
    <>
    <div className="w-screen min-h-screen font-mulish-regular flex flex-col 
    gap-5 items-center bg-[#fff9f6] overflow-y-auto">
    <Navbar/>

      {/* Categories */}
      <div className='w-full max-w-6xl flex flex-col gap-5 items-start
      p-2.5'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>
          Inspiration for your first order
        </h1>

        {/* Mapping Category Cards */}
        <div className='relative w-full'>
        {scrollButton.left && <button className='absolute left-0 bg-[#ec4a09] text-white top-1/2 
        -translate-y-1/2 p-2 rounded-full shadow-lg hover:bg-[#ff4d2d] z-10'
        onClick={()=>handleScroll(catScrollRef,"left")}>
        <FaCircleChevronLeft />
        </button>}
        
          <div className='w-full flex overflow-x-auto gap-4 pb-3 scrollbar-thin scrollbar-thumb-[#ec4a09]
          scroll-track-transparent scroll-smooth' ref={catScrollRef}>
            {categories.map((cat,index)=>(
            <CategoryCard data={cat} key={index} />
          ))}
          </div>
          {scrollButton.right && <button className='absolute right-0 bg-[#ec4a09] text-white top-1/2 
        -translate-y-1/2 p-2 rounded-full shadow-lg hover:bg-[#ff4d2d] z-10'
         onClick={()=>handleScroll(catScrollRef,"right")}>
            <FaCircleChevronRight/>
          </button>}
        </div>
      </div>

      {/* Shops in your area */}
      <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-2.5'>
       <h1 className='text-gray-800 text-2xl sm:text-3xl'>
           Best Shops in {getCity}
        </h1>
        
        {/* ✅ ADD SHOPS DISPLAY */}
        {getShopsinCity && getShopsinCity.length > 0 ? (
          <div className="relative w-full">
            
            {/* Left Scroll Button */}
            {scrollShopButton.left && <button className='absolute left-0 bg-[#ec4a09] text-white top-1/2 
            -translate-y-1/2 p-2 rounded-full shadow-lg hover:bg-[#ff4d2d] z-10'
            onClick={()=>handleScroll(catScrollRef,"left")}>
            <FaCircleChevronLeft />
            </button>
            }

            {/* Mapping Shops */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {getShopsinCity.map(shop => (
              <div key={shop._id} className="bg-white rounded-xl shadow-lg p-4">
                <img src={shop.image} alt={shop.name} className="w-full h-32 object-cover rounded-lg mb-2" />
                <h3 className="font-bold text-lg">{shop.name}</h3>
                <p className="text-gray-600">{shop.city}, {shop.state}</p>
              </div>
            ))}

            {/* Right Scroll Button */}
            {scrollShopButton.right && <button className='absolute right-0 bg-[#ec4a09] text-white top-1/2 
            -translate-y-1/2 p-2 rounded-full shadow-lg hover:bg-[#ff4d2d] z-10'
            onClick={()=>handleScroll(catScrollRef,"right")}>
            <FaCircleChevronRight/>
            </button>}
            
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No shops found in {getCity}</p>
        )}
      </div>
    </div>
    </>
  )
}

export default UserDashboard