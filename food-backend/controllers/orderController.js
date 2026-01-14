import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js";
import { verifyDeliveryOtpMail } from "../utils/mail.js";


export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress, totalAmount} = req.body
        console.log("First cart item structure:", cartItems[0]);
        console.log("Shop in cart item:", cartItems[0]?.shop);
        
        if( cartItems.length == 0 || !cartItems){
            return res.status(400).json({message: "Look, Your Cart is empty!"})
        }
        if( !deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude){
            return res.status(400).json({message: "Oops! Delivery Address Incomplete."})
        }

        //ye items k lie initalize krwaya
        const groupItemsByShop={}
        //by shop hum ne items ko alag kia
        cartItems.forEach(item => {
            const shopId = typeof item.shop === 'object' ? item.shop._id : item.shop;
            
            if(!shopId) {
                console.error("Item missing shop ID:", item);
                return res.status(400).json({message: "Item missing shop information"});
            }
            
            if(!groupItemsByShop[shopId]){
                groupItemsByShop[shopId]=[]
            }
            groupItemsByShop[shopId].push(item)
        });

        //shop order ko set kia by the order model because humne isko 
        // order create krne m use krna as a variable cuz shopOrders ki array hai in model
        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId)=>{
            const shop = await Shop.findById(shopId).populate("owner")
            if(!shop){
                return res.status(400).json({message:"Shop Not Found!"})
            }
            const items = groupItemsByShop[shopId]
            const subtotal = items.reduce((sum,i)=>sum+Number(i.price)*Number(i.quantity),0)
            return{
            shop:shop._id,
            owner:shop.owner._id,
            subtotal,
            shopOrderItems:items.map((i)=>({
                item:i.id || i._id,  // Handle both id and _id
                name:i.name,
                price:i.price,
                quantity:i.quantity,
            }))
            }
        }))

        //yahan order hua place/create finally
        const newOrder = await Order.create({
            user:req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount, 
            shopOrders,
        })
        await newOrder.populate("shopOrders.shopOrderItems.item","name image price")
        res.status(201).json(newOrder)
    } catch (error) {
        console.error("Error in placeOrder:", error);
        res.status(500).json({message:`Error Placing Order: ${error.message}`})
    }
};

// Working Ex:
// groupItemsByShop={
//     dominos_shopId=[item]
//     burgerKing_shopId=[item]
// }

export const getAllOrders = async(req,res)=>{
    try {
        const user = await User.findById(req.userId)
        if(user.role==="user"){
            const orders = await Order.find({user:req.userId})
            .sort({createdAt:-1})
            .populate("shopOrders.shop","name")
            .populate("shopOrders.owner","name email mobile")
            .populate("shopOrders.shopOrderItems.item","name image price")

            return res.status(200).json(orders)
        }else if(user.role==="owner"){
            const orders = await Order.find({"shopOrders.owner":req.userId})
            .sort({createdAt:-1})
            .populate("shopOrders.shop","name _id")  
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shopOrderItems.item","name image price")
            .populate("shopOrders.owner", "name email")
            .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile");
            
            // Filter orders to only include the owner's shop orders
            const filteredOrders = orders
                .filter(order => {
                    // Check if this order has shop orders belonging to this owner
                    return order.shopOrders.some(so => 
                        so.owner && so.owner._id.toString() === req.userId.toString()
                    );
                })
                .map(order => {
                    // Get only the shop orders belonging to this owner
                    const ownerShopOrders = order.shopOrders.filter(so => 
                        so.owner && so.owner._id.toString() === req.userId.toString()
                    );
                    
                    return {
                        _id: order._id,
                        paymentMethod: order.paymentMethod,
                        user: order.user,
                        deliveryAddress: order.deliveryAddress,
                        totalAmount: order.totalAmount,
                        shopOrders: ownerShopOrders,  
                        createdAt: order.createdAt,
                        updatedAt: order.updatedAt
                    };
                });

            return res.status(200).json(filteredOrders);
        }
    } catch (error) {
        return res.status(500).json({message:`Getting User Orders Error ${error}`})
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId, status } = req.body;
        const userId = req.userId;

        if (!orderId || !shopId || !status) {
            return res.status(400).json({ 
                message: "Missing required fields: orderId, shopId, status" 
            });
        }

        const validStatuses = ["pending", "preparing", "out for delivery", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status value" 
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ 
                message: "Order not found" 
            });
        }

        const shopOrder = order.shopOrders.find(so => 
            so.shop.toString() === shopId && so.owner.toString() === userId
        );

        if (!shopOrder) {
            return res.status(403).json({ 
                message: "You are not authorized to update this order" 
            });
        }

        // Update the status
        shopOrder.status = status;

        let deliveryBoysPayload=[];
        if(status==="out for delivery" && !shopOrder.assignment){
            const { latitude, longitude } = order.deliveryAddress
            const nearByDeliveryBoys = await User.find({
                role:'deliveryBoy',
                location:{
                    $near:{
                        $geometry:{type:'Point', coordinates:[Number(longitude),Number(latitude)]},
                        $maxDistance:5000
                    }
                }
            })
            const nearByIds = nearByDeliveryBoys.map(b=>b._id) 
            const busyIds = await DeliveryAssignment.find({
                assignedTo:{$in:nearByIds},
                status:{$nin:["brodcasted","completed"]}
            }).distinct("assignedTo")

            const busyIdSet = new Set(busyIds.map(id=>String(id)))
            const availableBoys =nearByDeliveryBoys.filter(b=>!busyIdSet.has(String(b._id)))
            const candidates = availableBoys.map(b=>b._id)

            if(candidates.length==0){
                await order.save()
                return res.status(200).json({
            message: "Order status updated but no delivery boys available",
            order: await Order.findById(orderId)
                .populate("user", "fullName email mobile")
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "name email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                })
            }

            const deliveryAssignment = await DeliveryAssignment.create({
                order:order._id,
                shop:shopOrder.shop,
                shopOrderId:shopOrder._id,
                brodcastedTo:candidates,
                status:"brodcasted",
            })
            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo
            shopOrder.assignment = deliveryAssignment._id
            deliveryBoysPayload=availableBoys.map(b=>({
                id:b._id,
                fullName:b.fullName,
                mobile:b.mobile,
                longitude:b.location.coordinates?.[0],
                latitude:b.location.coordinates?.[1],
            }))
        }
        await shopOrder.save();
        await order.save();

        const updatedShopOrder = order.shopOrders.find(o=>o.shop==shopId)

         const populatedOrder = await Order.findById(orderId)
            .populate("user", "fullName email mobile")  
            .populate("shopOrders.shop", "name")  
            .populate("shopOrders.owner", "name email mobile") 
            .populate("shopOrders.shopOrderItems.item", "name image price") 
            .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile");

        res.status(200).json({
            message: "Order status updated successfully",
            order: populatedOrder,
            assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder?.assignment._id
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ 
            message: `Error updating order status: ${error.message}` 
        });
    }
};

