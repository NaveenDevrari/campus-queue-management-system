import express from "express";
import { getCurrentServing } from "../controllers/queueController.js";

const router = express.Router();

router.get("/current-serving/:departmentId", getCurrentServing);

export default router;
