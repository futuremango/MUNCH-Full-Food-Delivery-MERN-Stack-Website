import express from 'express'
import isAuth from '../middleware/isAuth.js'
import { acceptAssignment, getAllOrders, getAvailableBoysForOrder, getCurrentOrder, getDeliveries, getDeliveryBoyAssignment, getOrderById, placeOrder, sendeliveryOTP, updateOrderStatus, verifyOTPDelivery } from '../controllers/orderController.js'

const orderRouter = express.Router()
orderRouter.post('/place-order', isAuth, placeOrder)
orderRouter.get('/get-orders', isAuth, getAllOrders)
orderRouter.put("/update-status", isAuth, updateOrderStatus);
orderRouter.post('/get-available-boys', isAuth, getAvailableBoysForOrder);
orderRouter.get('/get-assignments', isAuth, getDeliveryBoyAssignment)
orderRouter.post('/accept-assignment', isAuth, acceptAssignment)
orderRouter.post('/send-delivery-otp', isAuth, sendeliveryOTP)
orderRouter.post('/verify-delivery-otp', isAuth,verifyOTPDelivery)
orderRouter.get('/get-current-order', isAuth, getCurrentOrder)
orderRouter.get('/get-order-id/:orderId', isAuth, getOrderById)
orderRouter.get('/get-today-deliveries', isAuth, getDeliveries)

export default orderRouter;