#!/usr/bin/env python3
"""
Script para verificar y corregir el estado de las historias en Firestore.

Este script:
1. Lista todas las historias en Firestore
2. Muestra su estado actual (draft, published, etc.)
3. Permite cambiar historias de 'draft' a 'published'

Uso:
    python fix_stories_status.py --list          # Listar historias
    python fix_stories_status.py --publish-all   # Publicar todas las drafts
    python fix_stories_status.py --publish ID    # Publicar historia específica
"""

import argparse
import asyncio
import sys
from pathlib import Path

# Agregar el directorio app al path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from app.services.firebase_service import firebase_service
    from google.cloud.firestore_v1 import FieldFilter
except ImportError as e:
    print(f"❌ Error: {e}")
    print("\n💡 Asegúrate de estar en el entorno virtual:")
    print("   cd backend")
    print("   python -m venv venv")
    print("   source venv/bin/activate  # o venv\\Scripts\\activate en Windows")
    print("   pip install -r requirements.txt")
    sys.exit(1)


async def list_stories():
    """Listar todas las historias en Firestore"""
    try:
        print("🔍 Buscando historias en Firestore...\n")

        stories_ref = firebase_service.db.collection('stories')
        docs = stories_ref.stream()

        stories = []
        for doc in docs:
            data = doc.to_dict()
            stories.append({
                'id': doc.id,
                'status': data.get('status', 'unknown'),
                'title': data.get('title', 'Sin título'),
                'audioUrl': data.get('audioUrl', 'N/A'),
                'createdAt': data.get('createdAt'),
                'narrator': data.get('narrator', {}).get('name', 'Anónimo')
            })

        if not stories:
            print("❌ No se encontraron historias en Firestore.")
            print("\n💡 Posibles razones:")
            print("   1. No se han creado historias aún")
            print("   2. Credenciales de Firebase incorrectas")
            print("   3. Colección 'stories' no existe")
            return []

        # Agrupar por status
        by_status = {}
        for story in stories:
            status = story['status']
            if status not in by_status:
                by_status[status] = []
            by_status[status].append(story)

        # Mostrar resumen
        print(f"📊 Total de historias: {len(stories)}\n")
        for status, group in by_status.items():
            print(f"   {status.upper()}: {len(group)}")
        print()

        # Mostrar detalles
        for story in stories:
            status_emoji = {
                'published': '✅',
                'draft': '📝',
                'archived': '🗄️',
                'processing': '⏳'
            }.get(story['status'], '❓')

            print(f"{status_emoji} [{story['status'].upper()}] {story['title']}")
            print(f"   ID: {story['id']}")
            print(f"   Narrador: {story['narrator']}")
            print(f"   Audio: {story['audioUrl']}")
            print()

        return stories

    except Exception as e:
        print(f"❌ Error al listar historias: {e}")
        import traceback
        traceback.print_exc()
        return []


async def publish_story(story_id: str):
    """Cambiar el estado de una historia a 'published'"""
    try:
        print(f"📤 Publicando historia {story_id}...")

        # Verificar que existe
        story = await firebase_service.get_story(story_id)
        if not story:
            print(f"❌ No se encontró la historia con ID: {story_id}")
            return False

        current_status = story.get('status', 'unknown')
        print(f"   Estado actual: {current_status}")

        if current_status == 'published':
            print("   ℹ️  La historia ya está publicada")
            return True

        # Actualizar status
        success = await firebase_service.update_story(story_id, {
            'status': 'published'
        })

        if success:
            print(f"   ✅ Historia publicada exitosamente")
            return True
        else:
            print(f"   ❌ Error al actualizar el estado")
            return False

    except Exception as e:
        print(f"❌ Error al publicar historia: {e}")
        import traceback
        traceback.print_exc()
        return False


async def publish_all_drafts():
    """Cambiar todas las historias 'draft' a 'published'"""
    try:
        print("🔍 Buscando historias en estado 'draft'...\n")

        stories_ref = firebase_service.db.collection('stories')
        query = stories_ref.where(filter=FieldFilter('status', '==', 'draft'))
        docs = query.stream()

        draft_stories = [(doc.id, doc.to_dict()) for doc in docs]

        if not draft_stories:
            print("ℹ️  No se encontraron historias en estado 'draft'")
            return 0

        print(f"📝 Se encontraron {len(draft_stories)} historias en draft\n")

        # Confirmar
        response = input("¿Deseas publicar todas? (s/N): ")
        if response.lower() != 's':
            print("❌ Operación cancelada")
            return 0

        # Publicar cada una
        published_count = 0
        for story_id, data in draft_stories:
            title = data.get('title', 'Sin título')
            print(f"\n📤 Publicando: {title} ({story_id})")

            success = await firebase_service.update_story(story_id, {
                'status': 'published'
            })

            if success:
                print(f"   ✅ Publicada")
                published_count += 1
            else:
                print(f"   ❌ Error")

        print(f"\n✨ Publicadas {published_count} de {len(draft_stories)} historias")
        return published_count

    except Exception as e:
        print(f"❌ Error al publicar historias: {e}")
        import traceback
        traceback.print_exc()
        return 0


