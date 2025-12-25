@echo off
title Kitchen App Launcher
echo Iniciando Cocina App...
echo Por favor espera unos segundos mientras se enciende el "motor" de la base de datos...

:: Start Next.js in a new minimized window
start "Cocina Engine" /min npm run dev

:: Wait 5 seconds for localhost to be ready
timeout /t 5 /nobreak >nul

:: Open Default Browser
start http://localhost:3001

echo.
echo La aplicacion esta corriendo.
echo Para cerrarla, cierra la ventana llamada "Cocina Engine".
echo.
pause
