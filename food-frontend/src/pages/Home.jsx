import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'
import useGetShopByCity from '../hooks/useGetShopByCity'
import useGetItemsByCity from '../hooks/useGetItemsByCity'
function Home() {
    const {userData} = useSelector(state=>state.user)
    useGetShopByCity()
    useGetItemsByCity()
  return (
    <div className='w-screen min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6]'>
      { userData.role === "user" && <UserDashboard/> }
      { userData.role === "owner" && <OwnerDashboard/> }
      { userData.role === "deliveryBoy" && <DeliveryBoy/> }
    </div>
  )
}

export default Home
