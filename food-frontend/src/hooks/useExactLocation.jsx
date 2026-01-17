import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setAddress, setLocation } from "../redux/mapSlice";
import axios from "axios";

function useExactLocation() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  
  // Use refs to track watcher IDs
  const watchIdRef = useRef(null);
  const intervalIdRef = useRef(null);
  
  const apiKey = import.meta.env.VITE_GEO_APIKEY;

  // Cleanup function for watchers
  const cleanupWatchers = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    setIsWatching(false);
  };

  // Get location once (existing functionality)
  const getLocationDetails = () => {
    setIsLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          console.log("GPS Coordinates:", { latitude, longitude });

          dispatch(setLocation({ lat: latitude, lng: longitude }));

          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}&format=json`
          );

          console.log("Geoapify Reverse Response:", result.data);

          if (result.data?.results?.length > 0) {
            const formattedAddress = result.data.results[0].formatted;
            console.log("Formatted Address:", formattedAddress);
            dispatch(setAddress(formattedAddress));
          } else {
            console.log("No results in response");
            dispatch(setAddress("Address not found"));
          }
          
          setIsLoading(false);
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setError("Failed to get address details: " + err.message);
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Location access denied";
        
        switch(error.code) {
          case 1:
            errorMessage = "Please allow location access in browser settings";
            break;
          case 2:
            errorMessage = "Location unavailable. Check your GPS/Wi-Fi connection";
            break;
          case 3:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage = "Unable to get your location: " + error.message;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 300000
      }
    );
  };

  // NEW: Start live tracking with watchPosition
  const startLiveTracking = (onLocationUpdate = null, updateInterval = 5000) => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    cleanupWatchers(); // Clean up any existing watchers
    
    setIsLoading(true);
    setError(null);
    
    // First get immediate location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          console.log("🎯 Live tracking started - Initial position:", { latitude, longitude });
          
          // Update Redux
          dispatch(setLocation({ lat: latitude, lng: longitude }));
          
          // Optional: Get address once
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}&format=json`
          );

          if (result.data?.results?.length > 0) {
            dispatch(setAddress(result.data.results[0].formatted));
          }

          // Start watching for position changes
          watchIdRef.current = navigator.geolocation.watchPosition(
            (newPosition) => {
              const newLat = newPosition.coords.latitude;
              const newLng = newPosition.coords.longitude;
              
              console.log("📍 Position updated:", { latitude: newLat, longitude: newLng });
              
              // Update Redux
              dispatch(setLocation({ lat: newLat, lng: newLng }));
              
              // Callback for custom handling (e.g., sending to backend)
              if (onLocationUpdate && typeof onLocationUpdate === 'function') {
                onLocationUpdate({ latitude: newLat, longitude: newLng });
              }
            },
            (watchError) => {
              console.error("WatchPosition error:", watchError);
              let errorMsg = "Live tracking error";
              
              switch(watchError.code) {
                case 1:
                  errorMsg = "Location permission denied";
                  break;
                case 2:
                  errorMsg = "Position unavailable";
                  break;
                case 3:
                  errorMsg = "Position request timeout";
                  break;
              }
              
              setError(errorMsg);
              cleanupWatchers();
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0, // Don't use cached positions
              timeout: 10000
            }
          );

          setIsWatching(true);
          setIsLoading(false);
          
          // Optional: Set up interval for sending updates to backend
          intervalIdRef.current = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
              (currentPos) => {
                const currentLat = currentPos.coords.latitude;
                const currentLng = currentPos.coords.longitude;
                
                if (onLocationUpdate) {
                  onLocationUpdate({ 
                    latitude: currentLat, 
                    longitude: currentLng,
                    timestamp: new Date().toISOString(),
                    accuracy: currentPos.coords.accuracy || 0
                  });
                }
              },
              null,
              { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
            );
          }, updateInterval);

          console.log("✅ Live tracking active with watch ID:", watchIdRef.current);

        } catch (err) {
          console.error("Error in live tracking setup:", err);
          setError("Failed to start live tracking: " + err.message);
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Initial position error:", error);
        setError("Failed to get initial position");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // NEW: Stop live tracking
  const stopLiveTracking = () => {
    cleanupWatchers();
    console.log("🛑 Live tracking stopped");
  };

  // NEW: Check if location is being watched
  const isLiveTracking = () => {
    return isWatching && watchIdRef.current !== null;
  };

  // Cleanup on unmount
  const cleanup = () => {
    cleanupWatchers();
  };

  return { 
    isLoading, 
    error, 
    getLocationDetails,
    // New live tracking functions
    startLiveTracking,
    stopLiveTracking,
    isLiveTracking,
    cleanup
  };
}

export default useExactLocation;