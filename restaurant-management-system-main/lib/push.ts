import { socket } from "./socket";

function urlBase64ToUint8Array(
  base64String: string
): Uint8Array {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (
    base64String +
    padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const outputArray = new Uint8Array(
    rawData.length
  );

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function registerPushNotifications() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    console.error(
      "❌ Service workers are not supported."
    );
    return null;
  }

  if (!("PushManager" in window)) {
    console.error(
      "❌ Push notifications are not supported."
    );
    return null;
  }

  if (!("Notification" in window)) {
    console.error(
      "❌ Browser notifications are not supported."
    );
    return null;
  }

  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    console.error(
      "❌ NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing."
    );
    return null;
  }

  // Ask notification permission
  const permission =
    await Notification.requestPermission();

  console.log(
    "Notification permission:",
    permission
  );

  if (permission !== "granted") {
    console.error(
      "❌ Notification permission was not granted."
    );
    return null;
  }

  // Register service worker
  const registration =
    await navigator.serviceWorker.register(
      "/sw.js"
    );

  console.log(
    "✅ Service worker registered:",
    registration
  );

  // Wait until service worker is ready
  await navigator.serviceWorker.ready;

  let subscription =
    await registration.pushManager.getSubscription();

  // Create subscription if one doesn't exist
  if (!subscription) {
    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,

        applicationServerKey:
          urlBase64ToUint8Array(publicKey),
      });
  }

  console.log(
    "✅ Push subscription created:"
  );

  console.log(
    JSON.stringify(subscription)
  );

  // Connect socket if necessary
  if (!socket.connected) {
    socket.connect();
  }

  // Send subscription to Node server
  socket.emit(
    "subscribe-push",
    subscription.toJSON()
  );

  console.log(
    "✅ Push subscription sent to server."
  );

  return subscription;
}