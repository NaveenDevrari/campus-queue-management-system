import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  joinQueue,
  getActiveDepartments,
  getMyActiveTicket,
  cancelQueue,
  getMyTicketHistory,
  submitFeedback,
} from "../controllers/studentController.js";

import {
  requestEmergency,
  getEmergencyStatus,
} from "../controllers/emergencyController.js";

import uploadEmergency from "../middleware/uploadEmergency.js";

const router = express.Router();

router.get("/departments", protect, getActiveDepartments);
router.post("/join-queue", protect, joinQueue);
router.get("/my-ticket", protect, getMyActiveTicket);
router.get("/ticket-history", protect, getMyTicketHistory);
router.post("/cancel", protect, cancelQueue);
router.post("/feedback", protect, submitFeedback);

router.get("/emergency-status", protect, getEmergencyStatus);

router.post(
  "/emergency-request",
  protect,
  uploadEmergency.single("proof"),
  requestEmergency
);

export default router;
