@echo off
REM Script para detener Historias Vivientes Aymara (Windows)
REM Usage: stop.bat [--clean]

echo.
echo ========================================
echo Deteniendo Historias Vivientes Aymara
echo ========================================
echo.

if "%1"=="--clean" (
    echo Deteniendo y eliminando contenedores, redes y volumenes...
    docker-compose down -v
    echo.
    echo [OK] Todo limpio.
    echo      Las imagenes se mantienen para inicio mas rapido.
    echo.
    echo Para eliminar tambien las imagenes:
    echo    docker-compose down --rmi all
) else (
    echo Deteniendo contenedores...
    docker-compose down
    echo.
    echo [OK] Contenedores detenidos.
    echo      Los datos se mantienen para el proximo inicio.
)

echo.
echo Para ver estado:   docker-compose ps
echo Para reiniciar:    start.bat
echo.

pause
