import express from "express";
import { protect } from "../middleware/authMiddleware.js";

// ===== STAFF CONTROLLERS =====
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

// ===== EMERGENCY CONTROLLERS =====
import {
  startEmergency,
  endEmergency,
  getPendingEmergencyCount,
  rejectEmergency,
  approveEmergency,
  getPendingEmergencies,
} from "../controllers/emergencyController.js";

const router = express.Router();

// ==============================
// STAFF PROFILE
// ==============================
router.get("/me", protect, getStaffProfile);
router.get("/department/qr", protect, generateDepartmentQR);
router.get("/queue-stats", protect, getQueueStats);

// ==============================
// 🚨 EMERGENCY ACTIONS (STAFF)
// ==============================
router.post("/emergency/start", protect, startEmergency);
router.post("/emergency/end", protect, endEmergency);
router.get(
  "/emergency/count",
  protect,      // your auth middleware
  getPendingEmergencyCount
);

router.get(
  "/emergencies",
  protect,
  getPendingEmergencies
);

router.post(
  "/emergency/approve/:emergencyId",
  protect,
  approveEmergency
);

router.post(
  "/emergency/reject/:emergencyId",
  protect,
  rejectEmergency
);


// ==============================
// STAFF QUEUE ACTIONS
// ==============================
router.post("/call-next", protect, callNextTicket);
router.post("/complete", protect, completeTicket);
router.post("/toggle-queue", protect, toggleQueueStatus);
router.post("/set-limit", protect, setQueueLimit);
router.post("/increase-limit", protect, increaseQueueLimit);


export default router;
