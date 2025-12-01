import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
    name: 'owner',
    initialState:{
        getShopData:null,
    },
    reducers:{
        setGetShopData:(state, action)=>{
            state.getShopData=action.payload
        },
    }
})

export const { setGetShopData } = ownerSlice.actions
export default ownerSlice.reducer