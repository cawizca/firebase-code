
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
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
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db: Firestore = getFirestore(app);

// We are not using a promise-based approach anymore to avoid race conditions.
// Persistence is now enabled directly on the client-side where it's needed.
async function getDbInstance(): Promise<Firestore> {
    return Promise.resolve(db);
}


export { app, getDbInstance };