export const getDeliveryBoyAssignment = async (req, res) => {
    try {
        const dbIds = req.userId
        const assignments = await DeliveryAssignment.find({
            brodcastedTo:dbIds,
            status:"brodcasted",
        })
        .populate("order")
        .populate("shop")

        const formatted = assignments.map((a)=>({
            assignmentId:a._id,
            orderId:a.order._id,
            shopName:a.shop.name,
            deliveryAddress:a.order.deliveryAddress,
            items:a.order.shopOrders.find(so=>so._id.equals(a.shopOrderId)).shopOrderItems || [],
            totalAmount: a.order.shopOrders.find(so=>so._id.equals(a.shopOrderId))?.subTotal || 0
        }))
        return res.status(200).json(formatted)
    } catch (error) {
        res.status(500).json({ message: `Error getting assignment deliveryboys: ${error.message}` });
    }
};

export const acceptAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const deliveryBoyId = req.userId;

    console.log("Accepting assignment:", { assignmentId, deliveryBoyId });

    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const isBrodcastedTo = assignment.brodcastedTo.some(
      id => id.toString() === deliveryBoyId.toString()
    );
    
    if (!isBrodcastedTo) {
      return res.status(403).json({ 
        message: "You are not authorized to accept this assignment" 
      });
    }

    if (assignment.status !== "brodcasted") {
      return res.status(400).json({ 
        message: "This order is no longer available" 
      });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
        assignedTo:req.userId,
        status:{$nin:["brodcasted","completed"]},
    })

    if(alreadyAssigned){
        return res.status(400).json({message: "You are already assigned to another order!"})
    }

    assignment.assignedTo = deliveryBoyId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order)
    if(!order){
       res.status(400).json({
       message: "Order ID not found",
    });  
    }

    const shopOrder = order.shopOrders.id(assignment.shopOrderId)

    if (!shopOrder) {
      return res.status(404).json({
        message: "Shop order not found",
      });
    }

    shopOrder.assignedDeliveryBoy=deliveryBoyId
    shopOrder.assignedDeliveryBoyAt = new Date();
    shopOrder.status = "out for delivery";
    await order.save()
   
    const populatedOrder = await Order.findById(order._id)
      .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")
      .populate("user", "fullName email mobile")
      .populate("shopOrders.shop", "name");

    console.log("Assignment accepted successfully:", {
      assignmentId: assignment._id,
      deliveryBoyId,
      shopOrderId: shopOrder._id
    });

    res.status(200).json({
      message: "Delivery assignment accepted successfully",
      assignment,
      order: populatedOrder,
      acceptedDeliveryBoy: {
        id: deliveryBoyId,
        name: "Delivery Partner" 
      }
    });


  } catch (error) {
    console.error("Error accepting assignment:", error);
    res.status(500).json({ 
      message: `Error accepting assignment: ${error.message}` 
    });
  }
};

