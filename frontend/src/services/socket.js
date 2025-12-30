import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,    // ✅ CONNECT AUTOMATICALLY
  withCredentials: true,
});
