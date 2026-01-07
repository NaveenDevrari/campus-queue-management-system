/* =========================
   SERVICE WORKER
   Handles background push notifications
========================= */

self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activated");
  self.clients.claim();
});

/* =========================
   PUSH EVENT
========================= */
self.addEventListener("push", (event) => {
  let data = {};

  if (event.data) {
    data = event.data.json();
  }

  const title = data.title || "Campus Queue Alert";
  const options = {
    body: data.body || "It's your turn!",
    icon: "/logo.png", // optional
    badge: "/logo.png",
    vibrate: [300, 150, 300, 150, 300],
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/* =========================
   NOTIFICATION CLICK
========================= */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
