@echo off
IF EXIST "docker-compose.yml" (
    echo [INFO] docker-compose.yml encontrado.
    
    echo [INFO] Deteniendo contenedores previos...
    docker compose down
    
    echo [INFO] Levantando entorno...
    docker compose up --build
) ELSE (
    echo [ERROR] No se encuentra "docker-compose.yml" en este directorio.
)

pause
