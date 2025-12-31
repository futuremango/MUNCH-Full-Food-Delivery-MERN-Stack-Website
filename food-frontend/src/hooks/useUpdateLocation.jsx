import React, { useEffect } from "react";
import {  useSelector } from 'react-redux';
// import { setGetAddress, setGetCity, setGetState } from "../redux/userSlice";
// import { setAddress } from "../redux/mapSlice";
import axios from "axios";
import { serverUrl } from "../App";

function useUpdateLocation() {
   // const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.user);
    //const apiKey = import.meta.env.VITE_GEO_APIKEY;

    useEffect(() => {
       const updateLocation = async (lat, lng) => {
            const result = await axios.post(`${serverUrl}/api/user/update-location`,{lat, lng},{withCredentials:true});
            console.log(result.data)
       }
       navigator.geolocation.watchPosition((pos)=>{
        updateLocation(pos.coords.latitude, pos.coords.longitude)
       })
    }, [userData]);
}

export default useUpdateLocation;