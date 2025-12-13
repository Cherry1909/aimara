import dotenv from 'dotenv';
import { initializeFirebase } from '../config/firebase.js';

// Load environment variables
dotenv.config();

// Información de las salas (debe coincidir con RoomManager.js)
const ROOMS_DATA = [
  {
    id: 'general',
    name: 'General',
    description: 'Conversaciones generales sobre cultura Aymara',
    icon: '💬',
    order: 1
  },
  {
    id: 'rituales',
    name: 'Rituales y Ceremonias',
    description: 'Discusión sobre prácticas espirituales',
    icon: '🎭',
    order: 2
  },
  {
    id: 'festividades',
    name: 'Festividades',
    description: 'Preguntas sobre fiestas y celebraciones',
    icon: '🎉',
    order: 3
  },
  {
    id: 'idioma',
    name: 'Idioma Aymara',
    description: 'Ayuda con traducción y aprendizaje',
    icon: '📚',
    order: 4
  },
  {
    id: 'tradiciones',
    name: 'Tradiciones',
    description: 'Costumbres, vestimenta, gastronomía',
    icon: '🏛️',
    order: 5
  },
  {
    id: 'soporte',
    name: 'Ayuda/Soporte',
    description: 'Soporte técnico de la plataforma',
    icon: '❓',
    order: 6
  }
];

/**
 * Inicializar salas en Firestore
 */
async function initializeRooms() {
  try {
    console.log('🚀 Iniciando script de inicialización de salas...\n');

    // Conectar a Firebase
    const db = initializeFirebase();
    if (!db) {
      throw new Error('Error al conectar con Firebase');
    }

    console.log('✅ Conexión con Firebase establecida\n');

    const roomsCollection = db.collection('chatRooms');
    let created = 0;
    let updated = 0;
    let skipped = 0;

    // Crear/actualizar cada sala
    for (const roomData of ROOMS_DATA) {
      const roomRef = roomsCollection.doc(roomData.id);
      const roomDoc = await roomRef.get();

      if (!roomDoc.exists) {
        // Crear nueva sala
        await roomRef.set({
          ...roomData,
          messageCount: 0,
          activeUsers: 0,
          lastMessage: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            isActive: true,
            isPublic: true,
            maxUsers: null, // Sin límite
            welcomeMessage: `Bienvenido a ${roomData.name}! ${roomData.description}`
          }
        });

        console.log(`✅ Sala creada: ${roomData.name} (${roomData.id})`);
        created++;
      } else {
        // Actualizar información de la sala (preservar lastMessage y contadores)
        const existingData = roomDoc.data();
        await roomRef.update({
          name: roomData.name,
          description: roomData.description,
          icon: roomData.icon,
          order: roomData.order,
          updatedAt: new Date(),
          // Preservar datos existentes
          messageCount: existingData.messageCount || 0,
          activeUsers: existingData.activeUsers || 0,
          lastMessage: existingData.lastMessage || null,
          metadata: {
            ...existingData.metadata,
            isActive: true,
            isPublic: true
          }
        });

        console.log(`🔄 Sala actualizada: ${roomData.name} (${roomData.id})`);
        updated++;
      }
    }

    console.log('\n┌─────────────────────────────────────────────┐');
    console.log('│         INICIALIZACIÓN COMPLETADA           │');
    console.log('└─────────────────────────────────────────────┘');
    console.log(`\n📊 Resumen:`);
    console.log(`   - Salas creadas: ${created}`);
    console.log(`   - Salas actualizadas: ${updated}`);
    console.log(`   - Total de salas: ${ROOMS_DATA.length}`);
    console.log('\n✅ Script finalizado exitosamente\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la inicialización:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Verificar salas (opcional - para debugging)
async function verifyRooms() {
  try {
    const db = initializeFirebase();
    const roomsCollection = db.collection('chatRooms');
    const snapshot = await roomsCollection.get();

    console.log('\n📋 Salas en Firestore:\n');
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   ${data.icon} ${data.name} (${doc.id})`);
      console.log(`      - Descripción: ${data.description}`);
      console.log(`      - Mensajes: ${data.messageCount || 0}`);
      console.log(`      - Usuarios activos: ${data.activeUsers || 0}`);
      console.log();
    });
  } catch (error) {
    console.error('Error al verificar salas:', error);
  }
}

// Ejecutar script
const args = process.argv.slice(2);
if (args.includes('--verify')) {
  verifyRooms().then(() => process.exit(0));
} else {
  initializeRooms();
}
