import React, { useState } from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { serverUrl } from '../App'
import axios from "axios"
import { ClipLoader } from 'react-spinners'

const ForgotPassword = () => {

    //use navigate
    const navigate = useNavigate();

    //use states
    const [step, setStep] = useState(1);
    const [otp, setOTP] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [err, setErr] = useState("") 
    const [Loading, setLoading] = useState(false)

    //handle Step 1: Send OTP
    const handleSendOTP = async()=> {
      setLoading(true)
      try {
        const result = await axios.post(`${serverUrl}/api/auth/send-otp`, 
          {email},
          {withCredentials:true})
          console.log(result);
          setErr("")
          setLoading(false)
          setStep(2)
      } catch (error) {
          setErr(error?.response?.data?.message)
          setLoading(false)
        }
      }
        
    //handle Step 2: Verify OTP
    const handleVerifyOTP = async ()=>{
      setLoading(true)
      try{
      const result = await axios.post(`${serverUrl}/api/auth/verify-otp`, 
          {email, otp},
          {withCredentials:true})
          console.log(result);
          setErr("")
          setLoading(false)
          setStep(3)
      } catch (error) {
          setErr(error?.response?.data?.message)
          setLoading(false)
        }
    }

    //handle Step 3: Reset Password
    const handleResetPassword = async ()=>{
        if(password!==confirmPassword){
        alert("Passwords don't match!");
        return; 
          }
          if(!password || !confirmPassword){
            alert("Please fill all fields");
            return;
          }
          setLoading(true)
          try{
            const result = await axios.post(`${serverUrl}/api/auth/reset-password`, 
              {email, newPassword: password},  
              {withCredentials:true})
              setErr("")
            console.log(result);
            setLoading(false)
            navigate('/signin')
          } catch (error) {;
            setErr(error.response?.data?.message || "Failed to reset password");
            setLoading(false)
          }
        }

        
  return (
    //Main Container
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#fff9f6]">
      {/* Container to put stuff inside */}
      <div className='bg-white/80 backdrop-blur-lg rounded-4xl shadow-2xl w-full max-w-md p-8 border border-white/20'>
      
        {/* Heading & Icon */}
        <div className='flex items-center gap-4 mb-8'>
        <IoArrowBack size={28} className='text-[#ec4a09] cursor-pointer' onClick={()=>navigate("/signin")}/>
        <h1 className='text-2xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'>Forgot Password?</h1>
       </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-6">
        <div className={`w-3 h-3 rounded-full mx-1 ${step >= 1 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
        <div className={`w-3 h-3 rounded-full mx-1 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
        <div className={`w-3 h-3 rounded-full mx-1 ${step >= 3 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
        </div>

        {/* Step 1: Send OTP through Email */}
        { step==1 &&  
        <div className='relative'>
        {/* Showing Error */}
        {err && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-center">
            {err}
          </div>
        )}
        <p className='text-gray-600 text-center mb-6'>Enter your email to receive OTP</p>
          <div className="mb-6">
                <input
                  type="email"
                  value={email}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-white/50"
                  placeholder="Email"
                  onChange={(e)=>setEmail(e.target.value)}
                  required/>
              </div>
              <button type="submit" onClick={handleSendOTP} disabled={Loading} className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:from-orange-600 hover:to-red-600 hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0">
                {Loading ? <ClipLoader size={23} color="white"/> : "Send OTP" }
              </button>
             </div>}

        {/* Step 2: Verify OTP  */}
        { step==2 &&  
        <div className='relative'>
            {/* Showing Error */}
            {err && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-center">
                {err}
              </div>
            )}
          <p className='text-gray-600 text-center mb-6'>Check your email for OTP</p>
          <div className="mb-6">
                <input
                  type="text"
                  value={otp}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-white/50"
                  placeholder="Enter OTP"
                  onChange={(e)=>setOTP(e.target.value)}
                  required/>
              </div>

              <button onClick={handleVerifyOTP} disabled={Loading} className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:from-orange-600 hover:to-red-600 hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0">
                {Loading ? <ClipLoader size={23} color="white"/> : "Verify OTP" }
              </button>
        </div>}

        {/* Step 3: Set New Password */}
        { step==3 &&  
        <div className='relative'>
          {/* Showing Error */}
          {err && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-center">
              {err}
            </div>
          )}
            <p className='text-gray-600 text-center mb-6'>Set your new password</p>
              <div className='mb-8 relative'>
              <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-white/50"
                  placeholder="New Password"
                  onChange={(e)=>setPassword(e.target.value)}
                  required/>
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors duration-200 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}>
                  {!showPassword ? <FaRegEye size={23} color="white" /> : <FaRegEyeSlash size={20}/>}
              </button>
              </div>

              {/* Confirm Password */}
              <div className='mb-8 relative'>
              <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-white/50"
                  placeholder="Confirm New Password"
                  onChange={(e)=>setConfirmPassword(e.target.value)}
                  required/>
              <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors duration-200 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}>
                  {!showPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20}/>}
              </button>
              </div>

              {password!==confirmPassword && confirmPassword && (
                  <p className='text-red-500 text-sm mt-2'>Passwords don't match!</p>
              )}
              <button onClick={handleResetPassword} disabled={Loading} className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:from-orange-600 hover:to-red-600 hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0">
                {Loading ? <ClipLoader size={20}/> : "Reset Password" }
              </button>
        </div>}

      </div>
    </div>
  )
}

export default ForgotPassword
