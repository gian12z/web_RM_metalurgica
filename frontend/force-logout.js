// force-logout.js - Manejo de logout automático y verificación de token
console.log('🔧 force-logout.js cargado');

// Función para logout forzado
function forceLogout() {
    console.log('🚪 Ejecutando logout forzado...');
    
    // Eliminar tokens del almacenamiento local
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Hacer petición al backend para limpiar cookies
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        console.log('📤 Logout response:', response.status);
    }).catch(error => {
        console.error('❌ Error en logout:', error);
    }).finally(() => {
        // Redirigir al home independientemente del resultado
        window.location.href = '/';
    });
}

// Detectar si el token ha expirado
function checkTokenExpiration() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
                console.log('⏰ Token expirado, ejecutando logout...');
                forceLogout();
            }
        } catch (error) {
            console.error('❌ Error al verificar token:', error);
            forceLogout();
        }
    }
}

// Verificar estado de autenticación con el servidor
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth-status', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (!data.isAuthenticated && window.location.pathname === '/perfil') {
                console.log('🚫 Usuario no autenticado en ruta protegida');
                window.location.href = '/login';
            }
        }
    } catch (error) {
        console.error('❌ Error verificando auth status:', error);
    }
}

// Función pública para logout manual
window.logout = function() {
    forceLogout();
};

// Verificar token al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    checkTokenExpiration();
    checkAuthStatus();
});

// Verificar token periódicamente (cada 30 segundos)
setInterval(() => {
    checkTokenExpiration();
    checkAuthStatus();
}, 30000);