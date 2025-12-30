import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  callNextTicket,
  completeTicket,
  getStaffProfile,
  setQueueLimit,
  toggleQueueStatus,
  increaseQueueLimit,
  generateDepartmentQR,
  getQueueStats,
} from "../controllers/staffController.js";

const router = express.Router();

// ==============================
// STAFF PROFILE
// ==============================
router.get("/me", protect, getStaffProfile);
router.get(
  "/department/qr",
  protect,
  generateDepartmentQR
);
router.get("/queue-stats", protect, getQueueStats);


// ==============================
// STAFF QUEUE ACTIONS
// ==============================
router.post("/call-next", protect, callNextTicket);
router.post("/complete", protect, completeTicket);
router.post("/toggle-queue", protect, toggleQueueStatus);
router.post("/set-limit", protect, setQueueLimit);
router.post("/increase-limit", protect, increaseQueueLimit);


export default router;
