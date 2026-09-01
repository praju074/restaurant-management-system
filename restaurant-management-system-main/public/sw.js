self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push received");

  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error("[Service Worker] Could not parse push data:", error);

    data = {
      title: "🔔 New Order Received!",
      body: "A new order has been placed.",
    };
  }

  const title = data.title || "🔔 New Order Received!";

  const options = {
    body:
      data.body ||
      "A new order has been placed.",

    icon:
      data.icon ||
      "/icons/icon-192.png",

    badge:
      data.badge ||
      "/icons/icon-192.png",

    tag:
      data.tag ||
      `veranda-order-${data.orderId || Date.now()}`,

    requireInteraction: true,

    renotify: true,

    data: {
      url: data.url || "/admin",
      orderId: data.orderId || "",
      customerName: data.customerName || "",
      table: data.table || "",
      total: data.total || 0,
      items: data.items || [],
    },

    vibrate: [300, 100, 300, 100, 500],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});


self.addEventListener("notificationclick", function (event) {
  console.log("[Service Worker] Notification clicked");

  event.notification.close();

  const notificationData =
    event.notification.data || {};

  const url =
    notificationData.url || "/admin";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then(function (clientList) {

      // If admin page is already open, focus it.
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();

          if ("navigate" in client) {
            return client.navigate(url);
          }

          return client;
        }
      }

      // Otherwise open admin page.
      if (clients.openWindow) {
        return clients.openWindow(url);
      }

      return null;
    })
  );
});


self.addEventListener("install", function () {
  console.log("[Service Worker] Installed");

  self.skipWaiting();
});


self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activated");

  event.waitUntil(
    self.clients.claim()
  );
});