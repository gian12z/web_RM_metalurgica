-- Inicialización automática de la base de datos RM Metalúrgica
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor MySQL

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS rm_metalurgica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rm_metalurgica;

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
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices adicionales para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_fecha_registro ON usuarios(fecha_registro);

-- Comentarios sobre la tabla
ALTER TABLE usuarios COMMENT = 'Tabla para almacenar información de usuarios registrados';

-- Mensaje de confirmación
SELECT 'Base de datos RM Metalúrgica inicializada correctamente' as resultado;