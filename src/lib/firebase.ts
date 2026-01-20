import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAQt9a5l9m4iYyyBT-Zf8V53cJX-lYgqEs",
  authDomain: "baby-led-weaning-f6ddf.firebaseapp.com",
  projectId: "baby-led-weaning-f6ddf",
  storageBucket: "baby-led-weaning-f6ddf.firebasestorage.app",
  messagingSenderId: "463655586175",
  appId: "1:463655586175:web:badb5bce5c880d6a70724a",
  measurementId: "G-9D19S2S0Y6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
