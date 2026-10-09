import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Web App configuration for the dedicated Maasin Dental Spa project.
// These values are public identifiers; Firestore Security Rules protect the data.
const config: FirebaseOptions = {
  apiKey: 'AIzaSyCYReglMApNISJMDQyftjN0XJfotPgzmno',
  authDomain: 'spa-booking-a4fb7.firebaseapp.com',
  projectId: 'spa-booking-a4fb7',
  storageBucket: 'spa-booking-a4fb7.firebasestorage.app',
  messagingSenderId: '1022117536494',
  appId: '1:1022117536494:web:f6d538ba738ea2676d89ff',
};

export const firebaseConfigured = true;
const app = getApps().length ? getApp() : initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
