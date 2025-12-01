import React, { useEffect } from "react";
import { serverUrl } from "../App";
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux'
import { setGetShopsinCity } from "../redux/userSlice";

//NOTE - this is made so that we can use the Controller and Route and return our user.
//officially see which user is logged in currently.
function useGetShopByCity () {
  const dispatch = useDispatch()
  const {getCity}=useSelector((state)=>state.user)
  useEffect(() => {
    const fetchShopsbycity = async () => {
        if (!getCity) {
        console.log("City is null, skipping API call");
        return;
      }
      try {
        const result = await axios.get(`${serverUrl}/api/shop/getshops-bycity/${getCity}`, {
          withCredentials: true,
        });
        dispatch(setGetShopsinCity(result.data))
        console.log("Shops found:", result.data)
      } catch (error) {
        console.log(error);
      }
    };
    fetchShopsbycity();
  }, [getCity, dispatch]) 
};

export default useGetShopByCity; 