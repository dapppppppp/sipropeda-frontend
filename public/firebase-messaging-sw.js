importScripts(
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAwvQhdnPUifVvaP2MoMWoHENfkTQgHJVM",
  authDomain: "complainhandling.firebaseapp.com",
  projectId: "complainhandling",
  storageBucket: "complainhandling.firebasestorage.app",
  messagingSenderId: "937172717734",
  appId: "1:937172717734:web:ffa78dc0b429d661c5a467",
  measurementId: "G-9W07D8RXHG",
});

const messaging = firebase.messaging();

async function broadcastToClients(data) {
  const clientsList = await globalThis.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const client of clientsList) client.postMessage(data);
}

self.addEventListener("install", () => globalThis.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(globalThis.clients.claim())
);

messaging.onBackgroundMessage(async (payload) => {
  const title =
    payload.notification?.title || payload.data?.title || "Notification";
  const body = payload.notification?.body || payload.data?.body || "";

  const tag = payload.data?.notifTag || `fcm-${Date.now()}`;

  await globalThis.registration.showNotification(title, {
    body,
    icon: "/chm-symbols.png",
    badge: "/chm-symbols.png",
    vibrate: [200, 100, 200],
    tag,
    renotify: false,
    silent: true,
    data: payload.data || {},
  });

  await broadcastToClients({ type: "FCM_MESSAGE", payload });
  await broadcastToClients({ type: "PLAY_SOUND" });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const allClients = await globalThis.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const targetUrl = event.notification.data?.url || "/";
      for (const client of allClients) {
        if ("focus" in client) return client.focus();
      }
      return globalThis.clients.openWindow(targetUrl);
    })()
  );
});
