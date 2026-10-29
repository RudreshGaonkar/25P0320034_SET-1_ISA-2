// firebaseConfig.js
// Firebase configuration and initialization for Auth and Firestore

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  getReactNativePersistence,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Your web app's Firebase configuration from firebase.txt
const firebaseConfig = {
  apiKey: "AIzaSyC9kYudviKrle0agqBms9ReE10GrxvUIBw",
  authDomain: "mytasks-ab43b.firebaseapp.com",
  projectId: "mytasks-ab43b",
  storageBucket: "mytasks-ab43b.firebasestorage.app",
  messagingSenderId: "329332952287",
  appId: "1:329332952287:web:6d98646f3e0be0b0902d6a"
};

// Initialize Firebase App (prevent re-initializing)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Cross-platform Auth initialization (Web vs Native iOS/Android)
let authInstance;
try {
  if (Platform.OS === 'web') {
    // For Web environment, use standard getAuth with browser persistence
    authInstance = getAuth(app);
  } else {
    // For Native React Native (iOS / Android), use AsyncStorage persistence
    authInstance = initializeAuth(app, {
      persistence: typeof getReactNativePersistence === 'function'
        ? getReactNativePersistence(ReactNativeAsyncStorage)
        : undefined,
    });
  }
} catch (error) {
  // If already initialized, fetch the existing auth instance
  authInstance = getAuth(app);
}

export const auth = authInstance;

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;
