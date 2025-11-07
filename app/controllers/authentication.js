import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import { userQueries } from "../config/database.js";

dotenv.config();// Cargar las variables de entorno desde el archivo .env


async function login(req,res){
    console.log('🔐 Intento de login:', req.body);
    const user = req.body.user;
    const password = req.body.password;
    
    if(!user || !password){
        return res.status(400).send({status:"Error",message:"Los campos están incompletos"})
    }
    
    // Buscar usuario en la base de datos
    const usuarioResult = await userQueries.findByUsername(user);
    if (!usuarioResult.success) {
        console.error('❌ Error al buscar usuario:', usuarioResult.error);
        return res.status(500).send({status:"Error",message:"Error del servidor"});
    }
    
    if (usuarioResult.data.length === 0) {
        console.log('❌ Usuario no encontrado:', user);
        return res.status(400).send({status:"Error",message:"Error durante login"});
    }
    
    const usuarioAResvisar = usuarioResult.data[0];
    const loginCorrecto = await bcryptjs.compare(password, usuarioAResvisar.contrasena);
    
    if(!loginCorrecto){
        console.log('❌ Contraseña incorrecta para usuario:', user);
        return res.status(400).send({status:"Error",message:"Error durante login"});
    }
    
    // Crear token JWT
    const token = jsonwebtoken.sign({
        user: usuarioAResvisar.nombre_usuario,
        userId: usuarioAResvisar.id
    },
        process.env.JWT_SECRET, 
        {expiresIn:process.env.JWT_EXPIRATION});
    // Parsear JWT_COOKIE_EXPIRATION aceptando valores numéricos (días) o sufijos (ms,s,m,h,d)
    function parseDurationToMs(value) {
        if (!value) return NaN;
        // si es un número puro lo tratamos como días
        if (/^\d+$/.test(value)) {
            return Number(value) * 24 * 60 * 60 * 1000;
        }
        // captura formato como 1d, 12h, 30m, 10s, 500ms
        const m = value.match(/^(\d+)(ms|s|m|h|d)$/);
        if (m) {
            const n = Number(m[1]);
            const unit = m[2];
            const multipliers = {
                ms: 1,
                s: 1000,
                m: 60 * 1000,
                h: 60 * 60 * 1000,
                d: 24 * 60 * 60 * 1000
            };
            return n * (multipliers[unit] || 1);
        }
        // intento final: convertir a número (milisegundos)
        const num = Number(value);
        return Number.isFinite(num) ? num : NaN;
    }

    let maxAgeMs = parseDurationToMs(process.env.JWT_COOKIE_EXPIRATION);
    if (Number.isNaN(maxAgeMs)) {
        // Valor inválido: usar 1 día como fallback y avisar en logs
        console.warn('JWT_COOKIE_EXPIRATION inválido, usando 1 día por defecto');
        maxAgeMs = 24 * 60 * 60 * 1000;
    }

    const cookieOptions = {
        maxAge: maxAgeMs, // milisegundos
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'none'
    }
    
    console.log('🍪 Configurando cookie con opciones:', {
        ...cookieOptions,
        maxAge: `${cookieOptions.maxAge}ms (${(cookieOptions.maxAge/(24*60*60*1000)).toFixed(2)} días)`
    });
    console.log('🔑 Token JWT creado:', {
        length: token.length,
        parts: token.split('.').length,
        payload: jsonwebtoken.decode(token)
    });
    
    // Establecer cookie con múltiples estrategias para máxima compatibilidad
    const maxAgeSeconds = Math.floor(cookieOptions.maxAge / 1000);
    res.setHeader('Set-Cookie', [
        `jwt=${token}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=none`,
        `jwt=${token}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=lax`,
        `jwt=${token}; Path=/; Max-Age=${maxAgeSeconds}`
    ]);
    res.cookie("jwt", token, cookieOptions);
    
    console.log('✅ Login exitoso para usuario:', user);
    console.log('📤 Enviando respuesta con cookie establecida');
    res.send({
        status: "ok",
        message: "Login exitoso",
        redirect: "/perfil",
        debug: {
            cookieSet: true,
            tokenLength: token.length
        }
    });
}

async function register(req,res){
    console.log('📝 Intento de registro:', req.body);
    const user = req.body.user;
    const password = req.body.password;
    const email = req.body.email;
    const telefono = req.body.telefono;
    const comentarios = req.body.comentarios;
    const newsletter = req.body.newsletter === 'true' || req.body.newsletter === true;
    
    if(!user || !password || !email){
        return res.status(400).send({status:"Error",message:"Los campos están incompletos"})
    }
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await userQueries.findByUsername(user);
    if (!usuarioExistente.success) {
        console.error('❌ Error al verificar usuario:', usuarioExistente.error);
        return res.status(500).send({status:"Error",message:"Error del servidor"});
    }
    
    if (usuarioExistente.data.length > 0) {
        console.log('❌ Usuario ya existe:', user);
        return res.status(400).send({status:"Error",message:"Este usuario ya existe"});
    }
    
    // Verificar si el email ya existe
    const emailExistente = await userQueries.findByEmail(email);
    if (!emailExistente.success) {
        console.error('❌ Error al verificar email:', emailExistente.error);
        return res.status(500).send({status:"Error",message:"Error del servidor"});
    }
    
    if (emailExistente.data.length > 0) {
        console.log('❌ Email ya existe:', email);
        return res.status(400).send({status:"Error",message:"Este email ya está registrado"});
    }
    
    // Hashear contraseña
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);
    
    // Crear usuario en la base de datos
    const nuevoUsuario = {
        username: user,
        email: email,
        password: hashPassword,
        telefono: telefono,
        comentarios: comentarios,
        newsletter: newsletter
    };
    
    const resultado = await userQueries.createUser(nuevoUsuario);
    if (!resultado.success) {
        console.error('❌ Error al crear usuario:', resultado.error);
        return res.status(500).send({status:"Error",message:"Error al crear usuario"});
    }
    
    console.log('✅ Usuario creado exitosamente:', user);
    return res.status(201).send({
        status: "ok",
        message: `Usuario ${user} registrado exitosamente`,
        redirect: "/login"
    });
}

export const methods = {
    login,
    register
}