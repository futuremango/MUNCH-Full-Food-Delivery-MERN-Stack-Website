import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import axios from "axios";
import { serverUrl } from "../App";
import { updateUserLocation } from '../redux/userSlice';

function useUpdateLocation() {
    const dispatch = useDispatch(); 
    const { userData } = useSelector((state) => state.user);
    const watchIdRef = useRef(null);
    const lastUpdateRef = useRef(null); // ✅ Track last update time

    useEffect(() => {
        if (!userData || !userData._id) return;

        // ✅ Throttle function to prevent excessive updates
        const updateLocation = async (lat, lng) => {
            // Skip invalid coordinates
            if (lat === 0 && lng === 0) {
                console.log("Skipping (0,0) coordinates");
                return;
            }

            // ✅ Throttle updates to prevent excessive API calls
            const now = Date.now();
            if (lastUpdateRef.current && (now - lastUpdateRef.current) < 10000) { // 10 seconds
                console.log("Skipping location update (throttled)");
                return;
            }

            lastUpdateRef.current = now;

            try {
                const result = await axios.post(
                    `${serverUrl}/api/user/update-location`,
                    { lat, lng },
                    { withCredentials: true }
                );
                console.log("📍 Location updated:", result.data);
                
                // ✅ Update Redux state
                dispatch(updateUserLocation({
                    coordinates: [lng, lat] 
                }));
                
            } catch (error) {
                console.error("Location update error:", error.message);
            }
        };

        // ✅ Get initial position and start watching
        navigator.geolocation?.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                
                // Only proceed with valid coordinates
                if (Math.abs(lat) > 0.001 && Math.abs(lng) > 0.001) {
                    updateLocation(lat, lng);
                    
                    // ✅ Clear previous watch if exists
                    if (watchIdRef.current) {
                        navigator.geolocation.clearWatch(watchIdRef.current);
                    }
                    
                    // ✅ Start watching with optimized settings
                    watchIdRef.current = navigator.geolocation.watchPosition(
                        (pos) => {
                            const newLat = pos.coords.latitude;
                            const newLng = pos.coords.longitude;
                            
                            // Only update if location changed significantly
                            if (Math.abs(newLat - lat) > 0.0001 || Math.abs(newLng - lng) > 0.0001) {
                                updateLocation(newLat, newLng);
                            }
                        },
                        (error) => {
                            console.error("Watch position error:", error.message);
                        },
                        { 
                            enableHighAccuracy: false, // ✅ Better for battery
                            maximumAge: 30000,        // ✅ Cache for 30 seconds
                            timeout: 10000            // ✅ 10 second timeout
                        }
                    );
                } else {
                    console.log("Invalid initial coordinates:", lat, lng);
                }
            },
            (error) => {
                console.error("Initial location error:", error.message);
            },
            { 
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 60000 // ✅ Cache for 1 minute
            }
        );

        // ✅ Cleanup function
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            lastUpdateRef.current = null;
        };
    }, [userData?._id, dispatch]); // ✅ Only depend on user ID
}

export default useUpdateLocation;