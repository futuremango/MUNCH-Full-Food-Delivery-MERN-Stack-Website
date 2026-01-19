// context/SocketContext.jsx
import React, { createContext, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { serverUrl } from '../App';
import { useSelector } from 'react-redux';

// Create context
const SocketContext = createContext();

// Main Provider Component
export const SocketProvider = ({ children }) => {
  const { userData } = useSelector((state) => state.user); // ✅ Get from Redux
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  React.useEffect(() => {
    const userId = userData?._id;

    if (!userId) {
      // No user - disconnect socket if exists
      if (socketRef.current) {
        console.log("User logged out, disconnecting socket");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // If socket already exists for this user, don't recreate
    if (socketRef.current?.userId === userId && socketRef.current?.connected) {
      console.log("Socket already connected for user:", userId);
      return;
    }

    // Disconnect existing socket if any
    if (socketRef.current) {
      console.log("Disconnecting existing socket");
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log("Creating socket connection for user:", userId);
    
    const socketInstance = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      query: { userId }
    });

    // Store userId on socket instance for reference
    socketInstance.userId = userId;
    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id, 'for user:', userId);
      setIsConnected(true);
      setSocket(socketInstance);
      
      // Send identity to server
      socketInstance.emit('identity', { userId });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected for user:', userId);
      setIsConnected(false);
      setSocket(null);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error for user', userId, ':', error);
    });

    // Cleanup
    return () => {
      if (socketInstance && socketInstance.connected) {
        console.log("Cleaning up socket for user:", userId);
        socketInstance.disconnect();
      }
    };
  }, [userData?._id]); // ✅ Re-run when user changes

  const contextValue = {
    socket, 
    isConnected,
    emit: (event, data) => {
      if (socket && socket.connected) {
        return socket.emit(event, data);
      }
      console.warn('Socket not connected, cannot emit:', event);
      return false;
    },
    on: (event, callback) => {
      if (socket) {
        socket.on(event, callback);
      }
    },
    off: (event, callback) => {
      if (socket) {
        socket.off(event, callback);
      }
    }
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Export the context for the hook to use
export { SocketContext };