async def check_audio_access(story_id: str):
    """Verificar que el audio de una historia sea accesible"""
    try:
        story = await firebase_service.get_story(story_id)
        if not story:
            print(f"❌ Historia no encontrada: {story_id}")
            return False

        audio_url = story.get('audioUrl')
        if not audio_url:
            print(f"❌ La historia no tiene audioUrl")
            return False

        print(f"🔊 Audio URL: {audio_url}")

        # Si es URL relativa, construir la completa
        if audio_url.startswith('/storage'):
            full_url = f"http://localhost:8000{audio_url}"
            print(f"   URL completa: {full_url}")

            # Intentar acceder
            import httpx
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.head(full_url, timeout=5.0)
                    if response.status_code == 200:
                        print(f"   ✅ Audio accesible ({response.status_code})")
                        content_type = response.headers.get('content-type', 'unknown')
                        content_length = response.headers.get('content-length', 'unknown')
                        print(f"   Tipo: {content_type}")
                        print(f"   Tamaño: {content_length} bytes")
                        return True
                    else:
                        print(f"   ❌ Error HTTP {response.status_code}")
                        return False
                except Exception as e:
                    print(f"   ❌ No se pudo acceder: {e}")
                    return False
        else:
            print("   ℹ️  URL externa, no se puede verificar")
            return True

    except Exception as e:
        print(f"❌ Error al verificar audio: {e}")
        return False


async def main():
    parser = argparse.ArgumentParser(
        description='Verificar y corregir historias en Firestore'
    )
    parser.add_argument(
        '--list',
        action='store_true',
        help='Listar todas las historias'
    )
    parser.add_argument(
        '--publish-all',
        action='store_true',
        help='Publicar todas las historias en draft'
    )
    parser.add_argument(
        '--publish',
        type=str,
        metavar='STORY_ID',
        help='Publicar una historia específica'
    )
    parser.add_argument(
        '--check-audio',
        type=str,
        metavar='STORY_ID',
        help='Verificar acceso al audio de una historia'
    )

    args = parser.parse_args()

    # Banner
    print("=" * 60)
    print("🔧 HERRAMIENTA DE DIAGNÓSTICO - PROYECTO AYMARA")
    print("=" * 60)
    print()

    try:
        # Verificar conexión a Firestore
        print("🔌 Verificando conexión a Firestore...")
        test_ref = firebase_service.db.collection('stories').limit(1)
        list(test_ref.stream())
        print("✅ Conexión exitosa\n")

    except Exception as e:
        print(f"❌ Error de conexión a Firestore: {e}")
        print("\n💡 Verifica:")
        print("   1. Archivo serviceAccount.json existe")
        print("   2. Credenciales son válidas")
        print("   3. Variables de entorno configuradas")
        return

    # Ejecutar acción
    if args.list:
        await list_stories()

    elif args.publish_all:
        await publish_all_drafts()

    elif args.publish:
        await publish_story(args.publish)

    elif args.check_audio:
        await check_audio(args.check_audio)

    else:
        # Modo interactivo
        print("🎯 Modo interactivo\n")
        print("Opciones:")
        print("  1. Listar todas las historias")
        print("  2. Publicar todas las drafts")
        print("  3. Verificar acceso a audio")
        print("  0. Salir")
        print()

        while True:
            try:
                choice = input("Selecciona una opción (0-3): ").strip()

                if choice == '0':
                    print("👋 Hasta luego!")
                    break
                elif choice == '1':
                    await list_stories()
                elif choice == '2':
                    await publish_all_drafts()
                elif choice == '3':
                    story_id = input("ID de la historia: ").strip()
                    if story_id:
                        await check_audio_access(story_id)
                else:
                    print("❌ Opción inválida")

                print()

            except KeyboardInterrupt:
                print("\n\n👋 Hasta luego!")
                break

    print("\n" + "=" * 60)


if __name__ == '__main__':
    asyncio.run(main())
