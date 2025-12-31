import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js";


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
            .populate("shopOrders.owner", "name email");
            
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
        if(status=="out for delivery" || !shopOrder.assignment){
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
                status:{$nin:["broadcasted","completed"]}
            }).distinct("assignedTo")

            const busyIdSet = new Set(busyIds.map(id=>String(id)))
            const availableBoys =nearByDeliveryBoys.filter(b=>!busyIdSet.has(String(b._id)))
            const candidates = availableBoys.map(b=>b._id)

            if(candidates.length==0){
                await order.save()
                return res.json({
                    message:"Order Status Updated But No Delivery Boys Available Currently!"
                })
            }

            const deliveryAssignment = await DeliveryAssignment.create({
                order:order._id,
                shop:shopOrder.shop,
                shopOrderId:shopOrder._id,
                broadcastedTo:candidates,
                status:"broadcasted",
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
            .populate("user", "fullName email mobile")  // Same as user side
            .populate("shopOrders.shop", "name")  // Same as user side
            .populate("shopOrders.owner", "name email mobile")  // Same as user side
            .populate("shopOrders.shopOrderItems.item", "name image price") 
            .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile");

        res.status(200).json({
            message: "Order status updated successfully",
            order: populatedOrder,
            assignedDeliveryBoy: updatedShopOrder.assignedDeliveryBoy,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder.assignment._id
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ 
            message: `Error updating order status: ${error.message}` 
        });
    }
};