export const getCurrentOrder = async (req, res) =>{
    try {
        const assignment = await DeliveryAssignment.findOne({
            assignedTo:req.userId,
            status:"assigned"
        })
        .populate("shop","name")
        .populate("assignedTo","fullName mobile location email")
        .populate({
            path:"order",
            populate:[{ path:"user", select:"fullName mobile location email"}]  
        })
        if(!assignment){
            return res.status(200).json({ 
                success: true,
                message: "No active delivery found",
                hasOrder: false 
            });
        }
        if(!assignment.order){
            return res.status(400).json({message:"No Order for Assignment Found."})
        }
        const shopOrder = assignment.order.shopOrders.find(so => 
        so._id && so._id.toString() === assignment.shopOrderId.toString()
        )
        if(!shopOrder){
            return res.status(400).json({message:"No ShopOrder for Assignment Found."})
        }
        let deliveryBoyLocation = {lat:null, lng:null}
        if( assignment.assignedTo.location.coordinates.length==2){
            deliveryBoyLocation.lat= assignment.assignedTo.location.coordinates[1]
            deliveryBoyLocation.lng= assignment.assignedTo.location.coordinates[0]
        }

        let customerLocation = {lat:null, lng:null}
        if(assignment.order.deliveryAddress){
            customerLocation.lat= assignment.order.deliveryAddress.latitude
            customerLocation.lng= assignment.order.deliveryAddress.longitude
        }
        return res.status(200).json({
        success: true,
        hasOrder: true,
        message: "Active delivery found",
        _id: assignment.order._id,
        user: assignment.order.user,
        shopOrder,
        deliveryAddress: assignment.order.deliveryAddress,
        deliveryBoyLocation,
        customerLocation
    })
    } catch (error) {
        return res.status(500).json({message:"get Current Order Not Found."})
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params
        const order = await Order.findById(orderId)
        .populate("user")
        .populate({
            path:"shopOrders.shop",
            model:"Shop"
        })
        .populate({
            path:"shopOrders.assignedDeliveryBoy",
            model:"User"
        })
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .lean()

        if(!order){
            return res.status(400).json({message: "Order Not FOund"})
        }
        return res.status(200).json(order)
    } catch (error) {
        res.status(500).json({ 
            message: `Error get order by ID(track): ${error.message}` 
        });
    }
};

export const sendeliveryOTP = async(req, res) =>{
    try{
        const { orderId, shopOrderId } = req.body 
        console.log("Sending OTP for:", { orderId, shopOrderId });
        const order = await Order.findById(orderId).populate("user")
         if (!order) {
            return res.status(400).json({message: "Order not found"});
        }
        const shopOrder = order.shopOrders.id(shopOrderId)
        if(!order || !shopOrder){
            return res.status(400).json({message:"Invalid Shop Order Id"})
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        shopOrder.deliveryOtp=otp
        shopOrder.OtpExpires =  Date.now() + 1 * 60 * 1000
        await order.save()
                try {
            await verifyDeliveryOtpMail(order.user, otp);
            console.log("Delivery OTP email sent successfully");
        } catch (emailError) {
            console.warn("Failed to send email, but OTP was saved:", emailError.message);
            // Continue anyway, the OTP is saved in the database
        }

        console.log("OTP generated:", otp);
        return res.status(200).json({message:`OTP Sent Successfully to ${order.user.fullName}`, otp:otp})
    }catch(error){
        return res.status(500).json({message:`Error OTP Send Delivery ${error.message}`})
    }
};

export const verifyOTPDelivery = async (req, res) => {
    try {
        const {orderId, shopOrderId, otp}=req.body
        console.log("Verifying OTP:", { orderId, shopOrderId, otp });
        
        const order = await Order.findById(orderId)
            .populate("user")
            .populate("shopOrders.shop")
            .populate("shopOrders.owner");
            
        if (!order) {
            return res.status(400).json({message: "Order not found"});
        }
        
        const shopOrder = order.shopOrders.id(shopOrderId)
        if(!shopOrder){
            return res.status(400).json({message:"Invalid Shop Order Id"})
        }
        
        // Check OTP validity
        if(shopOrder.deliveryOtp!==otp || !shopOrder.OtpExpires || shopOrder.OtpExpires<Date.now()){
            return res.status(400).json({message:'Invalid or Expired OTP!'})
        }
        
        // Update shop order status
        shopOrder.status="delivered"
        shopOrder.deliveredAt=Date.now()
        
        // Clear OTP fields
        shopOrder.deliveryOtp = null;
        shopOrder.OtpExpires = null;
        
        // Save the order
        await order.save();
        
        // Update delivery assignment
        await DeliveryAssignment.findOneAndUpdate(
            {
                shopOrderId: shopOrder._id,
                order: order._id,
                assignedTo: shopOrder.assignedDeliveryBoy
            },
            {
                status: "completed",
                completedAt: Date.now()
            }
        );
        
        // Get the populated order for response
        const populatedOrder = await Order.findById(orderId)
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.owner", "name email mobile")
            .populate("shopOrders.shopOrderItems.item", "name image price")
            .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile");
        
        return res.status(200).json({
            message: `Order Delivered Successfully`,
            order: populatedOrder,
            updated: true
        });
        
    } catch (error) {
        return res.status(500).json({message: `Error Verifying Delivery OTP ${error.message}`})
    }
};