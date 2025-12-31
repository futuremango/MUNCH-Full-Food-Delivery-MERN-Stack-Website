import express from 'express'
import isAuth from '../middleware/isAuth.js'
import { getAllOrders, placeOrder, updateOrderStatus } from '../controllers/orderController.js'

const orderRouter = express.Router()
orderRouter.post('/place-order', isAuth, placeOrder)
orderRouter.get('/get-orders', isAuth, getAllOrders)
orderRouter.put("/update-status", isAuth, updateOrderStatus);

export default orderRouter;