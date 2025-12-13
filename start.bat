@echo off
REM Script de inicio para Historias Vivientes Aymara con Docker (Windows)
REM Usage: start.bat [dev|prod]

setlocal enabledelayedexpansion

set MODE=%1
if "%MODE%"=="" set MODE=dev

echo.
echo ========================================
echo Historias Vivientes Aymara - Docker
echo ========================================
echo.
echo Modo: %MODE%
echo.

REM Verificar que existe el archivo .env
if not exist .env (
    echo [ERROR] No se encontro el archivo .env
    echo.
    echo Copia .env.docker.example a .env y completa tus credenciales:
    echo    copy .env.docker.example .env
    echo.
    pause
    exit /b 1
)

REM Verificar que existe serviceAccount.json
if not exist backend\credentials\serviceAccount.json (
    echo [ADVERTENCIA] No se encontro backend\credentials\serviceAccount.json
    echo.
    echo Descarga las credenciales de Firebase Admin desde Firebase Console
    echo y guardalas en: backend\credentials\serviceAccount.json
    echo.
    set /p CONTINUE="Continuar de todas formas? (s/n): "
    if /i not "!CONTINUE!"=="s" exit /b 1
)

echo.
echo [1/3] Construyendo imagenes Docker...
docker-compose build

if errorlevel 1 (
    echo.
    echo [ERROR] Fallo la construccion de imagenes
    pause
    exit /b 1
)

echo.
echo [2/3] Iniciando servicios...

if "%MODE%"=="prod" (
    docker-compose up -d
    echo.
    echo [OK] Servicios iniciados en modo produccion
) else (
    echo.
    echo [OK] Iniciando en modo desarrollo
    echo      Presiona Ctrl+C para detener
    echo.
    docker-compose up
)

echo.
echo ========================================
echo Aplicacion disponible en:
echo ========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo Para ver logs:     docker-compose logs -f
echo Para detener:      docker-compose down
echo Para reiniciar:    docker-compose restart
echo.

if "%MODE%"=="prod" pause

endlocal
