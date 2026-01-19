import User from "./models/user.model.js";

export const socketHandler = (io) => {
    let userLastUpdate = {};
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        // Handle user identity
        socket.on('identity', async ({ userId }) => {
            try {
                if (!userId) {
                    console.log('No userId provided');
                    return;
                }
                
                console.log('Setting socket for user:', userId);
                const user = await User.findByIdAndUpdate(
                    userId,
                    { socketId: socket.id, isOnline: true },
                    { new: true }
                );
                
                if (user) {
                    console.log(`User ${user.fullName} connected with socket ${socket.id}`);
                }
            } catch (error) {
                console.error('Error setting user socket:', error);
            }
        });
        
        // Handle disconnection
        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);
            try {
                await User.findOneAndUpdate(
                    { socketId: socket.id },
                    { socketId: null, isOnline: false }
                );
            } catch (error) {
                console.error('Error updating user on disconnect:', error);
            }
        });

        // Handle location updates plus first updating user location in DB
        socket.on('updateLocation', async ({latitude, longitude, userId}) => {
            try {
                // ✅ Throttle backend updates too
                const now = Date.now();
                const lastUpdate = userLastUpdate[userId] || 0;
                
                if (now - lastUpdate < 10000) { // 10 second throttle
                    return;
                }
                
                userLastUpdate[userId] = now;
                
                const user = await User.findByIdAndUpdate(userId, {
                    location: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    isOnline: true,
                    socketId: socket.id
                });

                if(user){
                    io.emit('updateDeliveryLocation',{
                        deliveryBoyId: userId,
                        latitude,
                        longitude,
                    });
                }
            } catch(error){
                console.error("Error updating location:", error);
            }
        });

        // Test socket
        socket.on('ping', (data) => {
            console.log('Ping received:', data);
            socket.emit('pong', { message: 'Server is alive!' });
        });
    });
};