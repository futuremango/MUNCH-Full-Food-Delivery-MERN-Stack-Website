import express from 'express'
import isAuth from '../middleware/isAuth.js'
import { addItem, deleteItem, editItem, getItemByID, getItemsByCity, getItemsByShop, getUserRating, rating, searchItems } from '../controllers/itemController.js'
import { upload } from '../middleware/multer.js'


const itemRouter = express.Router()

itemRouter.post("/add-item",isAuth,upload.single("image"),addItem)
itemRouter.put("/edit-item/:itemId",isAuth,upload.single("image"),editItem)
itemRouter.get("/get-item-by-id/:itemId",isAuth,getItemByID)
itemRouter.delete("/delete-item/:itemId",isAuth,deleteItem)
itemRouter.get("/getitems-bycity/:city",isAuth,getItemsByCity)
itemRouter.get("/getitems-byshop/:shopId",isAuth, getItemsByShop)
itemRouter.get("/searchbar",isAuth, searchItems)
itemRouter.get("/user-rating/:itemId",isAuth, getUserRating)
itemRouter.post("/rating",isAuth, rating)

export default itemRouter