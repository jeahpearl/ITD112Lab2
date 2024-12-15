import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCyMZ79p-fMIefhx5w3ZnLcO8DutqMMaBA",
  authDomain: "itd112-daligdiglab2.firebaseapp.com",
  projectId: "itd112-daligdiglab2",
  storageBucket: "itd112-daligdiglab2.firebasestorage.app",
  messagingSenderId: "719434569673",
  appId: "1:719434569673:web:c78b86e0eb04ceb7f8ba18",
  measurementId: "G-PQGPFMTME8"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line
const analytics = getAnalytics(app);
// Initialize Firestore
const db = getFirestore(app);

export { db };