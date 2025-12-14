#!/usr/bin/env python3
"""
Script para verificar y corregir audioUrls en Firestore
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.services.firebase_service import firebase_service

async def check_audio_urls():
    """Verificar todas las historias y sus audioUrls"""

    print("=" * 70)
    print("🔍 VERIFICANDO AUDIO URLS EN FIRESTORE")
    print("=" * 70)
    print()

    try:
        stories_ref = firebase_service.db.collection('stories')
        docs = stories_ref.stream()

        problematic_stories = []
        valid_stories = []

        for doc in docs:
            data = doc.to_dict()
            story_id = doc.id
            audio_url = data.get('audioUrl', '')
            title = data.get('title', 'Sin título')
            status = data.get('status', 'unknown')

            # Verificar si audioUrl es válido
            is_valid = True
            issue = None

            if not audio_url:
                is_valid = False
                issue = "❌ audioUrl está vacío"
            elif audio_url == '/storage/audios/' or audio_url == '/storage/audios':
                is_valid = False
                issue = "❌ audioUrl es solo el directorio (sin archivo)"
            elif not audio_url.endswith('.webm'):
                is_valid = False
                issue = f"⚠️  audioUrl no termina en .webm: {audio_url}"
            elif not audio_url.startswith('/storage/audios/'):
                is_valid = False
                issue = f"⚠️  audioUrl tiene formato inesperado: {audio_url}"

            if is_valid:
                valid_stories.append({
                    'id': story_id,
                    'title': title,
                    'audioUrl': audio_url,
                    'status': status
                })
                print(f"✅ [{status.upper()}] {title}")
                print(f"   ID: {story_id}")
                print(f"   Audio: {audio_url}")
                print()
            else:
                problematic_stories.append({
                    'id': story_id,
                    'title': title,
                    'audioUrl': audio_url,
                    'status': status,
                    'issue': issue
                })
                print(f"🔴 [{status.upper()}] {title}")
                print(f"   ID: {story_id}")
                print(f"   {issue}")
                print(f"   Audio: '{audio_url}'")
                print()

        # Resumen
        print("=" * 70)
        print("📊 RESUMEN")
        print("=" * 70)
        print(f"✅ Historias con audioUrl válido: {len(valid_stories)}")
        print(f"🔴 Historias con problemas: {len(problematic_stories)}")
        print()

        if problematic_stories:
            print("🔧 HISTORIAS QUE NECESITAN CORRECCIÓN:")
            print()
            for story in problematic_stories:
                print(f"   ID: {story['id']}")
                print(f"   Título: {story['title']}")
                print(f"   Problema: {story['issue']}")
                print(f"   audioUrl actual: '{story['audioUrl']}'")
                print()

            print("💡 SOLUCIONES POSIBLES:")
            print()
            print("1. Si tienes el archivo de audio original:")
            print("   - Volver a subir el audio para esa historia")
            print()
            print("2. Si el archivo está en /backend/storage/audios/:")
            print("   - Ejecutar script de corrección (próximo paso)")
            print()
            print("3. Si no tienes el audio:")
            print("   - Eliminar la historia o marcarla como 'archived'")
            print()

        return problematic_stories, valid_stories

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return [], []


async def fix_audio_url(story_id: str, new_audio_url: str):
    """Corregir el audioUrl de una historia específica"""

    try:
        print(f"🔧 Corrigiendo historia {story_id}...")
        print(f"   Nueva URL: {new_audio_url}")

        success = await firebase_service.update_story(story_id, {
            'audioUrl': new_audio_url
        })

        if success:
            print(f"   ✅ audioUrl actualizado exitosamente")
            return True
        else:
            print(f"   ❌ Error al actualizar")
            return False

    except Exception as e:
        print(f"❌ Error: {e}")
        return False


async def interactive_fix():
    """Modo interactivo para corregir audioUrls"""

    problematic, valid = await check_audio_urls()

    if not problematic:
        print("✨ ¡Todas las historias tienen audioUrls válidos!")
        return

    print("=" * 70)
    print("🛠️  MODO CORRECCIÓN INTERACTIVA")
    print("=" * 70)
    print()

    for i, story in enumerate(problematic, 1):
        print(f"\n[{i}/{len(problematic)}] Historia: {story['title']}")
        print(f"ID: {story['id']}")
        print(f"Problema: {story['issue']}")
        print(f"audioUrl actual: '{story['audioUrl']}'")
        print()

        # Listar archivos disponibles en storage
        import os
        storage_dir = Path("storage/audios")
        if storage_dir.exists():
            print("📁 Archivos disponibles en storage/audios/:")
            audio_files = sorted(storage_dir.glob("*.webm"))
            for j, file in enumerate(audio_files[:10], 1):
                size_mb = file.stat().st_size / 1024 / 1024
                print(f"   {j}. {file.name} ({size_mb:.2f} MB)")
            if len(audio_files) > 10:
                print(f"   ... y {len(audio_files) - 10} archivos más")
            print()

        print("Opciones:")
        print("  1. Ingresar nombre de archivo manualmente")
        print("  2. Marcar como 'archived' (sin audio)")
        print("  3. Saltar esta historia")
        print("  0. Salir")
        print()

        choice = input("Selecciona una opción (0-3): ").strip()

        if choice == '0':
            print("👋 Saliendo...")
            break
        elif choice == '1':
            filename = input("Nombre del archivo (ej: temp_1765672681121_f14e32ce.webm): ").strip()
            if filename:
                new_url = f"/storage/audios/{filename}"

                # Verificar que el archivo existe
                file_path = storage_dir / filename
                if file_path.exists():
                    print(f"   ✅ Archivo encontrado: {filename}")
                    confirm = input(f"   ¿Actualizar audioUrl a '{new_url}'? (s/N): ").strip().lower()
                    if confirm == 's':
                        await fix_audio_url(story['id'], new_url)
                else:
                    print(f"   ⚠️  Archivo NO encontrado: {filename}")
                    confirm = input("   ¿Actualizar de todos modos? (s/N): ").strip().lower()
                    if confirm == 's':
                        await fix_audio_url(story['id'], new_url)

        elif choice == '2':
            confirm = input("   ¿Marcar como 'archived'? (s/N): ").strip().lower()
            if confirm == 's':
                await firebase_service.update_story(story['id'], {
                    'status': 'archived'
                })
                print("   ✅ Historia marcada como 'archived'")

        elif choice == '3':
            print("   ⏭️  Saltando...")
            continue

    print("\n✨ Corrección completada!")


async def main():
    import argparse

    parser = argparse.ArgumentParser(description='Verificar y corregir audioUrls')
    parser.add_argument('--check', action='store_true', help='Solo verificar, no corregir')
    parser.add_argument('--fix', action='store_true', help='Modo corrección interactiva')
    parser.add_argument('--story-id', type=str, help='Corregir historia específica')
    parser.add_argument('--audio-url', type=str, help='Nueva audioUrl (usar con --story-id)')

    args = parser.parse_args()

    if args.story_id and args.audio_url:
        await fix_audio_url(args.story_id, args.audio_url)
    elif args.fix:
        await interactive_fix()
    else:
        await check_audio_urls()


if __name__ == '__main__':
    asyncio.run(main())
