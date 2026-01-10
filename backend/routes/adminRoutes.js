import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createDepartment,
  assignStaffToDepartment,
} from "../controllers/adminController.js";
import { getDepartments } from "../controllers/adminController.js";
import { getStaffUsers } from "../controllers/adminController.js";
import { getAllFeedback } from "../controllers/adminController.js";



const router = express.Router();

router.get("/departments", protect, getDepartments);
router.get("/staff", protect, getStaffUsers);
// ==============================
// ADMIN: VIEW STUDENT FEEDBACK
// ==============================
router.get("/feedback", protect, getAllFeedback);


// Admin: create department
router.post("/departments", protect, createDepartment);

// Admin: assign staff to department
router.post("/assign-staff", protect, assignStaffToDepartment);

export default router;
