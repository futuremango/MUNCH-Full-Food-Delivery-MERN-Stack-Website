import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { setGetAddress, setGetCity, setGetState } from "../redux/userSlice";
import axios from "axios";

//NOTE - Geoapify --> API Key then Geolocation Docs se Link and now by this
//function we get current city with the longitude and latitude converted!

function useGetCity () {
  const dispatch = useDispatch()
  const {userData} = useSelector((state)=>state.user)
  const apiKey=import.meta.env.VITE_GEO_APIKEY
  useEffect(() => {
      navigator.geolocation.getCurrentPosition(async(pos)=>{
        const latitude=pos.coords.latitude
        const longitude=pos.coords.longitude
        const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`)
        dispatch(setGetCity(result?.data?.results[0].city))
        dispatch(setGetState(result?.data?.results[0].state))
        dispatch(setGetAddress(result?.data?.results[0].formatted))
        console.log(result?.data?.results[0].county)
      })
  }, [userData])
};

export default useGetCity
