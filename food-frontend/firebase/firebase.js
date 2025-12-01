// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "food-delivery-app-58848.firebaseapp.com",
  projectId: "food-delivery-app-58848",
  storageBucket: "food-delivery-app-58848.firebasestorage.app",
  messagingSenderId: "1034278460416",
  appId: "1:1034278460416:web:9676e19d3e25cbe4428ce5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth= getAuth(app)

export { app, auth }