import { createSlice } from "@reduxjs/toolkit";

const mapSlice = createSlice({
    name: 'map',
    initialState:{
        location:{
            lat:null,
            lng:null,
        },
        address:null,
    },
    reducers:{
       setLocation:(state, action)=>{
        const {lat , lng} = action.payload
        state.location.lat=lat
        state.location.lng=lng
       },
       setAddress:(state, action)=>{
        state.address=action.payload
       }
    }
})

export const { setLocation, setAddress } = mapSlice.actions
export default mapSlice.reducer