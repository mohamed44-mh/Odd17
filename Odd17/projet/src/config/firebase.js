import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Configuration Firebase EventPartner
const firebaseConfig = {
  apiKey: "AIzaSyCnqfASIpdjG0OrBcPi9k3WaF04cQuxd2c",
  authDomain: "eventpatner-501dc.firebaseapp.com",
  projectId: "eventpatner-501dc",
  storageBucket: "eventpatner-501dc.firebasestorage.app",
  messagingSenderId: "477776321060",
  appId: "1:477776321060:web:254eb92f6ff80f48b396b1",
  measurementId: "G-VPD11JE2VM"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Instances des services Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics sécurisé pour environnement web
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export default app;

