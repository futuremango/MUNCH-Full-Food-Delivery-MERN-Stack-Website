import User from "./models/user.model.js";

export const socketHandler = (io) => {
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
        
        // Test socket
        socket.on('ping', (data) => {
            console.log('Ping received:', data);
            socket.emit('pong', { message: 'Server is alive!' });
        });
    });
};