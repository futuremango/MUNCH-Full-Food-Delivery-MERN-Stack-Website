import mongoose from "mongoose";

//Ittu sa cute sa connection function for MONGODB
const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("MongoDB Connected Successfully!");
    }catch(error){
        console.log("Error while connecting to DB", error);
    }
}
export default connectDB;