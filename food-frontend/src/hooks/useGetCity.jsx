import React, { useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import { setGetAddress, setGetCity, setGetState } from "../redux/userSlice";
import axios from "axios";

function useGetCity() {
  const dispatch = useDispatch();
  const hasFetched = useRef(false);
  const apiKey = import.meta.env.VITE_GEO_APIKEY; 
  const getCityFromArea = (areaName) => {
    if (!areaName) return "Unknown";

    areaName = areaName.trim().toLowerCase();

    const areaToCityMap = {
      'shah wali colony': 'Wah Cantt',
      'wah': 'Wah Cantt',
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

    for (const [area, city] of Object.entries(areaToCityMap)) {
      if (areaName.includes(area.toLowerCase())) {
        return city;
      }
    }

    const majorCities = ['islamabad', 'rawalpindi', 'lahore', 'karachi', 'peshawar'];
    for (const city of majorCities) {
      if (areaName.includes(city)) {
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }

    return areaName.split(',')[0].trim();
  };

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;

    const cachedLocation = localStorage.getItem('userCity');
    if (cachedLocation) {
      try {
        const { city, timestamp } = JSON.parse(cachedLocation);
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          console.log("Using cached city:", city);
          dispatch(setGetCity(city));
          return;
        }
      } catch (e) {
        console.log(e, "Cache invalid, fetching fresh location");
      }
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
      console.log("📍 Fetching location for:", latitude, longitude);
      try {
        const result = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}&format=json`
        );

        console.log("Geoapify response:", result.data);

        if (result.data?.results?.length > 0) {
          const address = result.data.results[0];

          let city = address.city ||
            address.town ||
            address.village ||
            address.county ||
            address.state_district ||
            "Unknown";

          city = getCityFromArea(city);

          console.log("📍 Normalized city:", city);

          dispatch(setGetCity(city));
          dispatch(setGetState(address.state || ""));
          dispatch(setGetAddress(address.formatted || ""));

          localStorage.setItem('userCity', JSON.stringify({
            city: city,
            timestamp: Date.now(),
            coords: { lat: latitude, lng: longitude }
          }));
        } else {
          console.log("No address found from Geoapify");
          throw new Error("No address found");
        }

      } catch (error) {
        console.error("Geoapify error:", error);
        try {
          const ipResult = await axios.get('https://api.ipify.org?format=json');
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


          dispatch(setGetCity("Wah Cantt"));
        }
      }
    },
      (error) => {
        console.error("Geolocation blocked or failed:", error);

        const defaultCity = localStorage.getItem('selectedCity') || "Wah Cantt";
        dispatch(setGetCity(defaultCity));
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 30 * 60 * 1000
      });

  }, [dispatch]);
}

export default useGetCity;