import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import axios from "axios";
import { serverUrl } from "../App";
import { updateUserLocation } from '../redux/userSlice';

function useUpdateLocation() {
    const dispatch = useDispatch(); 
    const { userData } = useSelector((state) => state.user);

    useEffect(() => {
        if (!userData) return;

        const updateLocation = async (lat, lng) => {
            if (lat === 0 && lng === 0) {
                console.log("Skipping (0,0) coordinates");
                return;
            }
            
            try {
                const result = await axios.post(
                    `${serverUrl}/api/user/update-location`,
                    { lat, lng },
                    { withCredentials: true }
                );
                console.log(result.data);
                
                dispatch(updateUserLocation({
                    coordinates: [lng, lat] 
                }));
                
            } catch (error) {
                console.log("Location update error:", error);
            }
        };
       
        navigator.geolocation?.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
          
                if (lat !== 0 && lng !== 0) {
                    updateLocation(lat, lng);
                    
                  
                    navigator.geolocation.watchPosition(
                        (pos) => updateLocation(pos.coords.latitude, pos.coords.longitude)
                    );
                }
            },
            (error) => console.log("Initial location error:", error.message)
        );
    }, [userData, dispatch]); 
}

export default useUpdateLocation;