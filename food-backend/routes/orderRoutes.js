import express from 'express'
import isAuth from '../middleware/isAuth.js'
import { acceptAssignment, getAllOrders, getCurrentOrder, getDeliveryBoyAssignment, getOrderById, placeOrder, updateOrderStatus } from '../controllers/orderController.js'

const orderRouter = express.Router()
orderRouter.post('/place-order', isAuth, placeOrder)
orderRouter.get('/get-orders', isAuth, getAllOrders)
orderRouter.put("/update-status", isAuth, updateOrderStatus);
orderRouter.get('/get-assignments', isAuth, getDeliveryBoyAssignment)
orderRouter.post('/accept-assignment', isAuth, acceptAssignment)
orderRouter.get('/get-current-order', isAuth, getCurrentOrder)
orderRouter.get('/get-order-id/:orderId', isAuth, getOrderById)


export default orderRouter;