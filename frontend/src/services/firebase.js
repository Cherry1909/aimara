import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore'

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Exportar servicios
export const db = getFirestore(app)

// Helper para obtener un story
export const getStory = async (storyId) => {
  try {
    const docRef = doc(db, 'stories', storyId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      }
    } else {
      return null
    }
  } catch (error) {
    console.error('Error getting story:', error)
    throw error
  }
}

// Helper para listar stories
export const listStories = async (options = {}) => {
  try {
    const {
      pageSize = 20,
      status = 'published',
      category = null
    } = options

    let q = query(
      collection(db, 'stories'),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    )

    if (category) {
      q = query(
        collection(db, 'stories'),
        where('status', '==', status),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      )
    }

    const querySnapshot = await getDocs(q)
    const stories = []

    querySnapshot.forEach((doc) => {
      stories.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return stories
  } catch (error) {
    console.error('Error listing stories:', error)
    throw error
  }
}

export default app
