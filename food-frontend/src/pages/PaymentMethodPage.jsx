import React, { useRef, useState } from "react";
import debounce from 'lodash/debounce';
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { FaChevronRight, FaMapMarkerAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { IoSearchSharp } from "react-icons/io5";
import { MdGpsFixed, MdMyLocation, MdOutlinePayments, MdCreditCard } from "react-icons/md";
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

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Standard blue delivery icon (default)
const deliveryIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [35, 50],
  iconAnchor: [17, 50],
  popupAnchor: [0, -50]
});

// Active red delivery icon (for current/selected location)
const activeDeliveryIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [38, 55],
  iconAnchor: [19, 55],
  popupAnchor: [0, -55]
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
  const [activeTab, setActiveTab] = useState("location");
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&format=json&apiKey=${apiKey}&limit=8&filter=countrycode:pk`
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
  }, 350);

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = async (event) => {
    setIsDragging(false);
    const mark = event.target._latlng;
    const { lat, lng } = mark;
    dispatch(setLocation({ lat, lng }));
    getAddressBylatlng(lat, lng);
  };

  const getAddressBylatlng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${apiKey}&format=json`
      );

      if (result.data?.results?.length > 0) {
        const addressData = result.data.results[0];
        const formattedAddress = addressData.formatted;

        dispatch(setAddress(formattedAddress));
        setAddressInput(formattedAddress);

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
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&format=json&apiKey=${apiKey}&limit=10&filter=countrycode:pk`
      );

      if (result.data?.results?.length > 0) {
        if (result.data.results?.length === 1) {
          const addressData = result.data.results[0];
          const { lat, lon, formatted, state: addressState, postcode } = addressData;

          dispatch(setLocation({ lat, lng: lon }));
          dispatch(setAddress(formatted));
          setAddressInput(formatted);
          setState(addressState || "");
          setZipCode(postcode || "");
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
    getLocationDetails();
  };

  const handleConfirmOrder = () => {
    if (!addressInput.trim()) {
      setSearchError("Please set a delivery address first");
      return;
    }

    const completeAddress = addressInput + (state ? `, ${state}` : '') + (zipCode ? `, ${zipCode}` : '');

    console.log("Order confirmed with:", {
      address: completeAddress,
      paymentMethod: selectedPayment,
      coordinates: location
    });

    // navigate("/order-summary");
  };

  // Sync addressInput when Redux address updates
  React.useEffect(() => {
    if (address && address !== addressInput) {
      setAddressInput(address);
    }
  }, [address]);

  // Reset map loaded state when location changes
  React.useEffect(() => {
    setIsMapLoaded(false);
  }, [location]);

  // Add this debug useEffect
  React.useEffect(() => {
    console.log("Debug - Map State:", {
      location,
      isMapLoaded,
      isLoading,
      hasLocation: !!(location?.lat && location?.lng)
    });

    if (location?.lat && location?.lng) {
      console.log("Coordinates:", location);
    }
  }, [location, isMapLoaded, isLoading]);
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-red-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Drag Indicator */}
        {isDragging && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-1000 bg-linear-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-full shadow-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <ClipLoader color="#ffffff" size={14} />
              <span className="text-sm font-medium">Updating location...</span>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/my-cart")}
              className="rounded-full p-2.5 transition-all duration-300 hover:bg-white hover:shadow-xl active:scale-95"
            >
              <IoArrowBackCircleOutline
                size={32}
                className="text-[#ec4a09]"
              />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-linear-to-r from-orange-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                Checkout
              </h1>
              <p className="text-sm text-gray-500 mt-1">Set location & payment</p>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg mb-8 border border-orange-100">
            <button
              onClick={() => setActiveTab("location")}
              className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 ${activeTab === "location"
                  ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-[1.02]"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
            >
              <FaLocationDot size={19} />
              <span className="font-semibold text-sm">Location</span>
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 ${activeTab === "payment"
                  ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-[1.02]"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
            >
              <MdOutlinePayments size={19} />
              <span className="font-semibold text-sm">Payment</span>
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-10">
          <div className="flex items-center gap-5 mb-8">
            <button
              onClick={() => navigate("/my-cart")}
              className="rounded-full p-3 transition-all duration-300 hover:bg-white hover:shadow-2xl active:scale-95 group"
            >
              <IoArrowBackCircleOutline
                size={38}
                className="text-[#ec4a09] group-hover:scale-110 transition-transform duration-300"
              />
            </button>
            <div className="flex flex-col">
              <h1 className="text-4xl font-extrabold bg-linear-to-r from-orange-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                Delivery & Payment
              </h1>
              <p className="text-base text-gray-600 mt-2">
                Set your delivery location and choose payment method
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center w-full max-w-2xl">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                  <span className="font-bold">1</span>
                </div>
                <span className="text-sm font-medium mt-2 text-orange-600">Cart</span>
              </div>
              <div className="flex-1 h-1 mx-4 bg-linear-to-r from-orange-500 to-red-500"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                  <FaLocationDot size={20} />
                </div>
                <span className="text-sm font-medium mt-2 text-orange-600">Location</span>
              </div>
              <div className="flex-1 h-1 mx-4 bg-linear-to-r from-orange-500 to-red-500"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <MdOutlinePayments size={20} />
                </div>
                <span className="text-sm font-medium mt-2 text-gray-400">Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className={`lg:w-1/2 ${activeTab === "location" || !activeTab ? 'block' : 'hidden lg:block'}`}>
            {/* Delivery Location Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-orange-100/50 mb-8 hover:shadow-2xl transition-shadow duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3.5 rounded-2xl bg-linear-to-br from-orange-500 to-red-500 text-white shadow-lg">
                  <FaLocationDot size={24} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                    Delivery Location
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Where should we deliver your delicious order?
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {(error || searchError) && (
                <div className="mb-6 p-4 bg-linear-to-r from-red-50 to-orange-50 border border-red-200/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-500 text-lg">!</span>
                    </div>
                    <p className="text-red-600 font-medium">
                      {error || searchError}
                    </p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="mb-6 p-4 bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200/50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <ClipLoader color="#ec4a09" size={22} />
                    <div>
                      <p className="text-blue-600 font-medium">
                        Detecting your location...
                      </p>
                      <p className="text-xs text-blue-500 mt-1">Please allow location access</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Input Section */}
              <div className="space-y-6">
                {/* Main Address Input */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-base font-semibold text-gray-800">
                      Delivery Address
                    </label>
                    {addressInput && (
                      <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
                        ✓ Address set
                      </span>
                    )}
                  </div>
                  <div className="relative" ref={inputContainerRef}>
                    <div className="relative group">
                      <input
                        type="text"
                        value={addressInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAddressInput(value);
                          setSearchError(null);
                          debouncedSearch(value);
                        }}
                        className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 pr-14
                          focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100
                          transition-all duration-300 bg-white text-base
                          placeholder:text-gray-400 text-gray-800 shadow-sm group-hover:shadow-md"
                        placeholder="Enter street address, area, or landmark..."
                        required
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        {searchLoading ? (
                          <ClipLoader color="#ec4a09" size={18} />
                        ) : (
                          <FaMapMarkerAlt className="text-gray-400" size={18} />
                        )}
                      </div>
                    </div>

                    {/* Address Suggestions Dropdown */}
                    {showDropdown && suggestions.length > 0 && (
                      <div
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 
                          rounded-2xl shadow-2xl z-100 max-h-72 overflow-y-auto"
                        ref={dropdownRef}
                      >
                        <div className="p-3 border-b border-gray-100 bg-linear-to-r from-orange-50 to-red-50">
                          <p className="text-sm font-semibold text-gray-700">Select an address:</p>
                        </div>
                        {suggestions.map((suggestion, index) => (
                          <div
                            className="p-4 hover:bg-linear-to-r hover:from-orange-50 hover:to-red-50 cursor-pointer border-b border-gray-100 
                              last:border-b-0 transition-all duration-200 hover:pl-5 group"
                            key={index}
                            onClick={() => handleSelectAddressDropdown(suggestion)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                                <FaMapMarkerAlt className="text-orange-500" size={14} />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
                                  {suggestion.formatted}
                                </div>
                                {suggestion.street && (
                                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                    {suggestion.street && <span>{suggestion.street}</span>}
                                    {suggestion.city && <span>• {suggestion.city}</span>}
                                  </div>
                                )}
                              </div>
                              <FaChevronRight className="text-gray-300 group-hover:text-orange-400 mt-1" size={12} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5
                        focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100
                        transition-all duration-300 bg-white text-base
                        placeholder:text-gray-400 text-gray-800"
                      placeholder="e.g., Punjab"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Zip/Postal Code
                    </label>
                    <input
                      type="number"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5
                        focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100
                        transition-all duration-300 bg-white text-base
                        placeholder:text-gray-400 text-gray-800"
                      placeholder="e.g., 54000"
                    />
                  </div>
                </div>

                {/* Complete Address Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-base font-semibold text-gray-800">
                      Complete Delivery Address
                    </label>
                    <button
                      onClick={() => {
                        const completeAddress = addressInput + (state ? `, ${state}` : '') + (zipCode ? `, ${zipCode}` : '');
                        navigator.clipboard.writeText(completeAddress);
                      }}
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      name="completeAddress"
                      rows={3}
                      value={addressInput + (state ? `, ${state}` : '') + (zipCode ? `, ${zipCode}` : '')}
                      readOnly
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 
                        text-base text-gray-800 bg-linear-to-r from-gray-50 to-orange-50/30
                        focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 
                        resize-none transition-all duration-300 placeholder:text-gray-400
                        shadow-inner"
                      placeholder="Your complete address will appear here..."
                    />
                    <div className="absolute bottom-3 right-3 text-gray-400">
                      <FaMapMarkerAlt size={16} />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={getLatLngByAddress}
                    disabled={searchLoading || !addressInput.trim()}
                    className="flex-1 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 
                      hover:to-red-600 text-white px-5 py-4 rounded-2xl text-base font-semibold 
                      transition-all duration-300 flex items-center justify-center gap-3
                      shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                      active:scale-[0.98] transform"
                  >
                    <IoSearchSharp size={20} />
                    <span>Search Address</span>
                  </button>
                  <button
                    onClick={handleGpsClick}
                    disabled={isLoading}
                    className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 
                      hover:to-blue-800 text-white px-5 py-4 rounded-2xl text-base font-semibold 
                      transition-all duration-300 flex items-center justify-center gap-3
                      shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                      active:scale-[0.98] transform"
                  >
                    {isLoading ? (
                      <>
                        <ClipLoader color="#ffffff" size={18} />
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <MdGpsFixed size={20} />
                        <span>Use GPS</span>
                      </>
                    )}
                  </button>
                </div>

                {/* GPS Info Card */}
                <div className="p-4 bg-linear-to-r from-blue-50/80 to-cyan-50/80 border border-blue-200/50 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-100">
                      <MdMyLocation className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        Quick Location Setup
                      </p>
                      <p className="text-xs text-gray-600">
                        Click <span className="font-semibold text-blue-600">"Use GPS"</span> for automatic
                        detection or <span className="font-semibold text-orange-600">drag the map marker </span>
                         for precise manual adjustment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Map Preview */}
            {(activeTab === "location" || !activeTab) && (
              <div className="lg:hidden">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-orange-100/50">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-linear-to-r from-orange-500 to-red-500 text-white">
                        <TbMapPinCheck size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          Map Preview
                        </h3>
                        <p className="text-xs text-gray-500">Your delivery location</p>
                      </div>
                    </div>
                    {location?.lat && location?.lng && (
                      <span className="text-xs px-3 py-1.5 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-full shadow">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="h-72 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-inner relative">
                    {location?.lat && location?.lng ? (
                      <>
                        <MapContainer
                          className="w-full h-full"
                          center={[location.lat, location.lng]}
                          zoom={15}
                          scrollWheelZoom={false}
                          whenCreated={() => setIsMapLoaded(true)}
                        >
                          <TileLayer
                            attribution=''
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          {/* REMOVE isMapLoaded condition */}
                          <Marker
                            position={[location.lat, location.lng]}
                            draggable={true}
                            icon={isLoading ? deliveryIcon : activeDeliveryIcon}
                            eventHandlers={{
                              dragstart: onDragStart,
                              dragend: onDragEnd
                            }}
                          >
                            <Popup className="font-semibold">
                              <div className="text-center">
                                <p className="font-bold text-gray-800">Delivery Location</p>
                                <p className="text-sm text-gray-600 mt-1">Drag to adjust position</p>
                              </div>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-orange-50/30">
                        <div className="p-5 rounded-full bg-linear-to-r from-orange-100 to-red-100 mb-4 shadow-lg">
                          <FaLocationDot className="text-orange-400" size={40} />
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                          Location Required
                        </p>
                        <p className="text-sm text-gray-500 text-center px-4 mb-5">
                          Use GPS or enter address to see your location
                        </p>
                        <button
                          onClick={handleGpsClick}
                          className="px-5 py-2.5 bg-linear-to-r from-orange-500 to-red-500 
                            text-white rounded-xl font-medium flex items-center gap-2 
                            transition-all duration-300 hover:shadow-lg active:scale-95"
                        >
                          <MdGpsFixed size={18} />
                          Detect My Location
                        </button>
                      </div>
                    )}
                  </div>

                  {location?.lat && location?.lng && (
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">
                        📍 Drag the marker to adjust your delivery point
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className={`lg:w-1/2 ${activeTab === "payment" || !activeTab ? 'block' : 'hidden lg:block'}`}>
            {/* Desktop Map */}
            <div className="hidden lg:block mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-orange-100/50 hover:shadow-2xl transition-shadow duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Delivery Map
                    </h2>
                    <p className="text-gray-600">
                      {location?.lat && location?.lng
                        ? "Drag the marker to adjust your delivery spot precisely"
                        : "Set your location to view the map"}
                    </p>
                  </div>
                  {location?.lat && location?.lng && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-full shadow">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">Live Location</span>
                    </div>
                  )}
                </div>

                <div className="h-[420px] rounded-2xl overflow-hidden border-2 border-gray-300 shadow-inner relative">
                  {location?.lat && location?.lng ? (
                    <>
                      <MapContainer
                        className="w-full h-full"
                        center={[location.lat, location.lng]}
                        zoom={16}
                        scrollWheelZoom={true}
                        whenCreated={() => setIsMapLoaded(true)}
                      >
                        <TileLayer
                          attribution=''
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {/* REMOVE isMapLoaded condition */}
                        <>
                          <RecenterMap location={location} />
                          <Marker
                            position={[location.lat, location.lng]}
                            draggable={true}
                            icon={isLoading ? deliveryIcon : activeDeliveryIcon}
                            eventHandlers={{
                              dragstart: onDragStart,
                              dragend: onDragEnd
                            }}
                          >
                            <Popup className="custom-popup">
                              <div className="text-center p-2">
                                <div className="w-10 h-10 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center mb-2 mx-auto">
                                  <FaLocationDot className="text-white" size={16} />
                                </div>
                                <p className="font-bold text-gray-800 text-md">Delivery Location</p>
                                <p className="text-xs text-gray-600">Drag to adjust position</p>
                              </div>
                            </Popup>
                          </Marker>
                        </>
                      </MapContainer>
                    </>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50/50">
                      <div className="relative">
                        <div className="p-8 rounded-full bg-linear-to-r from-orange-100 to-red-100 mb-6 shadow-2xl">
                          <FaLocationDot className="text-orange-400" size={60} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs">
                          !
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-700 mb-3">
                        Location Required
                      </p>
                      <p className="text-gray-500 text-center max-w-md mb-8">
                        Use the GPS button or enter an address to visualize your delivery location on the map
                      </p>
                      <button
                        onClick={handleGpsClick}
                        className="px-8 py-4 bg-linear-to-r from-orange-500 to-red-500 
                          text-white rounded-2xl font-bold flex items-center gap-3 
                          transition-all duration-300 hover:shadow-2xl active:scale-95
                          shadow-lg"
                      >
                        <MdGpsFixed size={22} />
                        Detect My Location Automatically
                      </button>
                    </div>
                  )}
                </div>

                {location?.lat && location?.lng && (
                  <div className="mt-6 p-4 bg-linear-to-r from-blue-50/50 to-cyan-50/50 rounded-2xl border border-blue-200/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-100">
                        <TbMapPinCheck className="text-blue-600" size={20} />
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Tip:</span> Drag the marker on the map for precise location adjustment
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-7 md:p-8 border border-orange-100/50 mb-8 hover:shadow-2xl transition-shadow duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3.5 rounded-2xl bg-linear-to-br from-green-500 to-emerald-500 text-white shadow-lg">
                  <MdOutlinePayments size={26} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                    Payment Method
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose your preferred payment option
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Cash on Delivery */}
                <div
                  onClick={() => setSelectedPayment("cod")}
                  className={`p-5 border-2 rounded-2xl transition-all duration-300 cursor-pointer group
                    ${selectedPayment === "cod"
                      ? "border-orange-500 bg-linear-to-r from-orange-50/80 to-red-50/80 shadow-lg scale-[1.02]"
                      : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-md"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-r from-orange-100 to-red-100 flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition-all">
                        <span className="text-xl font-bold text-orange-600">COD</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-lg">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Recommended</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Secure</span>
                        </div>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-3 flex items-center justify-center transition-all
                      ${selectedPayment === "cod"
                        ? "border-orange-500 bg-orange-500 shadow-inner"
                        : "border-gray-300 group-hover:border-orange-400"}`}
                    >
                      {selectedPayment === "cod" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Payment (Coming Soon) */}
                <div className="p-5 border-2 border-gray-200 rounded-2xl cursor-not-allowed opacity-70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                        <MdCreditCard className="text-blue-500" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-lg">Card Payment</p>
                        <p className="text-sm text-gray-500">Credit/Debit card payment</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Coming Soon</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Visa/MasterCard</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full border-3 border-gray-300"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary & Confirm Button */}
            <div className="space-y-6">
              {/* Order Summary Preview */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-orange-100/50">
                <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Address:</span>
                    <span className="text-gray-800 font-medium text-right max-w-xs">
                      {addressInput
                        ? (addressInput.length > 40 ? addressInput.substring(0, 40) + "..." : addressInput)
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold text-orange-600">
                      {selectedPayment === "cod" ? "Cash on Delivery" : "Card Payment"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Status:</span>
                    <span className={`font-medium ${addressInput ? "text-green-600" : "text-red-600"}`}>
                      {addressInput ? "Ready for delivery" : "Address required"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm Order Button */}
              <button
                onClick={handleConfirmOrder}
                disabled={!addressInput.trim()}
                className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 
                  hover:to-red-600 text-white py-5 rounded-2xl text-lg font-bold 
                  transition-all duration-300 flex items-center justify-center gap-3
                  shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed
                  active:scale-[0.98] transform group"
              >
                <span>Confirm Order & Continue</span>
                <FaChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>

              {/* Back to Location (Mobile) */}
              {activeTab === "payment" && (
                <button
                  onClick={() => setActiveTab("location")}
                  className="w-full text-center text-orange-600 hover:text-orange-700 
                    font-semibold transition-colors duration-300 lg:hidden py-3
                    hover:bg-orange-50 rounded-xl"
                >
                  ← Back to Location Settings
                </button>
              )}

              {/* Security Assurance */}
              <div className="text-center p-4 bg-linear-to-r from-green-50/50 to-emerald-50/50 rounded-2xl border border-green-200/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">100% Secure Checkout</p>
                </div>
                <p className="text-xs text-gray-500">
                  Your payment information is protected with bank-level security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentMethodPage;