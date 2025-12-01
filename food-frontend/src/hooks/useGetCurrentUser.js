import React, { useEffect } from "react";
import { serverUrl } from "../App";
import axios from "axios";
import { useDispatch } from 'react-redux'
import { setUserData } from "../redux/userSlice";

//NOTE - this is made so that we can use the Controller and Route and return our user.
//officially see which user is logged in currently.
function useGetCurrentUser () {
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, [])
};

export default useGetCurrentUser
