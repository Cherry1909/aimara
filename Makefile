# Makefile para Historias Vivientes Aymara
# Facilita comandos comunes de Docker

.PHONY: help build up down logs restart clean dev prod

help: ## Mostrar esta ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Construir imágenes Docker
	docker-compose build

up: ## Iniciar servicios (producción)
	docker-compose up -d

down: ## Detener servicios
	docker-compose down

logs: ## Ver logs en tiempo real
	docker-compose logs -f

restart: ## Reiniciar servicios
	docker-compose restart

clean: ## Limpiar contenedores y volúmenes
	docker-compose down -v
	docker system prune -f

dev: ## Iniciar en modo desarrollo (con hot reload)
	docker-compose -f docker-compose.dev.yml up

prod: ## Iniciar en modo producción
	docker-compose up -d

status: ## Ver estado de contenedores
	docker-compose ps

backend-shell: ## Abrir shell en backend
	docker-compose exec backend bash

frontend-shell: ## Abrir shell en frontend
	docker-compose exec frontend sh

backend-logs: ## Ver logs solo de backend
	docker-compose logs -f backend

frontend-logs: ## Ver logs solo de frontend
	docker-compose logs -f frontend

rebuild: ## Reconstruir sin cache
	docker-compose build --no-cache

rebuild-backend: ## Reconstruir solo backend
	docker-compose build --no-cache backend

rebuild-frontend: ## Reconstruir solo frontend
	docker-compose build --no-cache frontend

install: ## Configuración inicial (copiar .env)
	@if [ ! -f .env ]; then \
		cp .env.docker.example .env; \
		echo "✅ Archivo .env creado. Por favor edítalo con tus credenciales."; \
	else \
		echo "⚠️  El archivo .env ya existe."; \
	fi

setup: install ## Alias para install
	@echo "📝 Recuerda:"
	@echo "   1. Editar .env con tus credenciales"
	@echo "   2. Copiar serviceAccount.json a backend/credentials/"
	@echo "   3. Ejecutar: make build && make up"
