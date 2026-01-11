import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import guestRoutes from "./routes/guestRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { initWebPush } from "./utils/push.js";
import path from "path";


// =======================
// LOAD ENV VARIABLES
// =======================
dotenv.config();
initWebPush();


// =======================
// CREATE EXPRESS APP
// =======================
const app = express();

// =======================
// ALLOWED ORIGINS (LOCAL + PROD)
// =======================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://campus-queue-management-system.onrender.com",
  "https://campus-queue-management-system-1.onrender.com",
];


// =======================
// MIDDLEWARES
// =======================
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-guest-token"],
  })
);

app.use(express.json());

// =======================
// ROUTES
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/guest", guestRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static("uploads"));


// =======================
// TEST ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("Campus Queue Backend is running 🚀");
});

// =======================
// CONNECT DATABASE
// =======================
connectDB();

// =======================
// CREATE HTTP SERVER
// =======================
const server = http.createServer(app);

// =======================
// SOCKET.IO SETUP (SINGLE INSTANCE)
// =======================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-guest-token"],
  },
});

// =======================
// SOCKET CONNECTIONS
// =======================
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // 🏢 Department room (already used)
  socket.on("join_department", (departmentId) => {
    const roomName = `department_${departmentId}`;
    socket.join(roomName);
    console.log(`🏠 Socket ${socket.id} joined ${roomName}`);
  });

  // 👤 USER-SPECIFIC ROOM (🔥 THIS WAS MISSING)
  socket.on("join_user", (userId) => {
    const userRoom = `user_${userId}`;
    socket.join(userRoom);
    console.log(`👤 Socket ${socket.id} joined ${userRoom}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});


// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// =======================
// EXPORT IO FOR CONTROLLERS
// =======================
export { io };
