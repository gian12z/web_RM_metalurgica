# RM Metalúrgica - Dockerización

Este proyecto está dockerizado con una arquitectura de microservicios separando frontend, backend y base de datos.

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend      │    │   Base Datos    │
│    (Nginx)      │◄──►│   (Node.js)      │◄──►│    (MySQL)      │
│    Puerto 80    │    │   Puerto 4000    │    │   Puerto 3306   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Componentes:

- **Frontend**: Nginx sirviendo archivos estáticos (HTML, CSS, JS, imágenes)
- **Backend**: API Node.js + Express con autenticación JWT
- **Base de Datos**: MySQL 8.0 con persistencia de datos

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker Desktop instalado
- Docker Compose instalado

### Windows (PowerShell)
```powershell
# Iniciar todo el sistema
.\docker-manager.ps1 start

# O paso a paso:
.\docker-manager.ps1 build
.\docker-manager.ps1 start
```

### Linux/Mac (Terminal)
```bash
# Iniciar todo el sistema
make start

# O paso a paso:  
make build
make start
```

### Acceso
- **Sitio web**: http://localhost
- **API Backend**: http://localhost:4000
- **Base de datos**: localhost:3306

## 📋 Comandos Disponibles

### Windows (PowerShell)
```powershell
.\docker-manager.ps1 build     # Construir imágenes
.\docker-manager.ps1 start     # Iniciar servicios
.\docker-manager.ps1 stop      # Detener servicios
.\docker-manager.ps1 restart   # Reiniciar servicios
.\docker-manager.ps1 logs      # Ver logs
.\docker-manager.ps1 status    # Ver estado
.\docker-manager.ps1 clean     # Limpiar todo
.\docker-manager.ps1 dev       # Modo desarrollo
```

### Linux/Mac (Make)
```bash
make build        # Construir imágenes
make start        # Iniciar servicios
make stop         # Detener servicios
make restart      # Reiniciar servicios
make logs         # Ver logs
make status       # Ver estado
make clean        # Limpiar todo
make dev          # Modo desarrollo
make quick-start  # Construcción e inicio rápido
```

## 🔧 Configuración

### Variables de Entorno
Las variables están en `.env.docker`:

```env
# Base de datos
MYSQL_ROOT_PASSWORD=rm_secure_2024
MYSQL_DATABASE=rm_metalurgica
MYSQL_USER=rm_app
MYSQL_PASSWORD=rm_app_pass_2024

# Backend
DB_HOST=database
JWT_SECRET=rm_metalurgica_jwt_secret_2024_super_secure
NODE_ENV=production
```

### Puertos
- **80**: Frontend (Nginx)
- **4000**: Backend API (Node.js)  
- **3306**: Base de datos (MySQL)
- **443**: HTTPS (futuro)

## 📁 Estructura Docker

```
├── docker-compose.yml          # Orquestación principal
├── .env.docker                 # Variables de entorno
├── docker-manager.ps1          # Script Windows
├── Makefile                    # Comandos Linux/Mac
├── backend/
│   ├── Dockerfile              # Imagen Node.js
│   ├── package.json            # Dependencias backend
│   ├── index.js                # Servidor API
│   └── app/                    # Lógica de negocio
├── frontend/
│   ├── Dockerfile              # Imagen Nginx
│   ├── nginx.conf              # Configuración Nginx
│   ├── *.html                  # Páginas web
│   ├── *.css, *.js             # Archivos estáticos
│   └── imagenes_RM/            # Recursos multimedia
└── database/
    └── 01-init.sql             # Inicialización BD
```

## 🔍 Verificación de Funcionamiento

### Health Checks
Todos los servicios incluyen health checks:

```bash
# Ver estado de salud
docker-compose ps

# Verificar logs
docker-compose logs -f
```

### Endpoints de Verificación
- **Frontend**: http://localhost/
- **Backend Health**: http://localhost:4000/api/health
- **API Auth**: http://localhost:4000/api/auth-status

### Rutas Principales
- `/` - Página principal
- `/muebles` - Sección trabajos
- `/login` - Iniciar sesión
- `/register` - Registrarse  
- `/perfil` - Perfil de usuario
- `/preguntas-frecuentes` - FAQ

## 🛠️ Desarrollo

### Logs por Servicio
```bash
# Windows
docker-compose --env-file .env.docker logs -f backend
docker-compose --env-file .env.docker logs -f frontend
docker-compose --env-file .env.docker logs -f database

# Linux/Mac
make backend-logs
make frontend-logs  
make db-logs
```

### Acceso a Contenedores
```bash
# Backend shell
docker exec -it rm_metalurgica_backend sh

# Frontend shell  
docker exec -it rm_metalurgica_frontend sh

# Base de datos MySQL
docker exec -it rm_metalurgica_db mysql -u root -p
```

### Reiniciar Servicios Individuales
```bash
docker-compose --env-file .env.docker restart backend
docker-compose --env-file .env.docker restart frontend
docker-compose --env-file .env.docker restart database
```

## 🔒 Seguridad

### Características de Seguridad:
- Usuarios no-root en contenedores
- Variables de entorno para credenciales
- Red interna Docker
- Headers de seguridad en Nginx
- Autenticación JWT con cookies HttpOnly
- Contraseñas hasheadas con bcrypt

### Cambiar Credenciales
Edita `.env.docker` con tus propias credenciales:
```env
MYSQL_ROOT_PASSWORD=tu_password_seguro  
JWT_SECRET=tu_jwt_secret_muy_seguro
```

## 📊 Monitoreo

### Ver Estado
```bash
# Contenedores activos
docker ps

# Uso de recursos
docker stats

# Espacio en disco
docker system df
```

### Backup Base de Datos
```bash
# Linux/Mac
make backup-db

# Windows/Manual
docker exec rm_metalurgica_db mysqldump -u root -prm_secure_2024 rm_metalurgica > backup.sql
```

## 🐛 Solución de Problemas

### Problema: Contenedores no inician
```bash
# Ver logs detallados
docker-compose --env-file .env.docker logs

# Verificar puertos
netstat -tlnp | grep :80
netstat -tlnp | grep :4000
```

### Problema: Base de datos no conecta
```bash
# Verificar salud de MySQL
docker exec rm_metalurgica_db mysql -u root -prm_secure_2024 -e "SELECT 1"

# Reiniciar solo BD
docker-compose --env-file .env.docker restart database
```

### Limpiar Todo y Empezar de Nuevo
```bash
# Windows
.\docker-manager.ps1 clean
.\docker-manager.ps1 build
.\docker-manager.ps1 start

# Linux/Mac
make clean
make build
make start
```

## 📞 Soporte

Si encuentras problemas:

1. Verifica que Docker Desktop esté corriendo
2. Revisa los logs: `docker-compose logs`
3. Verifica puertos disponibles
4. Limpia y reconstruye si es necesario

## 🎯 Próximos Pasos

- [ ] Configurar HTTPS con certificados SSL
- [ ] Implementar logging centralizado
- [ ] Configurar monitoreo con Prometheus
- [ ] Implementar CI/CD pipeline
- [ ] Optimizar imágenes Docker para producción