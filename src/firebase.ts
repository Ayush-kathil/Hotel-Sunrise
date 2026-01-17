import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// REPLACE THESE WITH YOUR REAL KEYS FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "hotel-sunrise.firebaseapp.com",
  projectId: "hotel-sunrise",
  storageBucket: "hotel-sunrise.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc12345"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);