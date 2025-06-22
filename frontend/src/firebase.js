import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let firebaseApp = null;
let auth = null;
let db = null;

export async function initFirebase() {
  if (!firebaseApp) {
    const response = await fetch('/firebase-config.json');
    const config = await response.json();
    firebaseApp = initializeApp(config);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  }
  return { auth, db };
} 