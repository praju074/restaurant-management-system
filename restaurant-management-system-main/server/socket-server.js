require("dotenv").config({
  path: ".env.local",
});

const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
const webpush = require("web-push");

// ======================================================
// CONFIGURATION
// ======================================================

const PORT = 3001;

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:admin@veranda.com";

// ======================================================
// CHECK VAPID KEYS
// ======================================================

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error("");
  console.error("❌ VAPID keys are missing.");
  console.error("");
  console.error("Make sure your .env.local contains:");
  console.error("");
  console.error("VAPID_PUBLIC_KEY=...");
  console.error("VAPID_PRIVATE_KEY=...");
  console.error("");
  process.exit(1);
}

// ======================================================
// WEB PUSH CONFIGURATION
// ======================================================

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

console.log("✅ Web Push VAPID configuration loaded.");

// ======================================================
// SOCKET.IO SERVER
// ======================================================

const io = new Server(PORT, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

console.log(`🚀 Socket.IO server running on port ${PORT}`);

// ======================================================
// PUSH SUBSCRIPTION STORAGE
// ======================================================

const subscriptionsFile = path.join(
  __dirname,
  "push-subscriptions.json"
);

function loadSubscriptions() {
  try {
    if (!fs.existsSync(subscriptionsFile)) {
      fs.writeFileSync(
        subscriptionsFile,
        JSON.stringify([], null, 2)
      );
      return [];
    }

    const data = fs.readFileSync(
      subscriptionsFile,
      "utf8"
    );

    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error(
      "❌ Could not load push subscriptions:",
      error.message
    );

    return [];
  }
}

function saveSubscriptions(subscriptions) {
  try {
    fs.writeFileSync(
      subscriptionsFile,
      JSON.stringify(subscriptions, null, 2)
    );
  } catch (error) {
    console.error(
      "❌ Could not save push subscriptions:",
      error.message
    );
  }
}

let pushSubscriptions = loadSubscriptions();

console.log(
  `📱 Loaded ${pushSubscriptions.length} saved push subscription(s).`
);

// ======================================================
// SAVE PUSH SUBSCRIPTION
// ======================================================

function savePushSubscription(subscription) {
  if (!subscription || !subscription.endpoint) {
    console.error("❌ Invalid push subscription.");
    return false;
  }

  const alreadyExists = pushSubscriptions.some(
    (savedSubscription) =>
      savedSubscription.endpoint === subscription.endpoint
  );

  if (!alreadyExists) {
    pushSubscriptions.push(subscription);
    saveSubscriptions(pushSubscriptions);

    console.log("✅ New push subscription saved.");
  } else {
    console.log("ℹ️ Push subscription already exists.");
  }

  console.log(
    `📱 Total push subscriptions: ${pushSubscriptions.length}`
  );

  return true;
}

// ======================================================
// REMOVE PUSH SUBSCRIPTION
// ======================================================

function removePushSubscription(endpoint) {
  const oldLength = pushSubscriptions.length;

  pushSubscriptions = pushSubscriptions.filter(
    (subscription) =>
      subscription.endpoint !== endpoint
  );

  if (pushSubscriptions.length !== oldLength) {
    saveSubscriptions(pushSubscriptions);

    console.log(
      "🗑 Expired push subscription removed."
    );
  }
}

// ======================================================
// FOOD SUMMARY
// ======================================================

function getFoodSummary(order) {
  if (!Array.isArray(order?.items) || order.items.length === 0) {
    return "a new order";
  }

  return order.items
    .map((item) => {
      const name =
        item?.name ||
        item?.description ||
        "Food item";

      const quantity =
        Number(item?.quantity) || 1;

      return `${name} ×${quantity}`;
    })
    .join(", ");
}

// ======================================================
// CUSTOMER NAME
// ======================================================

function getCustomerName(order) {
  return (
    order?.customerName ||
    order?.customer ||
    order?.guestName ||
    order?.name ||
    "Walk-in guest"
  );
}

// ======================================================
// SEND WEB PUSH NOTIFICATION
// ======================================================

async function sendPushNotification(order) {
  if (pushSubscriptions.length === 0) {
    console.log(
      "⚠️ No saved push subscriptions."
    );

    return;
  }

  const customerName = getCustomerName(order);

  const foodSummary = getFoodSummary(order);

  const orderId =
    order?.orderId ||
    order?.id ||
    "New Order";

  const table =
    order?.tableNumber ||
    order?.table ||
    "N/A";

  const total =
    Number(order?.total) || 0;

  const payload = JSON.stringify({
    title: "🔔 New Order Received!",
    body:
      `${customerName} ordered ${foodSummary} ` +
      `• Table ${table} • ₹${total}`,

    orderId,
    customerName,
    table,
    total,

    items: Array.isArray(order?.items)
      ? order.items
      : [],

    url: "/admin",
  });

  console.log(
    `📤 Sending Web Push to ${pushSubscriptions.length} subscription(s)...`
  );

  const subscriptionsCopy = [
    ...pushSubscriptions,
  ];

  for (const subscription of subscriptionsCopy) {
    try {
      await webpush.sendNotification(
        subscription,
        payload,
        {
          TTL: 60,
        }
      );

      console.log(
        "✅ Push notification sent successfully."
      );
    } catch (error) {
      console.error(
        "❌ Push notification failed:",
        error.statusCode,
        error.body || error.message
      );

      // 404 and 410 mean the subscription is no longer valid.
      if (
        error.statusCode === 404 ||
        error.statusCode === 410
      ) {
        removePushSubscription(
          subscription.endpoint
        );
      }
    }
  }
}

// ======================================================
// SOCKET CONNECTION
// ======================================================

io.on("connection", (socket) => {
  console.log(
    "🔌 Client connected:",
    socket.id
  );

  // ====================================================
  // ADMIN JOINS ROOM
  // ====================================================

  socket.on("join-admin", () => {
    socket.join("admins");

    console.log(
      `👨‍💼 Admin joined notification room: ${socket.id}`
    );
  });

  // ====================================================
  // ADMIN SUBSCRIBES TO WEB PUSH
  // ====================================================

  socket.on(
    "subscribe-push",
    (subscription) => {
      console.log(
        "📱 Push subscription received."
      );

      savePushSubscription(subscription);
    }
  );

  // ====================================================
  // CUSTOMER PLACES NEW ORDER
  // ====================================================

  socket.on(
    "new-order",
    async (order) => {
      console.log("");
      console.log(
        "======================================"
      );
      console.log(
        "🍽 NEW ORDER RECEIVED"
      );
      console.log(
        "======================================"
      );

      console.log(
        JSON.stringify(order, null, 2)
      );

      // -----------------------------------------------
      // LIVE ADMIN DASHBOARD
      // -----------------------------------------------

      io.to("admins").emit(
        "order-notification",
        order
      );

      // Compatibility with old admin code
      io.to("admins").emit(
        "new-order",
        order
      );

      // -----------------------------------------------
      // WEB PUSH
      // -----------------------------------------------

      await sendPushNotification(order);
    }
  );

  // ====================================================
  // DISCONNECT
  // ====================================================

  socket.on(
    "disconnect",
    (reason) => {
      console.log(
        `🔌 Client disconnected: ${socket.id} | Reason: ${reason}`
      );

      // IMPORTANT:
      // We DO NOT delete the push subscription here.
      //
      // This allows push notifications to continue
      // even after the admin closes the browser tab.
    }
  );
});