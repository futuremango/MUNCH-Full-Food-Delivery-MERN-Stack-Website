//NOTE - Add Imports
import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import shopRouter from './routes/shopRoutes.js';
import itemRouter from './routes/itemRoutes.js';
import cors from "cors"
import orderRouter from './routes/orderRoutes.js';


//NOTE - Express app initialization
const app = express();
const port=process.env.PORT || 5000;

//NOTE - Initialization of CORS
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

//NOTE - Global Middleware
app.use(express.json())
app.use(cookieParser())

//NOTE - Routes
app.use("/api/auth" , authRouter)
app.use("/api/user" , userRouter)
app.use("/api/shop" , shopRouter)
app.use("/api/item" , itemRouter)
app.use("/api/order", orderRouter)

//NOTE - Server start with port, here callback function is used.
app.listen(port,()=>{
    connectDB()
    console.log(`Server started at ${port}`);
});

