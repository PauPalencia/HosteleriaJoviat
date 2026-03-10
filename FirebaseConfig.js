// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgOw1B5xVxZ5yPyCoOywpTf2UWvz7Q9_o",
  authDomain: "db-hosteleria-joviat-app-clase.firebaseapp.com",
  projectId: "db-hosteleria-joviat-app-clase",
  storageBucket: "db-hosteleria-joviat-app-clase.firebasestorage.app",
  messagingSenderId: "32496937327",
  appId: "1:32496937327:web:00c47680f88586b074609a",
  measurementId: "G-2YL4BLQRV5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };  