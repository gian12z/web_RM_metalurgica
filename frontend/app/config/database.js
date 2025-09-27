import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la conexión a MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'rm_metalurgica'
};

// Pool de conexiones
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para testear la conexión
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL exitosa');
        connection.release();
        return { success: true, message: 'Conexión exitosa' };
    } catch (error) {
        console.error('❌ Error al conectar con MySQL:', error.message);
        return { success: false, error: error.message };
    }
}

// Funciones para usuarios
export const userQueries = {
    // Buscar usuario por nombre de usuario
    async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM usuarios WHERE nombre_usuario = ?',
                [username]
            );
            return { success: true, data: rows };
        } catch (error) {
            console.error('❌ Error al buscar usuario:', error);
            return { success: false, error: error.message };
        }
    },

    // Buscar usuario por email
    async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM usuarios WHERE email = ?',
                [email]
            );
            return { success: true, data: rows };
        } catch (error) {
            console.error('❌ Error al buscar usuario por email:', error);
            return { success: false, error: error.message };
        }
    },

    // Crear nuevo usuario
    async createUser(userData) {
        try {
            const { username, email, password, telefono, comentarios, newsletter } = userData;
            const [result] = await pool.execute(
                'INSERT INTO usuarios (nombre_usuario, email, contrasena, telefono, comentarios, recibir_novedades) VALUES (?, ?, ?, ?, ?, ?)',
                [username, email, password, telefono || null, comentarios || null, newsletter || false]
            );
            return { success: true, userId: result.insertId };
        } catch (error) {
            console.error('❌ Error al crear usuario:', error);
            return { success: false, error: error.message };
        }
    },

    // Obtener todos los usuarios
    async getAllUsers() {
        try {
            const [rows] = await pool.execute('SELECT id, nombre_usuario, email, telefono, recibir_novedades, fecha_registro FROM usuarios');
            return { success: true, data: rows };
        } catch (error) {
            console.error('❌ Error al obtener usuarios:', error);
            return { success: false, error: error.message };
        }
    },

    // Actualizar usuario
    async updateUser(userId, userData) {
        try {
            const { username, email, telefono, comentarios, newsletter } = userData;
            const [result] = await pool.execute(
                'UPDATE usuarios SET nombre_usuario = ?, email = ?, telefono = ?, comentarios = ?, recibir_novedades = ? WHERE id = ?',
                [username, email, telefono, comentarios, newsletter, userId]
            );
            return { success: true, affectedRows: result.affectedRows };
        } catch (error) {
            console.error('❌ Error al actualizar usuario:', error);
            return { success: false, error: error.message };
        }
    },

    // Eliminar usuario
    async deleteUser(userId) {
        try {
            const [result] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [userId]);
            return { success: true, affectedRows: result.affectedRows };
        } catch (error) {
            console.error('❌ Error al eliminar usuario:', error);
            return { success: false, error: error.message };
        }
    }
};

export default pool;
