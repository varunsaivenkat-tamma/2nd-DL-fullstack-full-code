import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore import

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// AUTH
export const auth = getAuth(app);

// FIRESTORE
export const db = getFirestore(app);

// ⭐ CUSTOM RESET PASSWORD REDIRECT
export const actionCodeSettings = {
  url: "http://localhost:5173/reset-password",
  handleCodeInApp: true,
};

export default app;
