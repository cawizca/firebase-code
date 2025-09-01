// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "anonyconnect-jcajk",
  "appId": "1:418045269242:web:c3144a12959ce8028a2543",
  "storageBucket": "anonyconnect-jcajk.firebasestorage.app",
  "apiKey": "AIzaSyDXdmLsYIZnvwJ0j1MlpQ4umM0d4nNSvx0",
  "authDomain": "anonyconnect-jcajk.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "418045269242"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      console.log('Firestore persistence failed: multiple tabs open.');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
      console.log('Firestore persistence not available in this browser.');
    }
  });


export { app, db };
