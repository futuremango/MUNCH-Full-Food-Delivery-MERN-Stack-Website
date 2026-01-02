import User from "../models/user.model.js"
import { sendOtpMail } from "../utils/mail.js"
import generateToken from "../utils/token.js"
import bcrypt from "bcrypt"

export const signup = async (req, res)=>{
    try{
        const {fullName, email, password, mobile, role} = req.body
        let user = await User.findOne({email})
        if(user){
            return res.status(400).json({message:"User already exists with this email"})
        }
        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 characters"})
        }
        if(mobile.length < 10){
            return res.status(400).json({message:"Mobile number must be greater than 10 digits"})
        }
        
        const hashPassword = await bcrypt.hash(password,10)
        user = await User.create({
            fullName,
            email,
            role,
            mobile,
            password:hashPassword
        })

        const token = await generateToken(user._id)
        res.cookie("token", token, { //giving some properties to the cookie
            secure: false, 
            sameSite:"strict",
            maxAge: 7*24*60*60*1000, // 7 days
            httpOnly: true
        })

        return res.status(201).json(user)
    }catch(error){
        return res.status(500).json(`Error while signing up user ${error}`);
    }
};

export const signIn = async (req, res)=>{
    try{

        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"User does not exist. Please sign up"})
        }
        
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch){
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = await generateToken(user._id)
        res.cookie("token", token, { //giving some properties to the cookie
            secure: false, 
            sameSite:"strict",
            maxAge: 7*24*60*60*1000, // 7 days
            httpOnly: true
        })

        return res.status(200).json(user)

    }catch(error){
        return res.status(500).json(`Error while Signing In... ${error}`);
    }
};

export const signOut = async (req, res)=>{
    try {
        res.clearCookie("token")
        return res.status(200).json({message:"Sign Out Successful"})
    } catch (error) {
        return res.status(500).json(`Error while Signing Out... ${error}`)
    }
};

export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist. Please sign up" });
        }
        if (user.OtpExpires > Date.now()) {
            const timeLeft = Math.ceil((user.OtpExpires - Date.now()) / 1000);
            return res.status(429).json({ 
                message: `Please wait ${timeLeft} seconds before requesting new OTP` 
            });
        }
        let OTP = Math.floor(1000 + Math.random() * 9000).toString()
        user.resetOTP = OTP;
        user.OtpExpires = Date.now() + 1 * 60 * 1000;
        user.isOtpVerified = false;
        await user.save();
        await sendOtpMail(email, OTP);
        console.log(`OTP ${OTP} sent to ${email}`);
        return res.status(200).json({ message: 'OTP sent successfully!' });
    } catch (error) {
        console.error("OTP sending error:", error);
        return res.status(500).json(`Error sending OTP. ${error}`);
    }
};

export const verifyOTP = async (req, res)=>{
    try {
        const {email, otp} = req.body;
        let user = await User.findOne({ email });
        if (!user || user.resetOTP!==otp || user.OtpExpires<Date.now()) {
            return res.status(400).json({ message: "Invalid or Expired OTP" });
        }
        user.isOtpVerified=true
        user.resetOTP=undefined
        user.OtpExpires=undefined
        await user.save()
        console.log("OTP Verified");
        return res.status(200).json({ message: 'OTP Verified successfully!' });
    } catch (error) {
        return res.status(500).json(`Error Verifying OTP. ${error}`);
    }
};

export const resetPassword = async (req, res)=>{
    try {
        const {email, newPassword} = req.body
        const user = await User.findOne({email})
        if(!user || !user.isOtpVerified){
            return res.status(400).json({message:"OTP Verification Required!"})
        }
        const hashPassword= await bcrypt.hash(newPassword,10)
        user.password=hashPassword
        user.isOtpVerified=false
        await user.save()
        return res.status(200).json({message: 'Password Reset Successfully!'})
    } catch (error) {
        return res.status(500).json(`Error Resetting Password ${error}`)
    }
};

export const googleAuth = async (req, res)=>{
    try {
        const {fullName, email, mobile, role} = req.body
        let user = await User.findOne({email})
        if (!user){
            user= await User.create({
                fullName, email, mobile, role
            })
        }

        const token = await generateToken(user._id)
                res.cookie("token", token, { //giving some properties to the cookie
                    secure: false, 
                    sameSite:"strict",
                    maxAge: 7*24*60*60*1000, // 7 days
                    httpOnly: true
                })

        return res.status(200).json(user)

    }catch(error){
        return res.status(500).json(`Error Google Auth... ${error}`);
    }
};