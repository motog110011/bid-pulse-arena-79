@echo off
setlocal

title Subastas GAP — Dev Server

echo.
echo  ============================================
echo   Subastas GAP — Servidor de Desarrollo
echo  ============================================
echo.

:: Verificar que Node.js esta instalado
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no encontrado.
    echo         Descargalo en https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  Node.js : %NODE_VER%

:: Verificar npm
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm no encontrado. Reinstala Node.js.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('npm -v') do set NPM_VER=%%v
echo  npm     : %NPM_VER%
echo.

:: Ir al directorio donde esta el bat
cd /d "%~dp0"

:: Instalar dependencias si node_modules no existe o esta vacio
if not exist "node_modules\" (
    echo [INFO] node_modules no encontrado. Instalando dependencias...
    echo.
    npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] npm install fallo. Revisa tu conexion o el package.json.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas.
    echo.
) else (
    echo [OK] node_modules encontrado, saltando instalacion.
    echo      (Corre "npm install" manualmente si agregaste paquetes nuevos)
    echo.
)

:: Verificar que existe el .env
if not exist ".env" (
    echo [AVISO] Archivo .env no encontrado.
    echo         El sitio necesita las variables VITE_SUPABASE_URL y
    echo         VITE_SUPABASE_PUBLISHABLE_KEY para conectarse a Supabase.
    echo         Crea un archivo .env en la raiz del proyecto.
    echo.
)

:: Arrancar el servidor
echo  Iniciando servidor en http://localhost:5173
echo  Presiona Ctrl+C para detener.
echo.

npm run dev

:: Si el servidor se detuvo con error
if errorlevel 1 (
    echo.
    echo [ERROR] El servidor termino con un error.
)

endlocal
pause
