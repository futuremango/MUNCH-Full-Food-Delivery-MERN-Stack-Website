import React, { useEffect } from "react";
import { serverUrl } from "../App";
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux'
import { setGetShopData } from "../redux/ownerSlice";

//NOTE - this is made so that we can use the Controller and Route and return the Owner.
//shop, who is logged in currently.

function useGetShop () {
  const dispatch = useDispatch()
  const userData = useSelector((state)=>state.user)
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-shop`, {
          withCredentials: true,
        });
        dispatch(setGetShopData(result.data))
      } catch (error) {
        console.log(error);
      }
    };
    fetchShop();
  }, [userData]);
};

export default useGetShop
