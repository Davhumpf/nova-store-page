// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDR1pOf6Vmqh9dw6X14vwNo2OytqvRHLng",
  authDomain: "nova-store-d60a4.firebaseapp.com",
  projectId: "nova-store-d60a4",
  storageBucket: "nova-store-d60a4.appspot.com",
  messagingSenderId: "566700538652",
  appId: "1:566700538652:web:78ed800d0d7cf6d79618d9",
  measurementId: "G-WMYGVN1PY8"
};

// Inicializar la app de Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios para usar en toda la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
