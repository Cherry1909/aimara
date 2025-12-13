import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

export function initializeFirebase() {
  if (db) {
    return db;
  }

  try {
    // Load service account credentials
    const credentialsPath = join(__dirname, process.env.FIREBASE_CREDENTIALS_PATH);
    const serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf8'));

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    db = admin.firestore();
    console.log('✅ Firebase initialized successfully');

    return db;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    throw error;
  }
}

export function getFirestore() {
  if (!db) {
    return initializeFirebase();
  }
  return db;
}

export { admin };
