// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtS8TJ7G_B6azYqel9MhTlsXY6koWDunA",
  authDomain: "kilobyte-ab90b.firebaseapp.com",
  projectId: "kilobyte-ab90b",
  storageBucket: "kilobyte-ab90b.firebasestorage.app",
  messagingSenderId: "1055298146479",
  appId: "1:1055298146479:web:6554dab13aba542348845a",
  measurementId: "G-EQZF1Z4D1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

