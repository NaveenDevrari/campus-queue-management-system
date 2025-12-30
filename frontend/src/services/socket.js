import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
  withCredentials: true,
});


export const socket = io(SOCKET_URL, {
  autoConnect: true,    // ✅ CONNECT AUTOMATICALLY
  withCredentials: true,
});
