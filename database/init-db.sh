#!/bin/bash
set -e

echo "🔧 Inicializando base de datos RM Metalúrgica..."

# Crear la base de datos si no existe
mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS rm_metalurgica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Usar la base de datos
mysql -u root -p"$MYSQL_ROOT_PASSWORD" rm_metalurgica << 'EOF'

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    comentarios TEXT,
    recibir_novedades BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usuarios_email (email),
    INDEX idx_usuarios_fecha_registro (fecha_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentario sobre la tabla
ALTER TABLE usuarios COMMENT = 'Tabla para almacenar información de usuarios registrados';

-- Verificar que la tabla se creó correctamente
DESCRIBE usuarios;

EOF

echo "✅ Base de datos inicializada correctamente"