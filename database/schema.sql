-- Esquema inicial de la base de datos RM Metalúrgica
-- Ejecutar este script para crear las tablas necesarias

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS rm_metalurgica;
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
);

-- Índices adicionales para mejorar el rendimiento
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_fecha_registro ON usuarios(fecha_registro);

-- Comentarios sobre la tabla
ALTER TABLE usuarios COMMENT = 'Tabla para almacenar información de usuarios registrados';
