import React, { useEffect } from "react";
import { serverUrl } from "../App";
import axios from "axios";
import { useDispatch } from 'react-redux'
import { setMyOrders } from "../redux/userSlice";

//NOTE - this is made so that we can use the Controller and Route and return the Orders.
//who is logged in currently.

function useGetMyOrders () {
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchOrders = async () => {
       
      try {
        const result = await axios.get(`${serverUrl}/api/order/get-orders`, {
          withCredentials: true,
        });
        dispatch(setMyOrders(result.data))
        console.log(result.data)
      } catch (error) {
        console.log(error);
      }
    };
    fetchOrders();
  }, []);
};

export default useGetMyOrders;
