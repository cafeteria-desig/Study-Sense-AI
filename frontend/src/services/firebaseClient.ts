import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { getDatabase, ref, push, set } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBsrLfUyZgjmdf1MBX-YZfZc3gb1rgiNrQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ibmproject-b0a1d.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://ibmproject-b0a1d-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ibmproject-b0a1d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ibmproject-b0a1d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "344889524472",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:344889524472:web:7991c57328fddce85ebb0d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YRC2W2FMDV"
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig)

// Export configured services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const rtdb = getDatabase(app)

// Database helpers for syncing user study data
export async function syncUserData(userId: string, category: string, data: any) {
  try {
    // 1. Sync to Firebase Realtime Database
    const userRef = ref(rtdb, `users/${userId}/${category}`)
    const newChildRef = push(userRef)
    await set(newChildRef, {
      ...data,
      timestamp: new Date().toISOString()
    })

    // 2. Sync to Firebase Firestore
    await addDoc(collection(db, category), {
      userId,
      ...data,
      createdAt: new Date().toISOString()
    })
    return true
  } catch (err) {
    console.warn(`[Firebase DB Sync] Note: Database sync for ${category}:`, err)
    return false
  }
}

export default app
