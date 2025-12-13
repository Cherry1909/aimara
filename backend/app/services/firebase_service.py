import firebase_admin
from firebase_admin import credentials, firestore, storage
from app.core.config import settings
from typing import Optional, List, Dict, Any
from datetime import datetime
import geohash2

class FirebaseService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        # Inicializar Firebase Admin SDK
        try:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred, {
                'storageBucket': settings.FIREBASE_STORAGE_BUCKET
            })
            self.db = firestore.client()
            self.bucket = storage.bucket()
            self._initialized = True
        except Exception as e:
            print(f"Error inicializando Firebase: {e}")
            raise

    # === FIRESTORE OPERATIONS ===

    async def create_story(self, story_data: Dict[str, Any]) -> str:
        """Crear un nuevo relato en Firestore"""
        try:
            # Generar geohash para búsquedas espaciales
            if 'location' in story_data:
                lat = story_data['location']['latitude']
                lon = story_data['location']['longitude']
                story_data['location']['geohash'] = geohash2.encode(lat, lon, precision=8)

            # Agregar timestamps
            story_data['createdAt'] = firestore.SERVER_TIMESTAMP
            story_data['updatedAt'] = firestore.SERVER_TIMESTAMP

            # Crear documento
            doc_ref = self.db.collection('stories').document()
            doc_ref.set(story_data)

            return doc_ref.id
        except Exception as e:
            print(f"Error creando story: {e}")
            raise

    async def get_story(self, story_id: str) -> Optional[Dict[str, Any]]:
        """Obtener un relato por ID"""
        try:
            doc = self.db.collection('stories').document(story_id).get()
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            return None
        except Exception as e:
            print(f"Error obteniendo story: {e}")
            raise

    async def update_story(self, story_id: str, update_data: Dict[str, Any]) -> bool:
        """Actualizar un relato"""
        try:
            update_data['updatedAt'] = firestore.SERVER_TIMESTAMP
            self.db.collection('stories').document(story_id).update(update_data)
            return True
        except Exception as e:
            print(f"Error actualizando story: {e}")
            return False

    async def delete_story(self, story_id: str) -> bool:
        """Eliminar un relato (soft delete)"""
        try:
            self.db.collection('stories').document(story_id).update({
                'status': 'archived',
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            print(f"Error eliminando story: {e}")
            return False

    async def list_stories(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """Listar relatos con paginación y filtros"""
        try:
            query = self.db.collection('stories')

            # Aplicar filtros
            if status:
                query = query.where('status', '==', status)
            if category:
                query = query.where('category', '==', category)

            # Ordenar por fecha de creación (más recientes primero)
            query = query.order_by('createdAt', direction=firestore.Query.DESCENDING)

            # Contar total (aproximado)
            total_docs = query.stream()
            total = sum(1 for _ in total_docs)

            # Paginación
            offset = (page - 1) * page_size
            query = query.offset(offset).limit(page_size)

            # Obtener documentos
            docs = query.stream()
            stories = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                stories.append(data)

            return {
                'stories': stories,
                'total': total,
                'page': page,
                'pageSize': page_size,
                'hasMore': (offset + page_size) < total
            }
        except Exception as e:
            print(f"Error listando stories: {e}")
            raise

    async def find_nearby_stories(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 10.0,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Buscar relatos cercanos a una ubicación"""
        try:
            # Generar geohash de la ubicación de búsqueda
            center_geohash = geohash2.encode(latitude, longitude, precision=5)

            # Obtener vecinos del geohash para búsqueda más amplia
            neighbors = geohash2.neighbors(center_geohash)
            search_hashes = [center_geohash] + neighbors

            # Buscar stories que coincidan con estos geohashes
            stories = []
            for gh in search_hashes:
                query = self.db.collection('stories')\
                    .where('location.geohash', '>=', gh)\
                    .where('location.geohash', '<', gh + '\uf8ff')\
                    .where('status', '==', 'published')\
                    .limit(limit)

                docs = query.stream()
                for doc in docs:
                    data = doc.to_dict()
                    data['id'] = doc.id
                    stories.append(data)

            # TODO: Filtrar por radio real usando distancia haversine
            # Por ahora retornamos los resultados del geohash

            return stories[:limit]
        except Exception as e:
            print(f"Error buscando stories cercanos: {e}")
            raise

    async def increment_views(self, story_id: str) -> bool:
        """Incrementar contador de vistas"""
        try:
            doc_ref = self.db.collection('stories').document(story_id)
            doc_ref.update({
                'views': firestore.Increment(1)
            })
            return True
        except Exception as e:
            print(f"Error incrementando vistas: {e}")
            return False

    # === STORAGE OPERATIONS ===

    async def upload_file(
        self,
        file_path: str,
        destination_blob_name: str,
        content_type: str = 'application/octet-stream'
    ) -> str:
        """Subir archivo a Firebase Storage"""
        try:
            blob = self.bucket.blob(destination_blob_name)
            blob.upload_from_filename(file_path, content_type=content_type)
            blob.make_public()
            return blob.public_url
        except Exception as e:
            print(f"Error subiendo archivo: {e}")
            raise

    async def upload_from_bytes(
        self,
        file_bytes: bytes,
        destination_blob_name: str,
        content_type: str = 'application/octet-stream'
    ) -> str:
        """Subir bytes a Firebase Storage"""
        try:
            blob = self.bucket.blob(destination_blob_name)
            blob.upload_from_string(file_bytes, content_type=content_type)
            blob.make_public()
            return blob.public_url
        except Exception as e:
            print(f"Error subiendo bytes: {e}")
            raise

    async def delete_file(self, blob_name: str) -> bool:
        """Eliminar archivo de Storage"""
        try:
            blob = self.bucket.blob(blob_name)
            blob.delete()
            return True
        except Exception as e:
            print(f"Error eliminando archivo: {e}")
            return False

    async def get_download_url(self, blob_name: str) -> Optional[str]:
        """Obtener URL de descarga de un archivo"""
        try:
            blob = self.bucket.blob(blob_name)
            if blob.exists():
                return blob.public_url
            return None
        except Exception as e:
            print(f"Error obteniendo URL: {e}")
            return None

# Singleton instance
firebase_service = FirebaseService()
