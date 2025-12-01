    import React, { useState } from "react";
    import { FaRegEye } from "react-icons/fa";
    import { FaRegEyeSlash } from "react-icons/fa";
    import { FcGoogle } from "react-icons/fc";
    import { Link, useNavigate } from "react-router-dom";
    import { serverUrl } from '../App'
    import axios from "axios"
    import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
    import { auth } from "../../firebase/firebase";
    import { ClipLoader } from 'react-spinners'
    import { useDispatch } from "react-redux";
    import { setUserData } from "../redux/userSlice";


    const SignIn = () => {

      //use dispatch
      const dispatch = useDispatch();

      //use navigate
      const navigate = useNavigate();
     
      //use states
      const [err, setErr] = useState("")   
      const [showPassword, setShowPassword] = useState(false)
      const [Loading, setLoading] = useState(false)
      const [credentials, setCredentials] = useState({
        email:"",
        password:""
          });
          
      //Handle Sign in through Axios
      const handleSignin=async()=>{
        setLoading(true)
        try {
          const result = await axios.post(`${serverUrl}/api/auth/signin`,{
            email: credentials.email,
            password: credentials.password,
          },{withCredentials:true})
          dispatch(setUserData(result.data))
          setErr("")
          setLoading(false)
          navigate("/")
        } catch (error) {
          console.log("SignIn error:", error);
          setErr(error?.response?.data?.message)
          setLoading(false)
        }
      }

      //handle submit for form on submit
      const handleSubmit=async(e)=>{
          e.preventDefault();
          await handleSignin();
      }

      //Handle Google Auth
      const handleGoogleAuth = async()=>{
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      console.log(result)
      try {
          const {data} = await axios.post(`${serverUrl}/api/auth/google-auth`,{
          email: result.user.email,
          }, {withCredentials: true})
          dispatch(setUserData(data))
          setErr("")
      } catch (error) {
          setErr(error?.response?.data?.message)
      }
      }

      return (
        //Main Container
        <div className="min-h-screen w-full flex items-center justify-center p-4">
          {/* Form and all Container */}
          <div className='bg-white/80 backdrop-blur-lg rounded-4xl shadow-2xl w-full max-w-md p-8 border border-white/20'>

            {/* Heading & Login Back Text */}
            <div className="text-center mb-4">
            <h1 className="text-4xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
              Welcome Back<span className="text-4xl">!</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Ready to satisfy those cravings again?
            </p>
            </div>
              
            {/* Google Signup */}
            <div className="relative mb-6">
            <button onClick={handleGoogleAuth} className="w-full flex items-center justify-center gap-3 border-2 border-gray-300 rounded-xl px-4 py-3 transition-all duration-300 hover:border-orange-400 hover:bg-orange-50 hover:shadow-md"> <FcGoogle size={23} />
            <span className="font-medium text-gray-700">Sign in with Google</span>
            </button>
            <div className="relative flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-5 text-gray-500 text-sm bg-white/80">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
            </div>
            </div>

            {/* Showing Error */}
            {err && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-center">
                {err}
              </div>
            )}

            {/* SignUp Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                value={credentials.email}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-white/50"
                placeholder="Email"
                onChange={(e)=>setCredentials({...credentials, email: e.target.value})}
                required
              />
            </div>

            {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "password" : "text"}
                  value={credentials.password}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-white/50"
                  placeholder="Password"
                  onChange={(e)=>setCredentials({...credentials, password: e.target.value})}
                  required/>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors duration-200 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}>
                  {!showPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20}/>}
                </button>
              </div>
              <div className="relative text-right mt-6 text-orange-500 font-semibold hover:text-orange-600 transition-colors duration-200 cursor-pointer" onClick={() => navigate("/forgot-password")}>
                Forgot Password? 
              </div>

              {/* Sign Back in Button */}
              <button type="submit" disabled={Loading} className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:from-orange-600 hover:to-red-600 hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0">
                {Loading ? <ClipLoader size={23} color="white"/> : "Sign into your account" }
              </button>

            </form>

            {/* Dont have account? */}
            <p className="text-center mt-6 text-gray-600" >Don't have an account yet?{" "}
            <Link to="/signup" className="text-orange-500 font-semibold hover:text-orange-600 underline transition-colors duration-200">
                Sign Up
              </Link>
            </p>

          </div>
        </div>
      );
    };

    export default SignIn;
