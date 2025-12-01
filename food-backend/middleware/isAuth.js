import jwt from "jsonwebtoken"

//NOTE - This middleware which can be accessed by any file is made so we can extract
//  the USER ID from the token and send it to the controller so it can use req.userId
const isAuth = async (req, res, next)=>{
    try {
        const token = req.cookies.token
        if(!token){
            return res.status(400).json({message:'Invalid Token!'})
        }
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET)
        if(!decodeToken){
            return res.status(400).json({message:'User is not registered!'})
        }
        req.userId=decodeToken.userId
        next()
    } catch (error) {
         return res.status(500).json({message:'isAuth Error!'})
    }
}

export default isAuth