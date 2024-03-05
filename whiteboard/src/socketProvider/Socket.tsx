import { createContext, useContext, useMemo } from "react";
import { io, Socket } from "socket.io-client";

// Create a context for the socket
export const SocketContext = createContext<Socket | null>(null);

// Custom hook to use the socket
export const useSocket = () => {
  const socket = useContext(SocketContext)
  if (!socket) throw new Error("Socket context not available");
  return socket;
};

// SocketProvider component to provide the socket throughout the app
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Memoize the socket instance to prevent unnecessary re-renders
 
  const socket = useMemo(() => {
    return io("ws://localhost:3000", {transports: ['websocket']});
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
