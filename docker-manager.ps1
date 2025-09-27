# Script PowerShell para gestionar Docker en RM Metalúrgica
# =======================================================

# Función para mostrar ayuda
function Show-Help {
    Write-Host "=== RM Metalúrgica Docker Manager ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Comandos disponibles:" -ForegroundColor Yellow
    Write-Host "  build     - Construir todas las imágenes"
    Write-Host "  start     - Iniciar todos los servicios"
    Write-Host "  stop      - Detener todos los servicios"
    Write-Host "  restart   - Reiniciar todos los servicios"
    Write-Host "  logs      - Ver logs de todos los servicios"
    Write-Host "  status    - Ver estado de los contenedores"
    Write-Host "  clean     - Limpiar contenedores e imágenes"
    Write-Host "  dev       - Iniciar en modo desarrollo"
    Write-Host "  help      - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Green
    Write-Host "  .\docker-manager.ps1 start"
    Write-Host "  .\docker-manager.ps1 build"
    Write-Host "  .\docker-manager.ps1 logs"
}

# Verificar que Docker esté instalado
function Test-Docker {
    try {
        docker --version | Out-Null
        docker-compose --version | Out-Null
        return $true
    } catch {
        Write-Error "Docker o Docker Compose no están instalados"
        return $false
    }
}

# Función principal
function Invoke-DockerCommand {
    param(
        [string]$Command
    )
    
    if (-not (Test-Docker)) { return }
    
    switch ($Command.ToLower()) {
        "build" {
            Write-Host "🔨 Construyendo imágenes Docker..." -ForegroundColor Yellow
            docker-compose --env-file .env.docker build --no-cache
        }
        "start" {
            Write-Host "🚀 Iniciando servicios RM Metalúrgica..." -ForegroundColor Green
            docker-compose --env-file .env.docker up -d
            Write-Host "✅ Servicios iniciados. Accede a http://localhost" -ForegroundColor Green
        }
        "stop" {
            Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Red
            docker-compose --env-file .env.docker down
        }
        "restart" {
            Write-Host "🔄 Reiniciando servicios..." -ForegroundColor Yellow
            docker-compose --env-file .env.docker restart
        }
        "logs" {
            Write-Host "📋 Mostrando logs..." -ForegroundColor Cyan
            docker-compose --env-file .env.docker logs -f
        }
        "status" {
            Write-Host "📊 Estado de los contenedores:" -ForegroundColor Cyan
            docker-compose --env-file .env.docker ps
        }
        "clean" {
            Write-Host "🧹 Limpiando contenedores e imágenes..." -ForegroundColor Yellow
            docker-compose --env-file .env.docker down -v
            docker system prune -f
        }
        "dev" {
            Write-Host "🔧 Iniciando en modo desarrollo..." -ForegroundColor Blue
            docker-compose --env-file .env.docker up --build
        }
        default {
            Show-Help
        }
    }
}

# Ejecutar comando
if ($args.Count -eq 0) {
    Show-Help
} else {
    Invoke-DockerCommand -Command $args[0]
}