import React, { useRef, useState } from "react";
import debounce from 'lodash/debounce';
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useExactLocation from "../hooks/useExactLocation";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { FaChevronRight, FaMapMarkerAlt, FaShoppingBag } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { IoSearchSharp } from "react-icons/io5";
import { MdGpsFixed, MdOutlinePayments, MdCreditCard } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { setAddress, setLocation } from "../redux/mapSlice";
import { serverUrl } from "../App";
import { updateMyOrder } from "../redux/userSlice";

// Fix for Leaflet marker icons
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
  const { cartItems, totalAmountInCart } = useSelector((state) => state.user);
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

  // Calculate delivery fee and totals
  const deliveryFee = totalAmountInCart > 500 ? 0 : 50;
  const subtotal = totalAmountInCart;
  const totalOverallAmount = subtotal + deliveryFee;
  
  // Calculate item count
  const itemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

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

  // Sync addressInput when Redux address updates
  React.useEffect(() => {
    if (address && address !== addressInput) {
      setAddressInput(address);
    }
  }, [address, addressInput]);

  const handlePlaceOrder = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/place-order`,{
        paymentMethod:selectedPayment,
        deliveryAddress:{
          text:addressInput,
          latitude:location.lat,
          longitude:location.lng
        },
        totalAmount:totalAmountInCart,
        cartItems
      },{withCredentials:true})
      dispatch(updateMyOrder(result.data))
      localStorage.setItem("lastOrder", JSON.stringify(result.data));
      navigate("/confirmed", { 
      state: { order: result.data } 
      });
    } catch (error) {
      console.log(error)
    }
  }

  const OrderSummary = () => (
    <div className="border-t border-gray-200 pt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-orange-100">
          <FaShoppingBag className="text-orange-600" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
          <p className="text-sm text-gray-500">Review your order details</p>
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-4">
        {/* Cart Items List */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mulish-regular font-semibold text-gray-800">Items in Cart ({itemCount})</h3>
          <button
            onClick={() => navigate("/my-cart")}
            className="text-xs px-3 py-1.5 bg-linear-to-r from-orange-100 to-red-100 
              text-orange-600 rounded-lg font-medium hover:from-orange-200 
              hover:to-red-200 transition-colors duration-300">
            Edit Cart
          </button>
        </div>
        
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {cartItems?.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-linear-to-r from-gray-50 to-orange-50/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-r from-orange-100 to-red-100 flex items-center justify-center">
                  <FaShoppingBag className="text-orange-500" size={14} />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">Rs.{item.price * item.quantity}</p>
                <p className="text-xs text-gray-500">Rs.{item.price} each</p>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Fee */}
        <div className="flex items-center justify-between text-sm p-2">
          <span className="text-gray-600">Delivery Fee</span>
          <span className={`font-medium ${deliveryFee === 0 ? "text-green-600" : "text-gray-800"}`}>
            {deliveryFee === 0 ? "FREE" : `Rs.${deliveryFee}`}
          </span>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">Total Amount</span>
            <span className="font-bold text-2xl text-gray-900">Rs.{totalOverallAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br bg-[#fff9f6] p-4 md:p-6 font-mulish-regular">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Navigation */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/my-cart")}
              className="p-2.5 transition-all duration-300 hover:bg-gray-100 rounded-xl active:scale-95">
              <IoArrowBackCircleOutline size={28} className="text-orange-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-orange-600">Delivery & Payment</h1>
              <p className="text-sm text-gray-500 mt-1">Complete your order</p>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("location")}
              className={`flex-1 py-3 text-center font-medium text-sm transition-all duration-300 relative
                ${activeTab === "location" 
                  ? "text-orange-600" 
                  : "text-gray-500 hover:text-gray-700"}`}
            >
              <span>Delivery Location</span>
              {activeTab === "location" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`flex-1 py-3 text-center font-medium text-sm transition-all duration-300 relative
                ${activeTab === "payment" 
                  ? "text-orange-600" 
                  : "text-gray-500 hover:text-gray-700"}`}
            >
              <span>Payment Method</span>
              {activeTab === "payment" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-10">
          <div className="flex items-center gap-5 mb-8">
            <button
              onClick={() => navigate("/my-cart")}
              className="p-3 transition-all duration-300 hover:bg-gray-100 rounded-xl active:scale-95"
            >
              <IoArrowBackCircleOutline size={35} className="text-orange-600" />
            </button>
            <div className="flex flex-col mt-4">
              <h1 className="text-3xl font-mulish-regular font-bold text-orange-600">Delivery & Payment</h1>
              <p className="text-gray-700 mt-1">Set your location and choose payment method</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center w-full max-w-2xl">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="font-bold text-orange-600">1</span>
                </div>
                <span className="text-sm font-medium mt-2 text-gray-600">Cart</span>
              </div>
              <div className="flex-1 h-px mx-4 bg-gray-200"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
                  <FaLocationDot className="text-white" size={18} />
                </div>
                <span className="text-sm font-medium mt-2 text-orange-600">Location</span>
              </div>
              <div className="flex-1 h-px mx-4 bg-gray-200"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <MdOutlinePayments className="text-gray-400" size={18} />
                </div>
                <span className="text-sm font-medium mt-2 text-gray-400">Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Delivery & Order Summary (Desktop) */}
          <div className={`lg:w-1/2 ${activeTab === "location" || !activeTab ? 'block' : 'hidden lg:block'}`}>
            {/* Delivery Location Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-orange-100">
                  <FaLocationDot className="text-orange-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Location</h2>
                  <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                </div>
              </div>

              {/* Error Display */}
              {(error || searchError) && (
                <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-red-600 text-sm font-medium">
                    {error || searchError}
                  </p>
                </div>
              )}

              {isDragging && (
              <div className="fixed top-4 right-4 z-50 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                   Adjusting location...
              </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                  <ClipLoader color="#3b82f6" size={18} />
                  <p className="text-blue-600 font-medium text-sm">
                    Detecting your location...
                  </p>
                </div>
              )}

              {/* Address Input */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Delivery Address</label>
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
                        className="w-full border border-gray-300 rounded-xl px-4 py-3.5 pr-12
                          focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100
                          transition-all duration-300 bg-white text-gray-800
                          placeholder:text-gray-400"
                        placeholder="Enter street address, area, or landmark..."
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {searchLoading ? (
                          <ClipLoader color="#f97316" size={16} />
                        ) : (
                          <FaMapMarkerAlt className="text-gray-400" size={18} />
                        )}
                      </div>
                    </div>

                    {/* Address Suggestions Dropdown */}
                    {showDropdown && suggestions.length > 0 && (
                      <div
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 
                          rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
                        ref={dropdownRef}
                      >
                        {suggestions.map((suggestion, index) => (
                          <div
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 
                              last:border-b-0 transition-colors duration-200"
                            key={index}
                            onClick={() => handleSelectAddressDropdown(suggestion)}
                          >
                            <div className="font-medium text-gray-800 text-sm">
                              {suggestion.formatted}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">State/Province</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3
                        focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100
                        transition-all duration-300 bg-white"
                      placeholder="e.g., Punjab"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Zip/Postal Code</label>
                    <input
                      type="number"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3
                        focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100
                        transition-all duration-300 bg-white"
                      placeholder="e.g., 54000"
                    />
                  </div>
                </div>

                {/* Complete Address Preview */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Complete Delivery Address</label>
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <p className="text-gray-800">
                      {addressInput || "No address set"}
                      {state && `, ${state}`}
                      {zipCode && `, ${zipCode}`}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={getLatLngByAddress}
                    disabled={searchLoading || !addressInput.trim() || isDragging}
                    className="flex-1 bg-orange-600 hover:bg-orange text-white px-4 py-3.5 rounded-xl 
                      text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
                      disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    <IoSearchSharp size={18} />
                    <span>Search Address</span>
                  </button>
                  <button
                    onClick={handleGpsClick}
                    disabled={isLoading}
                    className="flex-1 border border-orange-200 bg-orange-100 hover:border-orange-400 text-gray-900 px-4 py-3.5 rounded-xl 
                      text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
                      disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <ClipLoader color="#6b7280" size={16} />
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <MdGpsFixed size={18} />
                        <span>Use GPS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop-only Order Summary */}
            <div className="hidden lg:block">
              <OrderSummary />
            </div>

            {/* Confirm Order Button (Desktop) */}
            <div className="hidden lg:block">
              <button
                onClick={handlePlaceOrder}
                disabled={!addressInput.trim() || cartItems?.length === 0}
                className="w-full mt-8 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl 
                  font-medium transition-all duration-300 flex items-center justify-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-md hover:shadow-lg"
              >
                {selectedPayment==="cod"?"Confirm Place Order":"Confirm Pay & Place Order"}
                <FaChevronRight size={18} />
              </button>
            </div>

            {/* Mobile Map Preview */}
            {(activeTab === "location" || !activeTab) && (
              <div className="lg:hidden mt-8 pt-8 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Map Preview</h3>
                    {location?.lat && location?.lng && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Location Set
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
                        >
                          <Popup>
                            <div className="text-center">
                              <p className="font-bold text-gray-800">Delivery Location</p>
                              <p className="text-sm text-gray-600 mt-1">Drag to adjust position</p>
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50">
                        <div className="p-4 rounded-full bg-gray-100 mb-3">
                          <FaLocationDot className="text-gray-400" size={28} />
                        </div>
                        <p className="text-sm text-gray-600 text-center px-4">
                          Set a location to see the map
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Map & Payment Methods */}
          <div className={`lg:w-1/2 ${activeTab === "payment" || !activeTab ? 'block' : 'hidden lg:block'}`}>
            {/* Desktop Map */}
            <div className="hidden lg:block mb-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Delivery Map</h2>
                    <p className="text-sm text-gray-500">
                      {location?.lat && location?.lng
                        ? "Drag the marker to adjust your delivery spot"
                        : "Set your location to view the map"}
                    </p>
                  </div>
                  {location?.lat && location?.lng && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Active
                    </span>
                  )}
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
                          <div className="text-center">
                            <p className="font-bold text-gray-800">Delivery Location</p>
                            <p className="text-sm text-gray-600 mt-1">Drag to adjust position</p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50">
                      <div className="p-6 rounded-full bg-gray-100 mb-4">
                        <FaLocationDot className="text-gray-400" size={40} />
                      </div>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Location Required
                      </p>
                      <p className="text-sm text-gray-500 text-center max-w-xs mb-6">
                        Use the GPS button or enter an address to see the map
                      </p>
                      <button
                        onClick={handleGpsClick}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium 
                          transition-all duration-300 hover:bg-black active:scale-95">
                        Detect My Location
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-8 lg:mt-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-orange-100">
                  <MdOutlinePayments className="text-orange-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                  <p className="text-sm text-gray-500">Choose how you'd like to pay</p>
                </div>
              </div>

              {/* Payment Methods: COD & Card */}
              <div className="space-y-4">
                {/* Cash on Delivery */}
                <div
                  onClick={() => setSelectedPayment("cod")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
                    ${selectedPayment === "cod"
                      ? "border-orange-600 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <span className="font-bold text-orange-600">COD</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay when you receive</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${selectedPayment === "cod" 
                        ? "border-orange-600 bg-orange-600" 
                        : "border-gray-300"}`}
                    >
                      {selectedPayment === "cod" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Card Payment */}
                <div 
                  onClick={() => setSelectedPayment("online")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
                    ${selectedPayment === "online" 
                      ? "border-orange-600 bg-orange-50" 
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <MdCreditCard className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Card Payment</p>
                        <p className="text-xs text-gray-500">Credit/Debit card</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${selectedPayment === "online" 
                        ? "border-orange-600 bg-orange-600" 
                        : "border-gray-300"}`}
                    >
                      {selectedPayment === "online" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Order Summary */}
              <div className="lg:hidden mt-8">
                <OrderSummary />
              </div>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Secure Payment</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Confirm Order Button */}
              <div className="lg:hidden mt-8">
                <button
                  onClick={handlePlaceOrder}
                  disabled={!addressInput.trim() || cartItems?.length === 0}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl 
                    font-medium transition-all duration-300 flex items-center justify-center gap-2
                    disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-md hover:shadow-lg"
                >
                  {selectedPayment==="cod"?"Confirm Place Order":"Confirm Pay & Place Order"}
                  <FaChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Back to Location (Mobile) */}
            {activeTab === "payment" && (
              <button
                onClick={() => setActiveTab("location")}
                className="w-full text-center text-orange-600 hover:text-orange-700 
                  font-medium text-sm transition-colors duration-300 lg:hidden py-4 mt-6"
              >
                ← Back to Location Settings
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentMethodPage;