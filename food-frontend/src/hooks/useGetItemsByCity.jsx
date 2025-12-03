import React, { useEffect } from "react";
import { serverUrl } from "../App";
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux'
import { setGetItemsinCity } from "../redux/userSlice";

//NOTE - this is made so that we can use the Controller and Route and return our user.
//officially see which user is logged in currently.
function useGetItemsByCity() {

  const dispatch = useDispatch()
  const {getCity}=useSelector((state)=>state.user)

  useEffect(() => {
    const fetchItemsbycity = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/item/getitems-bycity/${getCity}`, {
          withCredentials: true,
        });
        dispatch(setGetItemsinCity(result.data))
        console.log("Total Items found:", result.data)
      } catch (error) {
        console.log(error);
      }
    };
    fetchItemsbycity();
  }, [getCity, dispatch]) 
};

export default useGetItemsByCity;