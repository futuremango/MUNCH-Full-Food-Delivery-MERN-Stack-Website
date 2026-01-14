import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setGetCity } from '../redux/userSlice';
import { FaMapMarkerAlt, FaCheck, FaCrosshairs, FaSpinner } from 'react-icons/fa';

const cities = [
  "Wah Cantt", "Islamabad", "Rawalpindi", "Lahore", "Karachi", 
  "Peshawar", "Faisalabad", "Multan", "Gujranwala"
];

function CitySelector() {
  const [showSelector, setShowSelector] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const dispatch = useDispatch();
  const { getCity } = useSelector((state) => state.user);
  const cityRef = useRef(null);

  const handleUseCurrentLocation = () => {
    setIsDetecting(true);
    localStorage.removeItem('userCity');
    localStorage.removeItem('selectedCity');
    // Trigger GPS detection, (navigator+Geolocation COmbo)
    navigator.geolocation.getCurrentPosition(() => {
        console.log("GPS permission granted, location will update automatically");
        setIsDetecting(false);
        setShowSelector(false);
      },
      (error) => {
        console.error("GPS failed:", error);
        setIsDetecting(false);
      },
      {  enableHighAccuracy: true, timeout: 20000, maximumAge: 300000 }
    );
  };
  
  const handleCitySelect = (city) => {
    dispatch(setGetCity(city));
    localStorage.setItem('selectedCity', city);
    setShowSelector(false);
  };

  // The popup wil be closed when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (cityRef.current && !cityRef.current.contains(event.target)) {
          setShowSelector(false);
        }}
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  return (
    <div className="relative" ref={cityRef}>
      {/* City Display Button */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors whitespace-nowrap w-full">
        <FaMapMarkerAlt className="flex-shrink-0" />
        <span className="truncate max-w-[80px] md:max-w-[120px]">
          {getCity || "Select City"}
        </span>
      </button>
      
      {/* Dropdown Selector */}
      {showSelector && (
        <div className="fixed md:absolute md:top-full top-24 md:mt-2 left-0 md:left-auto md:right-0 w-64 bg-white rounded-xl md:rounded-xl shadow-2xl border border-orange-200 z-50">
          <div className="p-4">
            <h3 className="font-mulish-regular font-bold text-gray-800 mb-3">Select Your City</h3>
            
            {/* Auto-detect Button */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={isDetecting}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg mb-3 transition-colors ${
                isDetecting 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <div className="flex items-center gap-2">
                {isDetecting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaCrosshairs />
                )}
                <span className="font-medium">
                  {isDetecting ? 'Detecting...' : 'Use Current Location'}
                </span>
              </div>
              {!getCity && !isDetecting && (
                <span className="font-mulish-regular text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                  Recommended
                </span>
              )}
            </button>
            
            <div className="border-t border-gray-200 pt-3">
              <p className="font-mulish-regular text-sm text-gray-500 mb-2">Or select manually:</p>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {cities.map(city => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                      getCity === city 
                        ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{city}</span>
                    {getCity === city && <FaCheck className="text-orange-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {getCity 
                  ? `Currently viewing: ${getCity}` 
                  : 'Select a city to see local restaurants'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CitySelector;