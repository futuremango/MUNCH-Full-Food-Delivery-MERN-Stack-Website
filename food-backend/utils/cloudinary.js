import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

//returns a string of file(image)
const uploadOnCloudinary = async (file) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    const result = await cloudinary.uploader.upload(file)
    fs.unlinkSync(file)
    return result.secure_url
  } catch (error) {
        console.log(error)
  }
}

export default uploadOnCloudinary
