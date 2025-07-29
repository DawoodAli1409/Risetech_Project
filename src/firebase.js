import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC3AaqtfxinnRjk7FfmBThxjAQv2m3YJbI",
  authDomain: "internship-2025-465209.firebaseapp.com",
  projectId: "internship-2025-465209",
  storageBucket: "internship-2025-465209.firebasestorage.app",
  messagingSenderId: "311351364799",
  appId: "1:311351364799:web:c5284ce516b255ef018a0a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app, 'dawood' );
export const storage = getStorage(app);

export default app;
