# Makefile para RM Metalúrgica Docker
# ===================================

.PHONY: help build start stop restart logs status clean dev

# Variables
DOCKER_COMPOSE = docker-compose --env-file .env.docker
PROJECT_NAME = rm_metalurgica

help: ## Mostrar ayuda
	@echo "=== RM Metalúrgica Docker Manager ==="
	@echo ""
	@echo "Comandos disponibles:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

build: ## Construir todas las imágenes
	@echo "🔨 Construyendo imágenes Docker..."
	$(DOCKER_COMPOSE) build --no-cache

start: ## Iniciar todos los servicios
	@echo "🚀 Iniciando servicios RM Metalúrgica..."
	$(DOCKER_COMPOSE) up -d
	@echo "✅ Servicios iniciados. Accede a http://localhost"

stop: ## Detener todos los servicios
	@echo "🛑 Deteniendo servicios..."
	$(DOCKER_COMPOSE) down

restart: ## Reiniciar todos los servicios
	@echo "🔄 Reiniciando servicios..."
	$(DOCKER_COMPOSE) restart

logs: ## Ver logs de todos los servicios
	@echo "📋 Mostrando logs..."
	$(DOCKER_COMPOSE) logs -f

status: ## Ver estado de los contenedores
	@echo "📊 Estado de los contenedores:"
	$(DOCKER_COMPOSE) ps

clean: ## Limpiar contenedores e imágenes
	@echo "🧹 Limpiando contenedores e imágenes..."
	$(DOCKER_COMPOSE) down -v
	docker system prune -f

dev: ## Iniciar en modo desarrollo
	@echo "🔧 Iniciando en modo desarrollo..."
	$(DOCKER_COMPOSE) up --build

quick-start: build start ## Construcción rápida e inicio

# Comandos de desarrollo
backend-logs: ## Ver logs solo del backend
	$(DOCKER_COMPOSE) logs -f backend

frontend-logs: ## Ver logs solo del frontend
	$(DOCKER_COMPOSE) logs -f frontend

db-logs: ## Ver logs solo de la base de datos
	$(DOCKER_COMPOSE) logs -f database

# Comandos de mantenimiento
backup-db: ## Hacer backup de la base de datos
	@echo "💾 Creando backup de la base de datos..."
	docker exec rm_metalurgica_db mysqldump -u root -p$(MYSQL_ROOT_PASSWORD) rm_metalurgica > backup_$(shell date +%Y%m%d_%H%M%S).sql

shell-backend: ## Acceder al shell del backend
	docker exec -it rm_metalurgica_backend sh

shell-frontend: ## Acceder al shell del frontend
	docker exec -it rm_metalurgica_frontend sh

shell-db: ## Acceder al shell de MySQL
	docker exec -it rm_metalurgica_db mysql -u root -p