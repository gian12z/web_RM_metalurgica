# Backend Dockerfile - Node.js + Express
FROM node:18-alpine

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --only=production && npm cache clean --force

# Copiar código fuente del backend
COPY . .

# Cambiar propiedad de archivos al usuario nodejs
RUN chown -R backend:nodejs /app
USER backend

# Exponer puerto del backend
EXPOSE 4000

# Healthcheck para verificar que el servicio esté funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); http.get('http://localhost:4000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Comando para iniciar el servidor
CMD ["node", "index.js"]