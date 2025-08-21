// middleware/authentication.js
import jsonwebtoken from "jsonwebtoken";
import dotenv from 'dotenv';
import { userQueries } from "../config/database.js";

dotenv.config(); // Cargar las variables de entorno desde el archivo .env

function soloAdmin(req, res, next) {
    revisarCookie(req).then(logeado => {
        if (logeado) return next();
        console.log('🚫 Acceso denegado a ruta de admin, redirigiendo a login');
        return res.redirect('/login'); // Redirigir al login si no está logueado
    }).catch(error => {
        console.error('Error en soloAdmin:', error);
        return res.redirect('/login'); // En caso de error, redirigir a login
    });
}

function soloPublico(req, res, next) {
    revisarCookie(req).then(logeado => {
        if (!logeado) return next();
        return res.redirect('/perfil'); // Redirigir al perfil si ya está logueado
    }).catch(error => {
        console.error('Error en soloPublico:', error);
        return next(); // En caso de error, permitir acceso
    });
}

function soloAutenticados(req, res, next) {
    revisarCookie(req).then(logeado => {
        if (logeado) return next();
        console.log('🚫 Acceso denegado a ruta protegida, redirigiendo a login');
        return res.redirect('/login'); // Redirigir al login si no está logueado
    }).catch(error => {
        console.error('Error en soloAutenticados:', error);
        return res.redirect('/login'); // En caso de error, redirigir a login
    });
}

async function revisarCookie(req) {
    try {
        const cookieHeader = req.headers.cookie;
        if (!cookieHeader) {
            console.log('🍪 No hay cookies en la petición');
            return false;
        }
        
        const cookieJWT = cookieHeader.split('; ').find(row => row.startsWith('jwt='));
        if (!cookieJWT) {
            console.log('🍪 No se encontró cookie JWT');
            return false;
        }
        
        const token = cookieJWT.substring(4);
        
        // Verificar que el token no esté vacío o sea solo espacios
        if (!token || token.trim() === '' || token === 'undefined' || token === 'null') {
            console.log('🍪 Token JWT vacío o inválido');
            return false;
        }
        
        // Verificar estructura básica del JWT (debe tener 3 partes)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            console.log('🍪 Token JWT con estructura inválida');
            return false;
        }
        
        // Verificar y decodificar el token
        const decodificada = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        
        // Verificar que el token no haya expirado
        if (decodificada.exp && decodificada.exp * 1000 < Date.now()) {
            console.log('🍪 Token JWT expirado');
            return false;
        }
        
        // Buscar usuario en la base de datos MySQL
        const usuarioResult = await userQueries.findByUsername(decodificada.user);
        
        if (!usuarioResult.success || usuarioResult.data.length === 0) {
            console.log('🍪 Usuario no encontrado en BD para token:', decodificada.user);
            return false;
        }
        
        console.log('✅ Token JWT válido para usuario:', decodificada.user);
        // Usuario encontrado en la base de datos
        return true;
    }
    catch (error) {
        console.log("❌ Error al verificar cookie:", error.message);
        return false;
    }
}

// Middleware mejorado que también devuelve información del usuario
async function revisarCookieConUsuario(req) {
    try {
        const cookieHeader = req.headers.cookie;
        if (!cookieHeader) {
            return { logeado: false, usuario: null };
        }
        
        const cookieJWT = cookieHeader.split('; ').find(row => row.startsWith('jwt='));
        if (!cookieJWT) {
            return { logeado: false, usuario: null };
        }
        
        const token = cookieJWT.substring(4);
        const decodificada = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        
        // Buscar usuario en la base de datos MySQL
        const usuarioResult = await userQueries.findByUsername(decodificada.user);
        
        if (!usuarioResult.success || usuarioResult.data.length === 0) {
            return { logeado: false, usuario: null };
        }
        
        const usuario = usuarioResult.data[0];
        // No devolver la contraseña por seguridad
        delete usuario.contrasena;
        
        return { logeado: true, usuario };
    }
    catch (error) {
        console.log("Error al verificar cookie:", error);
        return { logeado: false, usuario: null };
    }
}

// Middleware para rutas que necesitan información del usuario
function conUsuario(req, res, next) {
    revisarCookieConUsuario(req).then(result => {
        req.usuario = result.usuario;
        req.logeado = result.logeado;
        next();
    }).catch(error => {
        console.log("Error en middleware conUsuario:", error);
        req.usuario = null;
        req.logeado = false;
        next();
    });
}

export const methods = {
    soloAdmin,
    soloPublico,
    soloAutenticados,
    conUsuario,
    revisarCookie,
    revisarCookieConUsuario
};