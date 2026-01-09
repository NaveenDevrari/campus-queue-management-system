import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  joinQueue,
  getActiveDepartments,
  getMyActiveTicket,
  cancelQueue,
  getMyTicketHistory,
} from "../controllers/studentController.js";

const router = express.Router();

// ==============================
// STUDENT: VIEW DEPARTMENTS
// ==============================
router.get("/departments", protect, getActiveDepartments);

// ==============================
// STUDENT: JOIN QUEUE
// ==============================
router.post("/join-queue", protect, joinQueue);
//=============================
// STUDENT: VIEW ACTIVE TICKET
// ==============================
router.get("/my-ticket", protect, getMyActiveTicket);
// ==============================
// STUDENT: TICKET HISTORY
// ==============================
router.get("/ticket-history", protect, getMyTicketHistory);


// ==============================
// STUDENT: CANCEL QUEUE
// ==============================
router.post("/cancel", protect, cancelQueue);


export default router;
