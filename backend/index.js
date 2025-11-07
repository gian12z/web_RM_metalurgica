import dotenv from 'dotenv';

// IMPORTANTE: Cargar .env PRIMERO
dotenv.config();

// Debug: verificar variables
console.log('🔍 Variables .env cargadas:');
console.log(`   DB_HOST: ${process.env.DB_HOST}`);
console.log(`   DB_PORT: ${process.env.DB_PORT}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : 'NO_DEFINIDA'}`);

import express from 'express';
import cookieParser from 'cookie-parser';
import { testConnection, userQueries } from './app/config/database.js';
import { methods as authentication } from './app/controllers/authentication.js';
import { methods as authorization } from './app/middlewares/authorization.js';

// Creación del server
const app = express();

// Inicializar base de datos
async function initializeDatabase() {
    console.log('🔄 Inicializando base de datos...');
    
    // Esperar a que la base de datos esté disponible
    let retries = 30;
    while (retries > 0) {
        const connectionTest = await testConnection();
        if (connectionTest.success) {
            console.log('✅ Conexión a base de datos establecida correctamente');
            return;
        }
        
        console.log(`⏳ Esperando conexión DB... (intentos restantes: ${retries})`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.error('❌ No se pudo conectar a la base de datos después de varios intentos');
    process.exit(1);
}

app.set('port', process.env.PORT || 4000);

// Configuración middleware
app.use(express.json());
app.use(cookieParser());

// Headers CORS - Configurado para Docker
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Middleware para logging de requests
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// ==== RUTAS API ====

// Health check endpoint para Docker
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'production'
    });
});

// Rutas de autenticación
app.post('/api/login', authentication.login);
app.post('/api/register', authentication.register);

// Ruta para verificar estado de autenticación
app.get('/api/auth-status', async (req, res) => {
    const cookies = req.headers.cookie || '';
    const isAuthenticated = await authorization.revisarCookie(req);
    
    res.json({
        isAuthenticated,
        cookies: cookies,
        timestamp: new Date().toISOString()
    });
});

// Ruta para obtener información del usuario autenticado
app.get('/api/user-info', authorization.soloAutenticados, async (req, res) => {
    try {
        const result = await authorization.revisarCookieConUsuario(req);
        
        if (!result.logeado || !result.usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }
        
        // Obtener información completa del usuario de la base de datos
        const usuarioCompleto = await userQueries.findByUsername(result.usuario.nombre_usuario);
        
        if (!usuarioCompleto.success || usuarioCompleto.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const usuario = usuarioCompleto.data[0];
        
        // No enviar la contraseña por seguridad
        delete usuario.contrasena;
        
        res.json({
            success: true,
            user: {
                id: usuario.id,
                username: usuario.nombre_usuario,
                email: usuario.email,
                telefono: usuario.telefono,
                comentarios: usuario.comentarios,
                newsletter: usuario.recibir_novedades,
                fecha_creacion: usuario.fecha_registro,
                fecha_actualizacion: usuario.fecha_actualizacion
            }
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo información del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    try {
        // Eliminar cookie JWT - intentar varias configuraciones para asegurar la eliminación
        const cookieVariants = [
            { path: '/', httpOnly: false, secure: false, sameSite: 'none' },
            { path: '/', httpOnly: false, secure: false, sameSite: 'lax' },
            { path: '/', httpOnly: false, secure: false }
        ];

        cookieVariants.forEach(opts => {
            try {
                res.clearCookie('jwt', opts);
            } catch (e) {
                // Ignorar errores individuales al intentar borrar variantes
                console.warn('No se pudo clearCookie con opts', opts, e.message || e);
            }
        });
        
        // Headers para prevenir cache
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        res.status(200).json({ 
            success: true,
            message: 'Sesión cerrada correctamente'
        });
        
    } catch (error) {
        console.error('❌ Error en logout:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        path: req.originalUrl,
        method: req.method
    });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
    console.error('❌ Error no manejado:', error);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
    });
});

// Inicializar servidor
initializeDatabase().then(() => {
    app.listen(app.get('port'), '0.0.0.0', () => {
        console.log('🚀 Backend server running on port', app.get('port'));
        console.log('🌍 Environment:', process.env.NODE_ENV || 'production');
        console.log('📡 Ready to accept connections...');
    });
}).catch(error => {
    console.error('❌ Error al inicializar:', error);
    process.exit(1);
});

// Manejo graceful de shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM recibido, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT recibido, cerrando servidor...');
    process.exit(0);
});