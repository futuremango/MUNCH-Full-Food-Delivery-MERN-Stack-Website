import express from 'express'
import isAuth from '../middleware/isAuth.js'
import { acceptAssignment, getAllOrders, getCurrentOrder, getDeliveryBoyAssignment, placeOrder, updateOrderStatus } from '../controllers/orderController.js'

const orderRouter = express.Router()
orderRouter.post('/place-order', isAuth, placeOrder)
orderRouter.get('/get-orders', isAuth, getAllOrders)
orderRouter.put("/update-status", isAuth, updateOrderStatus);
orderRouter.get('/get-assignments', isAuth, getDeliveryBoyAssignment)
orderRouter.post('/accept-assignment', isAuth, acceptAssignment)
orderRouter.get('/get-current-order', isAuth, getCurrentOrder)


export default orderRouter;