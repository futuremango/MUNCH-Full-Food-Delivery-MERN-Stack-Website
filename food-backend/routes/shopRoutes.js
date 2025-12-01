import express from 'express'
import isAuth from '../middleware/isAuth.js'
import { createEditShop, getShop, getShopCity} from '../controllers/shopController.js'
import { upload } from '../middleware/multer.js'


const shopRouter = express.Router()

shopRouter.post("/create-edit-shop",isAuth,upload.single("image"),createEditShop)
shopRouter.get("/get-shop",isAuth,getShop)
shopRouter.get("/getshops-bycity/:city",isAuth,getShopCity)


export default shopRouter