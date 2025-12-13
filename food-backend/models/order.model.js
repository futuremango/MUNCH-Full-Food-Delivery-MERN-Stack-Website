import mongoose from "mongoose";

//Schema for each item in a shop's order
const shopOrderItemSchema = new mongoose.Schema({
    item:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Item",
        required:true,
    },
    price:Number,
    quantity:Number,
})

//Schema for each shop's order in the main big order so different shops can have their own orders
const shopOrderSchema = new mongoose.Schema({
    shop:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Shop",
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    subTotal:Number,
    shopOrderItems:[shopOrderItemSchema],

}, {timestamps:true});


//Schema for the main order
const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    paymentMethod:{
        type:String,
        enum:["cod","online"],
        required:true,
    },
    deliveryAddress:{
        text:String,
        latitude:Number,
        longitude:Number,
    },
    totalAmount:Number,
    shopOrder:[shopOrderSchema],

}, {timestamps:true});

const Order = mongoose.model("Order", orderSchema);
export default Order;