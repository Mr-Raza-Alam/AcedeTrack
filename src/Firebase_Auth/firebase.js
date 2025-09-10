
// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDX4qIbzp3geQq6D_HB_SERRnIpTpHgsRc",
  authDomain: "acadetrack-f1849.firebaseapp.com",
  projectId: "acadetrack-f1849",
  storageBucket: "acadetrack-f1849.firebasestorage.app",
  messagingSenderId: "490463842524",
  appId: "1:490463842524:web:ef34905998fac332df6419",
  measurementId: "G-C5J77SCFRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
