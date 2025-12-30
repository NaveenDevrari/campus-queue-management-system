import express from "express";
import {
  guestJoinQueue,
  guestCancelTicket,
  guestRestoreTicket,
} from "../controllers/guestController.js";

const router = express.Router();

// Guest join queue
router.post("/join", guestJoinQueue);

// Guest cancel ticket
router.post("/cancel", guestCancelTicket);

// Guest restore ticket
router.get("/restore", guestRestoreTicket);

export default router;
