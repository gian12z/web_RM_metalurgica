# Frontend Dockerfile - Nginx
FROM nginx:1.25-alpine

# Copiar archivos estáticos al directorio de Nginx
COPY . /usr/share/nginx/html/

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Crear directorios necesarios y ajustar permisos
RUN chmod -R 755 /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]