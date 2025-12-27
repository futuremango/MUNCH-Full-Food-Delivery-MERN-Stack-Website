import { useState } from "react";
import { useDispatch } from "react-redux";
import { setAddress, setLocation } from "../redux/mapSlice";
import axios from "axios";

function useExactLocation() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiKey = import.meta.env.VITE_GEO_APIKEY;

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

          // Update location in Redux
          dispatch(setLocation({ lat: latitude, lng: longitude }));

          // Get address from coordinates - FIXED: Add &format=json
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}&format=json`
          );

          console.log("Geoapify Reverse Response:", result.data);

          // FIXED: Check for 'results' not 'features'
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
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  return { isLoading, error, getLocationDetails };
}

export default useExactLocation;