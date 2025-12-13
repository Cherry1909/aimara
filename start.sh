#!/bin/bash

# Script de inicio para Historias Vivientes Aymara con Docker
# Usage: ./start.sh [dev|prod]

set -e

MODE=${1:-dev}

echo "🚀 Iniciando Historias Vivientes Aymara en modo: $MODE"
echo ""

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "📝 Copia .env.docker.example a .env y completa tus credenciales:"
    echo "   cp .env.docker.example .env"
    exit 1
fi

# Verificar que existe serviceAccount.json
if [ ! -f backend/credentials/serviceAccount.json ]; then
    echo "⚠️  Advertencia: No se encontró backend/credentials/serviceAccount.json"
    echo "📝 Descarga las credenciales de Firebase Admin desde Firebase Console"
    echo "   y guárdalas en: backend/credentials/serviceAccount.json"
    read -p "¿Continuar de todas formas? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Construyendo imágenes Docker..."
docker-compose build

echo ""
echo "🔄 Iniciando servicios..."

if [ "$MODE" = "prod" ]; then
    docker-compose up -d
    echo ""
    echo "✅ Servicios iniciados en modo producción (detached)"
else
    echo ""
    echo "✅ Iniciando en modo desarrollo (logs visibles)"
    echo "   Presiona Ctrl+C para detener"
    echo ""
    docker-compose up
fi

echo ""
echo "🌐 Aplicación disponible en:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📊 Para ver logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Para detener:"
echo "   docker-compose down"
