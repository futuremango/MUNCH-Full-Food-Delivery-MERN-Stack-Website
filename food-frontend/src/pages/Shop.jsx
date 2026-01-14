import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App';
import { FaStore, FaUtensils } from "react-icons/fa";
import { FaLocationDot } from 'react-icons/fa6';
import { FaStar, FaRegStar, FaShoppingCart, FaPlus, FaMinus } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice'; 
import { IoArrowBackCircleOutline } from "react-icons/io5";

function Shop() {
    const {shopId} = useParams();
    const [shopData, setShopData] = useState(null);
    const [itemsData, setItemsData] = useState([]);
    const [err, setErr] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems } = useSelector(state => state.user);
    
    // Separate quantity for each item
    const [itemQuantities, setItemQuantities] = useState({});

    const foodRating = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                i <= rating ? (
                    <FaStar key={i} className="text-yellow-500 text-xs sm:text-sm" />
                ) : (
                    <FaRegStar key={i} className="text-yellow-500 text-xs sm:text-sm" />
                )
            );
        }
        return stars;
    };

    const increaseQuantity = (itemId) => {
        setItemQuantities(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
    };

    const decreaseQuantity = (itemId) => {
        setItemQuantities(prev => ({
            ...prev,
            [itemId]: Math.max(0, (prev[itemId] || 0) - 1)
        }));
    };

    const getFoodTypeConfig = (foodType) => {
        const foodTypeColors = {
            "Veg": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
            "Non-veg": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
            "Drink": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
            "Sweet": { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" }
        };
        
        return foodTypeColors[foodType] || { 
            bg: "bg-gray-50", 
            text: "text-gray-700", 
            border: "border-gray-200" 
        };
    };

    const handleShop = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/item/getitems-byshop/${shopId}`, 
                {withCredentials:true}
            );
            console.log("Shop data:", result.data);
            setShopData(result.data);
            setItemsData(result.data.items || []);
            setErr(null);
        } catch (error) {
            setErr("Error fetching shop data");
            console.log("Error:", error);
        }
    };
    
    React.useEffect(() => {
        handleShop();
    }, [shopId]);

    if (!shopData && !err) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }
    
    return (
        <div className='min-h-screen bg-gray-50'>
        
            {err && <p className='text-red-500 text-center mt-4'>{err}</p>}
            {shopData?.shop && (
                <div className='relative w-full h-64 md:h-80 lg:h-96'>
                    <div className="absolute top-6 left-6 z-20">
                        <button
                            onClick={() => navigate("/")}
                            className="p-2.5 transition-all duration-300 hover:bg-white/20 rounded-xl active:scale-95"
                        >
                            <IoArrowBackCircleOutline size={32} className="text-white" />
                        </button>
                    </div>

                    {/* Cart Button */}
                    <div className="absolute top-6 right-6 z-20">
                        <div 
                            className="relative cursor-pointer group p-2.5 transition-all duration-300 hover:bg-white/20 rounded-xl active:scale-95"
                            onClick={() => navigate('/my-cart')}
                        >
                            <FaShoppingCart
                                size={28}
                                className="text-white font-extrabold"
                            />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs 
                                w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg">
                                    {cartItems.length}
                                </span>
                            )}
                        </div>
                    </div>

                    <img src={shopData.shop.image} alt={shopData.shop.name} className='w-full h-full object-cover'/>
                    <div className='absolute inset-0 bg-gradient-to-b from-black/70 to-transparent 
                    flex flex-col justify-center items-center text-center px-4'>
                        <FaStore className='text-orange-600 mb-3 text-4xl drop-shadow-md'/>
                        <h1 className='text-3xl md:text-5xl font-mulish-regular font-extrabold drop-shadow-lg
                        text-white mb-2'>{shopData.shop.name}</h1>
                        <div className='flex items-center justify-center gap-2'>
                            <FaLocationDot size={18} className="text-orange-600"/>
                            <p className='text-lg font-medium text-gray-200'>{shopData.shop.address}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className='max-w-7xl mx-auto px-6 py-10'>
                <h2 className='flex items-center justify-center text-3xl 
                gap-3 font-mulish-regular font-bold mb-6'>
                    <FaUtensils color='red'/>
                    Our Menu
                </h2>
                
                {itemsData.length === 0 ? (
                    <p className='text-center text-gray-500'>No items available in this shop.</p>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                        {itemsData.map((item) => {
                            const typeConfig = getFoodTypeConfig(item.foodType);
                            const itemQuantity = itemQuantities[item._id] || 0;
                            const isInCart = cartItems.some(cartItem => cartItem.id === item._id);
                            
                            return (
                                <div key={item._id} className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'>
                                    <div className="relative aspect-square overflow-hidden bg-linear-to-br from-gray-50 to-gray-100">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                        
                                        {/* Food Type Badge */}
                                        <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-mulish-regular font-semibold border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border} backdrop-blur-sm`}>
                                            {item.foodType}
                                        </div>
                                    </div>
                                   
                                    {/* Content Area */}
                                    <div className="p-3 flex flex-col">
                                        {/* Name and Price Row */}
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-mulish-regular font-semibold text-gray-900 text-sm line-clamp-2 leading-tight pr-2 flex-1">
                                                {item.name}
                                            </h3>
                                            <span className="font-mulish-regular font-bold text-orange-600 text-sm whitespace-nowrap">
                                                Rs.{item.price}
                                            </span>
                                        </div>

                                        {/* Category Badge - FIXED: item.category instead of getItemByID.category */}
                                        <div className="mb-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-mulish-regular font-medium ${typeConfig.bg} ${typeConfig.text}`}>
                                                {item.category}
                                            </span>
                                        </div>

                                        {/* Rating + Quantity Controls */}
                                        <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            {/* Rating - FIXED: item.rating instead of data.rating */}
                                            <div className="flex items-center gap-1 justify-between sm:justify-start">
                                                <div className="flex items-center gap-0.5">
                                                    {foodRating(item.rating?.average || 0)}
                                                </div>
                                                {item.rating?.count > 0 && (
                                                    <span className="text-xs text-gray-500 ml-1 font-mulish-regular font-medium hidden sm:inline">
                                                        ({item.rating.count})
                                                    </span>
                                                )}
                                            </div>

                                            {/* Add to cart */}
                                            <div className="flex items-center justify-center border border-orange-200 rounded-full overflow-hidden shadow-sm w-full sm:w-auto">
                                                <button 
                                                    onClick={() => decreaseQuantity(item._id)}
                                                    className="px-2 py-1 hover:bg-orange-50 transition-colors flex-1 sm:flex-none"
                                                    disabled={itemQuantity === 0}
                                                >
                                                    <FaMinus size={10} className={`${itemQuantity === 0 ? "text-gray-400" : "text-gray-700"} mx-auto`} />
                                                </button>
                                                
                                                <span className="px-2 py-1 text-sm font-medium min-w-[20px] text-center flex-1 sm:flex-none">
                                                    {itemQuantity || 0}
                                                </span>
                                                
                                                <button 
                                                    onClick={() => increaseQuantity(item._id)}
                                                    className="px-2 py-1 hover:bg-orange-50 transition-colors flex-1 sm:flex-none"
                                                >
                                                    <FaPlus size={10} className="text-gray-700 mx-auto" />
                                                </button>
                                                
                                                <button 
                                                    className={`px-3 py-2 transition-colors flex-1 sm:flex-none ${
                                                        isInCart 
                                                            ? "bg-gray-800 hover:bg-gray-900"
                                                            : itemQuantity > 0 
                                                                ? "bg-[#ec4a09] hover:bg-orange-600"
                                                                : "bg-gray-200 cursor-not-allowed"
                                                    }`}
                                                    disabled={itemQuantity === 0} 
                                                    onClick={() => dispatch(addToCart({
                                                        id: item._id,
                                                        name: item.name,
                                                        price: item.price,
                                                        image: item.image,
                                                        foodType: item.foodType,
                                                        quantity: itemQuantity,
                                                        shop: item.shop || shopId,
                                                    }))}
                                                >
                                                    <FaShoppingCart size={12} 
                                                        className={`${
                                                            isInCart || itemQuantity > 0 ? "text-white" : "text-gray-400"
                                                        } mx-auto`}  
                                                    /> 
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Shop;