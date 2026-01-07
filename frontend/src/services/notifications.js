import api from "./api";

/* =========================
   PUBLIC VAPID KEY
========================= */
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/* =========================
   REGISTER SERVICE WORKER
========================= */
export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker not supported");
  }

  return await navigator.serviceWorker.register("/service-worker.js");
};

/* =========================
   REQUEST PERMISSION
========================= */
export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission denied");
  }
};

/* =========================
   SUBSCRIBE TO PUSH
========================= */
export const subscribeToPush = async () => {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // Save subscription to backend
  await api.post("/notifications/subscribe", subscription);

  return subscription;
};

/* =========================
   UTILITY
========================= */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
