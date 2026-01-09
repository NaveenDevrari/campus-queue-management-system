import webpush from "web-push";
import PushSubscription from "../models/PushSubscription.js";

/* ==============================
   INITIALIZE WEB PUSH
================================ */
export const initWebPush = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.error("❌ VAPID keys missing");
    return; // ⛔ DO NOT CRASH SERVER
  }

  webpush.setVapidDetails(
    "mailto:admin@campusqueue.com",
    publicKey,
    privateKey
  );

  console.log("✅ Web Push initialized");
};

/* ==============================
   SEND PUSH TO USER
================================ */
export const sendPushToUser = async (userId, payload) => {
  try {
    const record = await PushSubscription.findOne({ userId });

    if (!record || !record.subscription) {
      console.log("⚠️ No push subscription for user:", userId);
      return;
    }

    await webpush.sendNotification(
      record.subscription,
      JSON.stringify(payload)
    );

    console.log("🔔 Push sent to user:", userId);
  } catch (error) {
    console.error("❌ Push failed:", error.message);
  }
};
