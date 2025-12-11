import React, { useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import { setGetAddress, setGetCity, setGetState } from "../redux/userSlice";
import axios from "axios";

function useGetCity() {
  const dispatch = useDispatch();
  const hasFetched = useRef(false);
  
  // ✅ EXPANDED AREA-TO-CITY MAPPING
  const getCityFromArea = (areaName) => {
    if (!areaName) return "Unknown";
    
    areaName = areaName.trim().toLowerCase();
    
    // Map areas/colonies to their main cities
    const areaToCityMap = {
      // Wah Cantt areas
      'shah wali colony': 'Wah Cantt',
      'gulshan colony': 'Wah Cantt',
      'lalazar': 'Wah Cantt',
      'civil lines': 'Wah Cantt',
      'attock': 'Wah Cantt',
      'i-10': 'Islamabad',
      'f-10': 'Islamabad',
      'g-10': 'Islamabad',
      'dha phase': 'Rawalpindi',
      'bahria town': 'Rawalpindi',
      // Add more mappings as needed
    };
    
    // Check for direct matches
    for (const [area, city] of Object.entries(areaToCityMap)) {
      if (areaName.includes(area.toLowerCase())) {
        return city;
      }
    }
    
    // Check for city name in the area string
    const majorCities = ['islamabad', 'rawalpindi', 'lahore', 'karachi', 'peshawar'];
    for (const city of majorCities) {
      if (areaName.includes(city)) {
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }
    
    // Return original if no match
    return areaName.split(',')[0].trim(); // Take first part before comma
  };

  useEffect(() => {
    if (hasFetched.current) return;
    
    hasFetched.current = true;
    
    // ✅ TRY LOCAL STORAGE FIRST (Better UX)
    const cachedLocation = localStorage.getItem('userCity');
    if (cachedLocation) {
      try {
        const { city, timestamp } = JSON.parse(cachedLocation);
        // Use cache if less than 1 hour old
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          console.log("Using cached city:", city);
          dispatch(setGetCity(city));
          return;
        }
      } catch (e) {
        console.log(e,"Cache invalid, fetching fresh location");
      }
    }
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
      
      console.log("📍 Fetching location for:", latitude, longitude);
      
      try {
        // ✅ Use OpenStreetMap (Free, Reliable, Better for Pakistan)
        const result = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=16`,
        );
        
        const address = result.data.address;
        
        // ✅ PRIORITY: City → Town → County → State DistrictS
        let city = address.city || 
                  address.town || 
                  address.village || 
                  address.county || 
                  address.state_district || 
                  "Unknown";
        
        // ✅ Apply area-to-city mapping
        city = getCityFromArea(city);
        
        console.log("📍 Normalized city:", city);
        
        // ✅ Save to Redux
        dispatch(setGetCity(city));
        dispatch(setGetState(address.state || ""));
        dispatch(setGetAddress(result.data.display_name || ""));
        
        // ✅ Cache for future use
        localStorage.setItem('userCity', JSON.stringify({
          city: city,
          timestamp: Date.now(),
          coords: { lat: latitude, lng: longitude }
        }));
        
      } catch (error) {
        console.error("Error fetching location:", error);
        
        // ✅ FALLBACK: Use IP-based location
        try {
          const ipResult = await axios.get('https://ipapi.co/json/');
          let city = ipResult.data.city || "Unknown";
          city = getCityFromArea(city);
          
          dispatch(setGetCity(city));
          dispatch(setGetState(ipResult.data.region || ""));
          
          localStorage.setItem('userCity', JSON.stringify({
            city: city,
            timestamp: Date.now(),
            source: 'ipapi'
          }));
        } catch (ipError) {
          console.error("IP location failed:", ipError);
          
          // ✅ FINAL FALLBACK: Manual city selection or default
          // You can add a popup here for manual city selection
          dispatch(setGetCity("Wah Cantt")); // Default for testing
        }
      }
    }, 
    (error) => {
      console.error("Geolocation blocked or failed:", error);
      
      // ✅ Use default city or show city selector
      const defaultCity = localStorage.getItem('selectedCity') || "Wah Cantt";
      dispatch(setGetCity(defaultCity));
    },
    {
      enableHighAccuracy: false, // Better battery life
      timeout: 8000,
      maximumAge: 30 * 60 * 1000 // 30 minutes cache
    });
    
  }, [dispatch]);
}

export default useGetCity;