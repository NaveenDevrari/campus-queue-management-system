import express from "express";
import { getCurrentServing } from "../controllers/queueController.js";
import { getCrowdStatus } from "../controllers/queueController.js";

const router = express.Router();

router.get("/current-serving/:departmentId", getCurrentServing);
router.get("/crowd-status", getCrowdStatus);

export default router;
