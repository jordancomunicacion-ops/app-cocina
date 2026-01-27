#!/bin/bash
set -e

echo "=== ACTUALIZANDO APP COCINA (AUTONOMA) ==="

echo "-> DETENIENDO CONTENEDORES ANTIGUOS..."
docker stop cocina-web cocina-api cocina-engine cocina-db || true
docker rm cocina-web cocina-api cocina-engine cocina-db || true

echo "-> Limpiando absolutamente todo lo anterior para liberar espacio..."
docker rmi cocina-web:latest || true
docker system prune -af || true

echo "-> Asegurando red..."
docker network create cocina-internal-net || true

echo "-> Desplegando..."
# Ya estamos en la carpeta correcta
export AUTH_URL="https://cocina.sotodelprior.com"
docker compose up -d --build --remove-orphans

echo "=== COCINA ACTUALIZADA ==="
