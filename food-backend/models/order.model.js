import mongoose from "mongoose";

//Schema for each item in a shop's order
const shopOrderItemSchema = new mongoose.Schema({
    item:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Item",
        required:true,
    },
    name:String,
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
    status:{
        type:String,
        enum:["pending","preparing","out for delivery","delivered", "cancelled"],
        default:"pending",
    },
    assignment:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"DeliveryAssignment",
        default:null,
    },
    assignedDeliveryBoy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    assignedDeliveryBoyAt: {  
        type: Date
    },
    deliveryOtp:{
        type:String,
        default:null,
    },
    OtpExpires:{
        type:Date,
        default:null,
    },
    deliveredAt:{
        type:Date,
        default:null
    }
}, {timestamps:true});


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
    shopOrders:[shopOrderSchema],

}, {timestamps:true});

const Order = mongoose.model("Order", orderSchema);
export default Order;