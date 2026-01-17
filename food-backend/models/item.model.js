import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Snacks",
        "Main Course",
        "Dessert",
        "Pizza",
        "Burger",
        "Sandwiches",
        "Pasta",
        "Desi Food",
        "Fast Food",
        "Homemade",
        "Chinese",
        "Bakery",
        "Indian Food",
        "All",
      ],
    },
    price:{
        type:Number,
        min:0,
        required:true,
    },
    foodType:{
        type:String,
        enum:[
            "Veg",
            "Non-veg",
            "Drink",
            "Sweet",
            "Other"
        ],
        required:true
    },
    rating:{
      average:{type:Number, default:0},
      count:{type:Number, default:0},
      usersRated: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        ratedAt: { type: Date, default: Date.now }
      }
    ]
    }
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema)
export default Item;