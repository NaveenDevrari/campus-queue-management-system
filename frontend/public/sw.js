/* ================================
   SERVICE WORKER – CAMPUS QUEUE
================================ */

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 🚫 DO NOT INTERCEPT API CALLS
  if (url.pathname.startsWith("/api")) {
    return;
  }

  // 🚫 DO NOT INTERCEPT PAGE NAVIGATION (THIS FIXES UI)
  if (event.request.mode === "navigate") {
    return;
  }
});

self.addEventListener("install", () => {
  console.log("🟢 Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("🔵 Service Worker activated");
  event.waitUntil(self.clients.claim());
});

/* ================================
   PUSH NOTIFICATION HANDLER
================================ */
self.addEventListener("push", (event) => {
  let data = {};

  if (event.data) {
    data = event.data.json();
  }

  const title = data.title || "Queue Update";
  const options = {
    body: data.body || "Your ticket update",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [300, 150, 300, 150, 300],
    data: data.url || "/",
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/* ================================
   NOTIFICATION CLICK
================================ */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data || "/");
    })
  );
});
