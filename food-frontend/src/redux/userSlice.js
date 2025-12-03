import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState:{
        userData: null,
        getCity:null,
        getState:null,
        getAddress:null,
        getShopsinCity: [],  // ✅ Changed from null to []
        getItemsinCity: [],  // ✅ Changed from null to []
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
    }
})

export const {setUserData, setGetCity, setGetState, setGetAddress, setGetShopsinCity, setGetItemsinCity} = userSlice.actions
export default userSlice.reducer