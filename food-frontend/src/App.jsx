import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import useGetCity from './hooks/useGetCity'
import useGetShop from './hooks/useGetShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import CartPage from './pages/CartPage'
import PaymentMethodPage from './pages/PaymentMethodPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import MyOrders from './pages/MyOrders'
import useGetMyOrders from './hooks/useGetMyOrders'
import useUpdateLocation from './hooks/useUpdateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import Shop from './pages/Shop'
import { useEffect } from 'react'
import {io} from 'socket.io-client'
import { setSocket } from './redux/userSlice'

export const serverUrl="http://localhost:8000"


function App() {
  const {userData} = useSelector(state=>state.user)
  const dispatch = useDispatch()
  useGetCurrentUser()
  useUpdateLocation()
  useGetCity()
  useGetShop()
  useGetMyOrders()  
  
  useEffect(() => {
  const socketInstance = io(serverUrl, { 
    withCredentials: true,
    transports: ['websocket', 'polling'] 
  });
  
  dispatch(setSocket(socketInstance));
  
  socketInstance.on('connect', () => {
    console.log('Connected to server with socket ID:', socketInstance.id);
    
    if(userData){
      socketInstance.emit('identity', { userId: userData._id });
    }
  });
  
  socketInstance.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  // Cleanup on unmount
  return () => {
    if(socketInstance) {
      socketInstance.disconnect();
    }
  };
}, [dispatch, userData?._id]); // Add dependencies here
  return (
    <Routes> 
    <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={'/'}/>}/>
    <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={'/'}/>}/>
    <Route path='/forgot-password' element={!userData?<ForgotPassword/>:<Navigate to={'/'}/>}/>
    <Route path='/' element={userData?<Home/>:<Navigate to={'/signin'}/>}/>
    <Route path='/create-edit-shop' element={userData?<CreateEditShop/>:<Navigate to={'/signin'}/>}/>
    <Route path='/add-item' element={userData?<AddItem/>:<Navigate to={'/signin'}/>}/>
    <Route path='/edit-item/:itemId'  element={userData?<EditItem/>:<Navigate to={'/signin'}/>}/>
    <Route path='/my-cart'  element={userData?<CartPage/>:<Navigate to={'/signin'}/>}/>
    <Route path='/checkout'  element={userData?<PaymentMethodPage/>:<Navigate to={'/signin'}/>}/>
    <Route path='/confirmed'  element={userData?<OrderConfirmationPage/>:<Navigate to={'/'}/>}/>
    <Route path='/myorders'  element={userData?<MyOrders/>:<Navigate to={'/signin'}/>}/>
    <Route path='/trackorder/:orderId'  element={userData?<TrackOrderPage/>:<Navigate to={'/'}/>}/>
    <Route path='/shop/:shopId'  element={userData?<Shop/>:<Navigate to={'/'}/>}/>

    </Routes>
  )
}

export default App;
