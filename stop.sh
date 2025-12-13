#!/bin/bash

# Script para detener Historias Vivientes Aymara
# Usage: ./stop.sh [--clean]

set -e

echo "🛑 Deteniendo Historias Vivientes Aymara..."
echo ""

if [ "$1" = "--clean" ]; then
    echo "🧹 Deteniendo y eliminando contenedores, redes y volúmenes..."
    docker-compose down -v
    echo ""
    echo "✅ Todo limpio. Las imágenes se mantienen para inicio más rápido."
    echo "   Para eliminar también las imágenes: docker-compose down --rmi all"
else
    echo "🔄 Deteniendo contenedores..."
    docker-compose down
    echo ""
    echo "✅ Contenedores detenidos."
    echo "   Los datos se mantienen para el próximo inicio."
fi

echo ""
echo "📊 Para ver estado: docker-compose ps"
echo "🚀 Para reiniciar:  ./start.sh"
