import { createSlice } from "@reduxjs/toolkit";

//contains user related data and actions to modify that data
const userSlice = createSlice({
    name: 'user',
    initialState:{
        userData: null,
        getCity:null,
        getState:null,
        getAddress:null,
        getShopsinCity: [],  
        getItemsinCity: [],  
        cartItems: [], //array to hold items added to cart
        totalAmountInCart: 0,
    },
    reducers:{
        setUserData:(state, action)=>{
            state.userData=action.payload
        },
        setGetCity:(state, action)=>{
            state.getCity=action.payload
        },
        setGetState:(state, action)=>{
            state.getState=action.payload
        },
        setGetAddress:(state, action)=>{
            state.getAddress=action.payload
        },
        setGetShopsinCity:(state, action)=>{
            state.getShopsinCity=action.payload || []
        },
        setGetItemsinCity:(state, action)=>{
            state.getItemsinCity=action.payload || []
        },
        addToCart:(state, action)=>{
            const cartItem = action.payload //cart m item ko add krne wala action
            const existingItem = state.cartItems.find(item=>item.id === cartItem.id) //check if any item already in cart, match by id
            if(existingItem){
                existingItem.quantity+=cartItem.quantity //agr yes, tu cart m jo item match hua iuski quantity m jitna add krna tha wo add krdo
            }else{
                state.cartItems.push(cartItem) //agr nhi tu naya item push krdo, as add to cart
            }
            state.totalAmountInCart = state.cartItems.reduce((total, item)=> total + item.price * item.quantity,0)
        },
        updateQuantityInCart:(state, action)=>{
            const {id, quantity} = action.payload
            const existingItem = state.cartItems.find(item=>item.id===id)
            if(existingItem){
                existingItem.quantity = quantity
            }
            state.totalAmountInCart = state.cartItems.reduce((total, item)=> total + item.price * item.quantity,0)
        },
        removeItemInCart:(state, action)=>{
            state.cartItems = state.cartItems.filter(item=>item.id !== action.payload)
            state.totalAmountInCart = state.cartItems.reduce((total, item)=> total + item.price * item.quantity,0)
        },
       
    }
})

export const {setUserData, setGetCity, setGetState, setGetAddress, setGetShopsinCity, setGetItemsinCity, addToCart, updateQuantityInCart, removeItemInCart} = userSlice.actions
export default userSlice.reducer