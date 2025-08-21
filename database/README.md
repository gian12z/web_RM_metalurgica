# Base de Datos - RM Metalúrgica

## Configuración Inicial

### 1. Crear la base de datos
Ejecuta el siguiente script para crear el esquema inicial:

```sql
mysql -u root -p < database/schema.sql
```

### 2. Variables de entorno
Asegúrate de tener configurado tu archivo `.env` con las credenciales de la base de datos:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=rm_metalurgica
```

### 3. Estructura de la base de datos

#### Tabla: usuarios
- `id`: Identificador único (AUTO_INCREMENT)
- `nombre_usuario`: Nombre de usuario único (VARCHAR 50)
- `email`: Correo electrónico único (VARCHAR 100)
- `contrasena`: Contraseña hasheada (VARCHAR 255)
- `telefono`: Número de teléfono opcional (VARCHAR 20)
- `comentarios`: Comentarios adicionales (TEXT)
- `recibir_novedades`: Suscripción a newsletter (BOOLEAN)
- `fecha_registro`: Fecha de registro automática
- `fecha_actualizacion`: Fecha de última actualización automática

## Comandos útiles

### Conectar a MySQL
```bash
mysql -u root -p
```

### Usar la base de datos
```sql
USE rm_metalurgica;
```

### Ver tablas
```sql
SHOW TABLES;
```

### Describir tabla usuarios
```sql
DESCRIBE usuarios;
```
