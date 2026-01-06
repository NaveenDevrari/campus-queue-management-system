import express from "express";
import {
  guestJoinQueue,
  guestCancelTicket,
  guestRestoreTicket,
  guestEntryViaQr,
  guestJoinViaSession,
} from "../controllers/guestController.js";

const router = express.Router();

// Guest join queue
router.post("/join", guestJoinQueue);

// Guest cancel ticket
router.post("/cancel", guestCancelTicket);

// Guest restore ticket
router.get("/restore", guestRestoreTicket);
// Guest entry via QR
router.get("/entry/:qrId", guestEntryViaQr);
// Guest join via session token
router.post("/join/:sessionToken", guestJoinViaSession);


export default router;
