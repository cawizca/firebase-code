// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, type Firestore } from "firebase/firestore";
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
let db: Firestore;
let dbInstancePromise: Promise<Firestore>;


function getDbInstance() {
    if (db) {
        return Promise.resolve(db);
    }
    if (!dbInstancePromise) {
        dbInstancePromise = new Promise((resolve, reject) => {
            try {
                const firestore = getFirestore(app);
                enableIndexedDbPersistence(firestore)
                    .then(() => {
                        db = firestore;
                        resolve(db);
                    })
                    .catch((err) => {
                        if (err.code == 'failed-precondition') {
                            console.log('Firestore persistence failed: multiple tabs open.');
                        } else if (err.code == 'unimplemented') {
                            console.log('Firestore persistence not available in this browser.');
                        }
                        // In case of error, resolve with the regular firestore instance
                        db = firestore;
                        resolve(db);
                    });
            } catch (e) {
                reject(e);
            }
        });
    }

    return dbInstancePromise;
}


export { app, getDbInstance };