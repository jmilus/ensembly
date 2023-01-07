// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithRedirect,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD_iD7sxHGw7F7qwmlrPcWliYL_e8CQlrs",
  authDomain: "ensemblydev.firebaseapp.com",
  projectId: "ensemblydev",
  storageBucket: "ensemblydev.appspot.com",
  messagingSenderId: "881159610163",
  appId: "1:881159610163:web:93b52268e9fd2b1f5e6846",
  measurementId: "G-MPWX3G4LV3"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});

export const auth = getAuth();
export const signInWithGooglePopup = () => signInWithPopup(auth, provider);