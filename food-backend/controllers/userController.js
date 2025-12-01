import User from "../models/user.model.js"


//NOTE - after getting req.userId from middleware we find that userID and return user.
export const getCurrentUser=async(req, res)=>{
    try {
        const userId = req.userId
        if(!userId){
            return res.status(400).json({ message:'User ID not Found!'})
        }
        const user =  await User.findById(userId)
        if(!user){
            return res.status(400).json({ message:'User not Found!'})
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message:'Some Error Occured!'})
    }
}