import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
const firebaseConfig = {
  apiKey: "AIzaSyB4PcU7Izq2g3OIM1swhHZt3TkoQcXtlIs",
  authDomain: "ecom-1dfe2.firebaseapp.com",
  projectId: "ecom-1dfe2",
  storageBucket: "ecom-1dfe2.firebasestorage.app",
  messagingSenderId: "517909678281",
  appId: "1:1054402435712:web:59476ea9d516f7344e6465",
  measurementId: "G-1NN5B7ZBZK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
export default firebase;
export const authentication = getAuth(initializeApp(firebaseConfig))