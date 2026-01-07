import express from "express";
import PushSubscription from "../models/PushSubscription.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/subscribe", protect, async (req, res) => {
  try {
    const role = req.user?.role || "guest";
    const userId = req.user?.id || req.headers["x-guest-token"];

    if (!userId) {
      return res.status(400).json({ message: "User not identified" });
    }

    await PushSubscription.findOneAndUpdate(
      { userId },
      {
        userId,
        role,
        subscription: req.body,
      },
      { upsert: true }
    );

    res.json({ message: "Push subscription saved" });
  } catch (err) {
    res.status(500).json({ message: "Subscription failed" });
  }
});

export default router;
