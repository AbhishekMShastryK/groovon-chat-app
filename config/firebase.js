import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD00pumhbiFR0pQBmWHcsgXtjTSKLndRnM',
  authDomain: 'group-chat-3da63.firebaseapp.com',
  projectId: 'group-chat-3da63',
  storageBucket: 'group-chat-3da63.firebasestorage.app',
  messagingSenderId: '721528240693',
  appId: '1:721528240693:web:c6f9f4bfb19e0b35630f7c',
  measurementId: 'G-SYB24TMBQH',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
