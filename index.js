import dotenv from 'dotenv';

// IMPORTANTE: Cargar .env PRIMERO
dotenv.config();

// Debug: verificar variables
console.log('🔍 Variables .env cargadas:');
console.log(`   DB_HOST: ${process.env.DB_HOST}`);
console.log(`   DB_PORT: ${process.env.DB_PORT}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : 'NO_DEFINIDA'}`);

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { testConnection, userQueries } from './app/config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { methods as authentication} from './app/controllers/authentication.js';
import { methods as authorization} from './app/middlewares/authorization.js';

//creacion del server
const app = express();

// Inicializar base de datos
async function initializeDatabase() {
    console.log('🔄 Inicializando base de datos...');
    
    // Probar conexión
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
        console.error('❌ No se pudo conectar a la base de datos:', connectionTest.error);
        process.exit(1);
    }
    
    console.log('✅ Conexión a base de datos establecida correctamente');
}

app.set ('port', 4000);

// Inicializar base de datos antes de arrancar el servidor
initializeDatabase().then(() => {
    app.listen(app.get('port'));
    console.log('🚀 Server on port', app.get('port'));
}).catch(error => {
    console.error('❌ Error al inicializar:', error);
});

//configuracion
app.use(express.static(__dirname)); // Servir archivos estáticos desde la raíz (incluye imagenes_RM/)
app.use(express.static(__dirname + '/app/public')); // Servir archivos CSS y JS
app.use(express.json());
app.use(cookieParser());

// Headers CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

//Rutas
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
app.get('/login', authorization.soloPublico, (req, res) => res.sendFile(__dirname + '/app/pages/sesion_login.html'));
app.get('/register', authorization.soloPublico, (req, res) => res.sendFile(__dirname + '/app/pages/sesion.html'));
app.get('/perfil', authorization.soloAutenticados, (req, res) => res.sendFile(__dirname + '/app/pages/perfil.html'));
app.get('/muebles', (req, res) => res.sendFile(__dirname + '/seccion_muebles/muebles.html'));
app.get('/preguntas-frecuentes', (req, res) => res.sendFile(__dirname + '/preguntas_frecuentes/pfrecuentes.html'));

// Rutas de productos individuales
app.get('/barra', (req, res) => res.sendFile(__dirname + '/muebles/barra/barra.html'));

// Rutas para mesas de comedor
app.get('/mesa-comedor-1', (req, res) => res.sendFile(__dirname + '/muebles/barra/barra.html'));
app.get('/mesa-comedor-2', (req, res) => res.sendFile(__dirname + '/muebles/barra/barra.html'));
app.get('/mesa-comedor-3', (req, res) => res.sendFile(__dirname + '/muebles/barra/barra.html'));
app.get('/mesa-comedor-4', (req, res) => res.sendFile(__dirname + '/muebles/barra/barra.html'));

// Rutas para escritorios 
app.get('/escritorio-moderno', (req, res) => res.sendFile(__dirname + '/muebles/escritorio_moderno/escritorio_moderno.html'));
app.get('/escritorio-ejecutivo', (req, res) => res.sendFile(__dirname + '/muebles/escritorio_ejecutivo/escritorio_ejecutivo.html'));
app.get('/escritorio-minimalista', (req, res) => res.sendFile(__dirname + '/muebles/barra/barra.html'));
app.get('/escritorio-industrial', (req, res) => res.sendFile(__dirname + '/muebles/barra/barra.html'));
app.get('/escritorio-vintage', (req, res) => res.sendFile(__dirname + '/muebles/barra/barra.html'));
app.get('/escritorio-compacto', (req, res) => res.sendFile(__dirname + '/muebles/barra/barra.html'));

// Rutas para mesas ratonas con páginas específicas
app.get('/mesa-ratona-moderna', (req, res) => res.sendFile(__dirname + '/muebles/mesa_ratona_moderna/mesa_ratona_moderna.html'));
app.get('/mesa-ratona-blanca', (req, res) => res.sendFile(__dirname + '/muebles/mesa_ratona_blanca/mesa_ratona_blanca.html'));
app.get('/mesa-ratona-vidrio', (req, res) => res.sendFile(__dirname + '/muebles/mesa_ratona_vidrio/mesa_ratona_vidrio.html'));
app.get('/mesa-ratona-mueble', (req, res) => res.sendFile(__dirname + '/muebles/mesa_ratona_mueble/mesa_ratona_mueble.html'));
app.get('/mesa-ratona-sillas', (req, res) => res.sendFile(__dirname + '/muebles/mesa_ratona_sillas/mesa_ratona_sillas.html'));
app.get('/estanteria-moderna', (req, res) => res.sendFile(__dirname + '/muebles/estanteria_moderna/estanteria_moderna.html'));
app.post('/api/login', authentication.login);
app.post('/api/register', authentication.register);

// Ruta para verificar estado de autenticación (debug)
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

app.post('/logout', (req, res) => {
    try {
        // Eliminar cookie JWT
        res.clearCookie('jwt', {
            path: '/',
            httpOnly: false,
            secure: false,
            sameSite: 'lax'
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