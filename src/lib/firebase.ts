import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging, isSupported } from "firebase/messaging";
import { supabase } from "@/integrations/supabase/client";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let cachedConfig: FirebaseConfig | null = null;

// Fetch Firebase config from backend
async function fetchFirebaseConfig(): Promise<FirebaseConfig | null> {
  if (cachedConfig) return cachedConfig;

  try {
    const { data, error } = await supabase.functions.invoke<FirebaseConfig>("get-firebase-config");
    
    if (error) {
      console.error("Failed to fetch Firebase config:", error.message);
      return null;
    }

    if (!data?.apiKey || !data?.projectId || !data?.messagingSenderId) {
      console.warn("Firebase configuration is incomplete or missing — push notifications disabled");
      return null;
    }

    cachedConfig = data;
    console.log("Firebase config fetched successfully");
    return data;
  } catch (error) {
    console.error("Error fetching Firebase config:", error);
    return null;
  }
}

export async function initializeFirebase(): Promise<FirebaseApp | null> {
  try {
    // Check if Firebase Messaging is supported
    const supported = await isSupported();
    if (!supported) {
      console.warn("Firebase Messaging is not supported in this browser");
      return null;
    }

    // Fetch config from backend
    const config = await fetchFirebaseConfig();
    if (!config) {
      return null;
    }

    if (getApps().length === 0) {
      app = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });
    } else {
      app = getApps()[0];
    }

    return app;
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    return null;
  }
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  try {
    if (messaging) return messaging;

    const firebaseApp = await initializeFirebase();
    if (!firebaseApp) return null;

    messaging = getMessaging(firebaseApp);
    return messaging;
  } catch (error) {
    console.error("Failed to get Firebase Messaging:", error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<"granted" | "denied" | "default"> {
  try {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return "denied";
    }

    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Failed to request notification permission:", error);
    return "denied";
  }
}

// Register service worker with Firebase config
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers not supported");
    return null;
  }

  try {
    const config = await fetchFirebaseConfig();
    if (!config) {
      console.warn("Cannot register SW without Firebase config");
      return null;
    }

    // Check if already registered
    const existingReg = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
    if (existingReg) {
      // Send config to existing SW
      if (existingReg.active) {
        existingReg.active.postMessage({
          type: "FIREBASE_CONFIG",
          config: {
            apiKey: config.apiKey,
            authDomain: config.authDomain,
            projectId: config.projectId,
            storageBucket: config.storageBucket,
            messagingSenderId: config.messagingSenderId,
            appId: config.appId,
          },
        });
      }
      return existingReg;
    }

    // Register new service worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });

    // Wait for SW to be ready — race against a 5 s timeout so a failed or
    // slow-activating SW never blocks getFCMToken() indefinitely.
    await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<void>(resolve => setTimeout(resolve, 5_000)),
    ]);

    // Send config to SW
    if (registration.active) {
      registration.active.postMessage({
        type: "FIREBASE_CONFIG",
        config: {
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId,
        },
      });
    }

    console.log("Service worker registered successfully");
    return registration;
  } catch (error) {
    console.error("Failed to register service worker:", error);
    return null;
  }
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const messagingInstance = await getFirebaseMessaging();
    if (!messagingInstance) {
      console.warn("Firebase Messaging not available");
      return null;
    }

    // Request permission first
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    // Register service worker
    const swRegistration = await registerServiceWorker();
    
    // Get config for VAPID key
    const config = await fetchFirebaseConfig();
    if (!config?.vapidKey) {
      console.warn("VAPID key not available");
      return null;
    }

    // Get the token with the service worker registration
    const tokenOptions: { vapidKey: string; serviceWorkerRegistration?: ServiceWorkerRegistration } = {
      vapidKey: config.vapidKey,
    };

    if (swRegistration) {
      tokenOptions.serviceWorkerRegistration = swRegistration;
    }

    const token = await getToken(messagingInstance, tokenOptions);

    if (token) {
      console.log("FCM Token obtained successfully");
      return token;
    } else {
      console.warn("No FCM token available");
      return null;
    }
  } catch (error) {
    console.error("Failed to get FCM token:", error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: unknown) => void): (() => void) | null {
  try {
    if (!messaging) {
      console.warn("Messaging not initialized");
      return null;
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      callback(payload);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Failed to setup foreground message handler:", error);
    return null;
  }
}

// Check if notifications are supported
export function isNotificationsSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

// Get current notification permission status
export function getNotificationPermission(): NotificationPermission | null {
  if (!("Notification" in window)) return null;
  return Notification.permission;
}
