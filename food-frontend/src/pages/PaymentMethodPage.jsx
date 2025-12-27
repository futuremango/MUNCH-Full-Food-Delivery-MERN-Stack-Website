import React, { useRef, useState } from "react";
import debounce from 'lodash/debounce';
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { FaLocationDot, FaChevronRight } from "react-icons/fa6";
import { IoSearchSharp } from "react-icons/io5";
import { MdGpsFixed, MdMyLocation, MdOutlinePayments } from "react-icons/md";
import { TbMapPinCheck } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import useExactLocation from "../hooks/useExactLocation";
import { ClipLoader } from "react-spinners";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useDispatch, useSelector } from "react-redux";
import { setAddress, setLocation } from "../redux/mapSlice";
import axios from "axios";
import L from "leaflet";

// Fix for Leaflet marker icons - No require() needed
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icon
const deliveryIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [0, -46]
});

function RecenterMap({ location }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (location?.lat && location?.lng) {
      map.setView([location.lat, location.lng], 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [location?.lat, location?.lng, map]);
  
  return null;
}

function PaymentMethodPage() {

  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_GEO_APIKEY;
  const { location, address } = useSelector((state) => state.map);
  const { isLoading, error, getLocationDetails } = useExactLocation();
  const [addressInput, setAddressInput] = useState("");
  const [searchError, setSearchError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("location"); // "location" or "payment"
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("")

  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const inputContainerRef = useRef(null);

  const debouncedSearch = debounce(async (query) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&format=json&apiKey=${apiKey}&limit=10&filter=countrycode:pk`
      );
      
      if (result.data?.results?.length > 0) {
        setSuggestions(result.data.results);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchLoading(false);
    }
  }, 300);

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = async (event) => {
    setIsDragging(false);
    const mark = event.target._latlng;
    console.log("Marker dragged to: ", mark);
    const { lat, lng } = mark;
    dispatch(setLocation({ lat, lng }));
    getAddressBylatlng(lat, lng);
  };

  const getAddressBylatlng = async (lat, lng) => {
  try {
    const result = await axios.get(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${apiKey}&format=json`
    );
    
    console.log("Reverse geocode on drag:", result.data);
    
    if (result.data?.results?.length > 0) {
      const addressData = result.data.results[0];
      const formattedAddress = addressData.formatted;
      
      dispatch(setAddress(formattedAddress));
      setAddressInput(formattedAddress);
      
      // Extract state and zip code if available
      if (addressData.state) setState(addressData.state);
      if (addressData.postcode) setZipCode(addressData.postcode);
    }
  } catch (error) {
    console.error("Error fetching address:", error);
  }
};
 
  const getLatLngByAddress = async () => {
    try { 
      if (!addressInput.trim()) {
        setSearchError("Please enter or choose your delivery address");
        return;
      }
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&format=json&apiKey=${apiKey}&limit=10&filter=countrycode:pk`);
      console.log("Address: ", result.data);
      
      if (result.data?.results?.length > 0) {
        if (result.data.results?.length === 1) {
          const { lat, lon, formatted } = result.data.results[0];
          dispatch(setLocation({ lat, lng: lon }));
          dispatch(setAddress(formatted));
          setSuggestions([]);
          setShowDropdown(false);
          setSearchError(null);
        } else {
          setSuggestions(result.data.results);
          setShowDropdown(true);
        }
      } else {
        setSearchError("No location found for the entered address.");
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch (error) {
      setSearchError("Error fetching location for the address: " + error.message);
      setSuggestions([]);
      setShowDropdown(false);
    }
  };
  
  const handleSelectAddressDropdown = (selectedAddress) => {
  console.log("User Selected Address: ", selectedAddress);
  const { lat, lon, formatted, state: selectedState, postcode } = selectedAddress;
  
  dispatch(setLocation({ lat, lng: lon }));
  dispatch(setAddress(formatted));
  setAddressInput(formatted);
  setState(selectedState || "");
  setZipCode(postcode || "");
  setSuggestions([]);
  setShowDropdown(false);
  setSearchError(null);
};

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          inputContainerRef.current && !inputContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);
  

  const handleGpsClick = () => {
  setShowDropdown(false);
  setSearchError(null);
  setState("");
  setZipCode("");
  getLocationDetails();
};

  const handleConfirmOrder = () => {
    if (!addressInput.trim()) {
      setSearchError("Please set a delivery address first");
      return;
    }
    // Navigate to order summary or next step
    console.log("Proceeding with:", { addressInput, selectedPayment });
    // navigate("/order-summary");
  };

  // Sync addressInput when Redux address updates
React.useEffect(() => {
  if (address && address !== addressInput) {
    setAddressInput(address);
  }
}, [address]);

// Clear state/zip when address changes significantly
React.useEffect(() => {
  if (addressInput && !addressInput.includes(state) && state) {
    setState("");
  }
  if (addressInput && !addressInput.includes(zipCode) && zipCode) {
    setZipCode("");
  }
}, [addressInput]);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#fff9f6] to-orange-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

       {isDragging && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <ClipLoader color="#ffffff" size={12} />
                <span className="text-sm font-medium">Updating location...</span>
              </div>
            </div>
          )}

        {/* Mobile Navigation Tabs */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/my-cart")}
              className="rounded-full p-2 transition-all duration-300 hover:bg-white hover:shadow-lg"
            >
              <IoArrowBackCircleOutline
                size={30}
                className="text-[#ec4a09] font-mulish-regular font-bold 
                group-hover:scale-110 transition-transform duration-300"
              />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-mulish-regular font-extrabold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Checkout
              </h1>
            </div>
          </div>

          {/* Tabs for Mobile */}
          <div className="flex bg-white rounded-xl p-1 shadow-inner mb-6">
            <button
              onClick={() => setActiveTab("location")}
              className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === "location" 
                  ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg" 
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              <FaLocationDot size={18} />
              <span className="font-medium text-sm">Location</span>
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === "payment" 
                  ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg" 
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              <MdOutlinePayments size={18} />
              <span className="font-medium text-sm">Payment</span>
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/my-cart")}
              className="rounded-full p-2 transition-all duration-300 hover:bg-white hover:shadow-lg"
            >
              <IoArrowBackCircleOutline
                size={35}
                className="text-[#ec4a09] font-mulish-regular font-bold 
                group-hover:scale-110 transition-transform duration-300"
              />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-4xl font-mulish-regular font-extrabold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Delivery & Payment
              </h1>
              <p className="text-sm text-gray-600 font-mulish-regular mt-1">
                Set your delivery location and choose payment method
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Delivery & Payment (Mobile: Tabs, Desktop: Side by side) */}
          <div className={`lg:w-1/2 ${activeTab === "location" || !activeTab ? 'block' : 'hidden lg:block'}`}>
            {/* Delivery Location Card */}
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 border border-orange-100 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white">
                  <FaLocationDot size={22} />
                </div>
                <div>
                  <h2 className="font-mulish-regular text-lg md:text-xl font-bold text-gray-800">
                    Delivery Location
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 font-mulish-regular">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {(error || searchError) && (
                <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm font-medium font-mulish-regular">
                    {error || searchError}
                  </p>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="mb-4 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                  <ClipLoader color="#ec4a09" size={20} />
                  <div>
                    <p className="text-blue-600 font-medium text-sm font-mulish-regular">
                      Detecting your location...
                    </p>
                  </div>
                </div>
              )}

            {/* Address Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm md:text-base font-medium text-gray-800 font-mulish-regular">
                  Delivery Address:
                </label>
                <div className="relative" ref={inputContainerRef}>
                  <div className="relative">
                    <input
                      type="text"
                      value={addressInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAddressInput(value);
                        setSearchError(null);
                        debouncedSearch(value);
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 md:px-5 py-3 md:py-4 pr-12
                        focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200
                        transition-all duration-300 bg-white font-mulish-regular text-sm md:text-base
                        placeholder:text-gray-400 text-gray-800"
                      placeholder={
                        searchLoading 
                          ? "Searching..." 
                          : "Enter your full delivery address"
                      }
                      required
                    />
                    {searchLoading && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <ClipLoader color="#ec4a09" size={16} />
                      </div>
                    )}
                  </div>

                  {/* Address Suggestions Dropdown */}
                  {showDropdown && suggestions.length > 0 && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 
                        rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto"
                      ref={dropdownRef}
                      style={{ position: 'absolute', zIndex: 9999 }}
                    >
                      {suggestions.map((suggestion, index) => (
                        <div
                          className="p-3 md:p-4 hover:bg-orange-50 cursor-pointer border-b border-gray-100 
                            last:border-b-0 transition-all duration-200"
                          key={index}
                          onClick={() => handleSelectAddressDropdown(suggestion)}
                        >
                          <div className="font-medium text-gray-800 text-sm md:text-base font-mulish-regular">
                            {suggestion.formatted}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 font-mulish-regular">
                    State/Province:
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 md:px-5 py-3 md:py-4
                      focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200
                      transition-all duration-300 bg-white font-mulish-regular text-sm md:text-base
                      placeholder:text-gray-400 text-gray-800"
                    placeholder="State (Optional)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 font-mulish-regular">
                    Zip/Postal Code:
                  </label>
                  <input
                    type="number"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 md:px-5 py-3 md:py-4
                      focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200
                      transition-all duration-300 bg-white font-mulish-regular text-sm md:text-base
                      placeholder:text-gray-400 text-gray-800"
                    placeholder="Zip Code (Optional)"
                  />
                </div>
              </div>
              

               <div className="space-y-2">
                <label className="text-sm md:text-base font-medium text-gray-800 font-mulish-regular">
                  Complete Delivery Address:
                </label>
                <textarea 
                  name="completeAddress"
                  rows={3}
                  value={addressInput + (state ? `, ${state}` : '') + (zipCode ? `, ${zipCode}` : '')}
                  readOnly
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 
                    text-sm md:text-base text-gray-800 bg-gray-50 
                    focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 
                    font-mulish-regular resize-none transition-all duration-300 
                    placeholder:text-gray-400"
                  placeholder="Your complete address will appear here..."
                />
              </div>

                {/* Action Buttons - Stack on mobile, side by side on tablet+ */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={getLatLngByAddress}
                    disabled={searchLoading}
                    className="flex-1 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 
                      hover:to-red-600 text-white px-4 py-3 rounded-xl text-sm font-medium 
                      font-mulish-regular transition-all duration-300 flex items-center justify-center gap-2
                      shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <IoSearchSharp size={18} />
                    <span className="whitespace-nowrap">Search Address</span>
                  </button>
                  <button
                    onClick={handleGpsClick}
                    disabled={isLoading}
                    className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 
                      hover:to-blue-800 text-white px-4 py-3 rounded-xl text-sm font-medium 
                      font-mulish-regular transition-all duration-300 flex items-center justify-center gap-2
                      shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <ClipLoader color="#ffffff" size={16} />
                        <span className="whitespace-nowrap">Detecting...</span>
                      </>
                    ) : (
                      <>
                        <MdGpsFixed size={18} />
                        <span className="whitespace-nowrap">Use GPS</span>
                      </>
                    )}
                  </button>
                </div>

                {/* GPS Info */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <MdMyLocation className="text-blue-600 mt-1 shrink-0" size={16} />
                    <p className="text-xs text-gray-600 font-mulish-regular">
                      Click <span className="font-semibold text-blue-600">"Use GPS"</span> for automatic 
                      location detection or drag the map marker for manual adjustment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Preview (Visible on mobile when location tab active) */}
            {(activeTab === "location" || !activeTab) && (
              <div className="lg:hidden mb-6">
                <div className="bg-white rounded-2xl shadow-lg p-5 border border-orange-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TbMapPinCheck className="text-orange-500" size={20} />
                      <h3 className="font-mulish-regular font-bold text-gray-800">
                        Map Preview
                      </h3>
                    </div>
                    {location?.lat && location?.lng && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
                    {location?.lat && location?.lng ? (
                      <MapContainer
                        className="w-full h-full"
                        center={[location.lat, location.lng]}
                        zoom={15}
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          attribution=''
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker 
                          position={[location.lat, location.lng]} 
                          draggable={true}
                          icon={deliveryIcon}
                          eventHandlers={{
                            dragstart: onDragStart,
                            dragend: onDragEnd
                          }}
                        />
                      </MapContainer>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50">
                        <div className="p-4 rounded-full bg-orange-100 mb-3">
                          <FaLocationDot className="text-orange-400" size={32} />
                        </div>
                        <p className="text-sm text-gray-600 font-mulish-regular text-center px-4">
                          Set a location to see the map
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Map & Payment (Desktop) / Payment Tab (Mobile) */}
          <div className={`lg:w-1/2 ${activeTab === "payment" || !activeTab ? 'block' : 'hidden lg:block'}`}>
            {/* Full Map (Desktop) */}
            <div className="hidden lg:block mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-mulish-regular text-xl font-bold text-gray-800">
                      Delivery Map
                    </h2>
                    <p className="text-sm text-gray-600 font-mulish-regular">
                      {location?.lat && location?.lng 
                        ? "Drag the marker to adjust your delivery spot" 
                        : "Set location to see the map"}
                    </p>
                  </div>
                </div>

                <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200">
                  {location?.lat && location?.lng ? (
                    <MapContainer
                      className="w-full h-full"
                      center={[location.lat, location.lng]}
                      zoom={16}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution=''
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <RecenterMap location={location} />
                      <Marker 
                        position={[location.lat, location.lng]} 
                        draggable={true}
                        icon={deliveryIcon}
                        eventHandlers={{
                          dragstart: onDragStart,
                          dragend: onDragEnd
                        }}
                      >
                        <Popup>
                          <div className="font-mulish-regular">
                            <p className="font-bold text-gray-800">Delivery Location</p>
                            <p className="text-sm text-gray-600 mt-1">Drag to adjust</p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50">
                      <div className="p-6 rounded-full bg-linear-to-r from-orange-100 to-red-100 mb-4">
                        <FaLocationDot className="text-orange-400" size={48} />
                      </div>
                      <p className="text-lg font-medium text-gray-700 font-mulish-regular mb-2">
                        Location Required
                      </p>
                      <p className="text-sm text-gray-500 text-center max-w-xs font-mulish-regular mb-4">
                        Use the GPS button or enter an address to see the map
                      </p>
                      <button
                        onClick={handleGpsClick}
                        className="px-6 py-3 bg-linear-to-r from-orange-500 to-red-500 
                          text-white rounded-xl font-medium font-mulish-regular 
                          flex items-center gap-2 transition-all duration-300 
                          hover:shadow-lg"
                      >
                        <MdGpsFixed size={18} />
                        Detect My Location
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 border border-orange-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-linear-to-r from-green-500 to-emerald-500 text-white">
                  <MdOutlinePayments size={22} />
                </div>
                <div>
                  <h2 className="font-mulish-regular text-lg md:text-xl font-bold text-gray-800">
                    Payment Method
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 font-mulish-regular">
                    Choose how you'd like to pay
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div 
                  onClick={() => setSelectedPayment("cod")}
                  className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer ${
                    selectedPayment === "cod" 
                      ? "border-orange-500 bg-orange-50" 
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-orange-600">COD</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 font-mulish-regular">Cash on Delivery</p>
                        <p className="text-xs text-gray-500 font-mulish-regular">Pay when you receive</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPayment === "cod" 
                        ? "border-orange-500 bg-orange-500" 
                        : "border-gray-300"
                    }`}>
                      {selectedPayment === "cod" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-2 border-gray-200 rounded-xl cursor-not-allowed opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">💳</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 font-mulish-regular">Card Payment</p>
                        <p className="text-xs text-gray-500 font-mulish-regular">Coming soon</p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Step Button */}
            <button
              onClick={handleConfirmOrder}
              disabled={!addressInput.trim()}
              className="w-full mt-6 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 
                hover:to-red-600 text-white py-4 rounded-xl text-lg font-bold 
                font-mulish-regular transition-all duration-300 flex items-center justify-center gap-2
                shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Confirm Order & Continue</span>
              <FaChevronRight size={18} />
            </button>

            {/* Back to Location Button (Mobile only when in payment tab) */}
            {activeTab === "payment" && (
              <button
                onClick={() => setActiveTab("location")}
                className="w-full mt-4 text-center text-orange-600 hover:text-orange-700 
                  font-medium font-mulish-regular transition-colors duration-300 lg:hidden"
              >
                ← Back to Location
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentMethodPage;