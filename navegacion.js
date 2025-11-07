// Sistema de navegación dinámico para RM Metalúrgica
// Este script maneja la navegación que cambia según el estado de autenticación del usuario

console.log('🚀 navegacion.js cargado correctamente');

// Función para verificar si el usuario está autenticado
function estaAutenticado() {
    // Verifica si existe una cookie JWT válida
    const cookies = document.cookie.split(';');
    const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
    
    if (!jwtCookie) {
        console.log('🍪 No se encontró cookie JWT');
        return false;
    }
    
    // Obtener el valor de la cookie
    const token = jwtCookie.split('=')[1];
    
    // Verificar que el token no esté vacío
    if (!token || token.trim() === '' || token === 'undefined' || token === 'null') {
        console.log('🍪 Token JWT vacío o inválido:', token);
        // Eliminar cookie corrupta inmediatamente
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        return false;
    }
    
    // Verificación básica de estructura JWT (debe tener 3 partes separadas por puntos)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        console.log('🍪 Token JWT con estructura inválida');
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        return false;
    }
    
    try {
        // Intentar decodificar el payload para verificar expiración
        const payload = JSON.parse(atob(tokenParts[1]));
        
        // Verificar si el token ha expirado
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            console.log('🕒 Token expirado, eliminando cookie...');
            // Eliminar cookie expirada
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            return false;
        }
        
        console.log('✅ Token JWT válido encontrado');
        return true;
    } catch (error) {
        console.error('❌ Error al verificar token:', error);
        // Si hay error al decodificar, eliminar la cookie corrupta
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        return false;
    }
}

// Función para mostrar modal de confirmación personalizado
function mostrarModalConfirmacion(mensaje, titulo = 'Confirmación') {
    return new Promise((resolve) => {
        // Crear el modal
        const modalHTML = `
            <div class="modal-overlay" id="modalConfirmacion">
                <div class="modal-content">
                    <div class="modal-icon">🚪</div>
                    <div class="modal-title">${titulo}</div>
                    <div class="modal-message">${mensaje}</div>
                    <div class="modal-buttons">
                        <button class="modal-btn modal-btn-cancel" id="modalCancelar">Cancelar</button>
                        <button class="modal-btn modal-btn-confirm" id="modalConfirmar">Aceptar</button>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar el modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('modalConfirmacion');
        const btnConfirmar = document.getElementById('modalConfirmar');
        const btnCancelar = document.getElementById('modalCancelar');
        
        // Mostrar el modal con animación
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Función para cerrar el modal
        const cerrarModal = (resultado) => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                resolve(resultado);
            }, 300);
        };
        
        // Event listeners
        btnConfirmar.addEventListener('click', () => cerrarModal(true));
        btnCancelar.addEventListener('click', () => cerrarModal(false));
        
        // Cerrar con ESC
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleKeydown);
                cerrarModal(false);
            }
        };
        document.addEventListener('keydown', handleKeydown);
        
        // Cerrar al hacer click fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModal(false);
            }
        });
    });
}

// Función para obtener el nombre del usuario desde el token JWT
function obtenerNombreUsuario() {
    if (!estaAutenticado()) {
        return null;
    }
    
    const cookies = document.cookie.split(';');
    const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
    
    if (jwtCookie) {
        try {
            const token = jwtCookie.split('=')[1];
            const tokenParts = token.split('.');
            
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                return payload.user || 'Usuario';
            }
        } catch (error) {
            console.error('Error al decodificar token:', error);
            // Si hay error, eliminar cookie corrupta
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    }
    return null;
}

// Función para crear elementos del menú para usuarios no autenticados
function crearMenuPublico() {
    return `
        <div class="nav-auth">
            <a href="/login" class="auth-btn">Iniciar Sesión</a>
        </div>
    `;
}

// Función para crear elementos del menú para usuarios autenticados
function crearMenuAutenticado(nombreUsuario) {
    return `
        <div class="nav-auth">
            <div class="user-dropdown">
                <a href="#" class="user-menu-toggle">
                    👤 ${nombreUsuario} <span class="dropdown-arrow">▼</span>
                </a>
                <div class="dropdown-menu">
                    <a href="/perfil" class="dropdown-item">Mi Perfil</a>
                    <a href="#" class="dropdown-item" id="logout-btn">Cerrar Sesión</a>
                </div>
            </div>
        </div>
    `;
}

// Función para actualizar la navegación
function actualizarNavegacion() {
    const navBar = document.querySelector('.nav-bar');
    
    if (!navBar) {
        console.warn('Elemento nav-bar no encontrado');
        return;
    }

    // Crear estructura base si está vacía
    if (navBar.innerHTML.trim() === '') {
        navBar.innerHTML = `
            <div class="nav-logo">
                <img src="/imagenes_RM/LogoRM.ico" alt="Logo RM">
            </div>
            <ul class="nav-menu">
                <li><a href="/">Inicio</a></li>
                <li><a href="/muebles">Trabajos</a></li>
                <li><a href="/preguntas-frecuentes">Preguntas frecuentes</a></li>
            </ul>
        `;
    }

    // Eliminar elementos de autenticación existentes
    const elementosAuth = navBar.querySelectorAll('.nav-auth, .user-dropdown');
    elementosAuth.forEach(elemento => elemento.remove());

    if (estaAutenticado()) {
        const nombreUsuario = obtenerNombreUsuario();
        navBar.insertAdjacentHTML('beforeend', crearMenuAutenticado(nombreUsuario));
        
        // Configurar funcionalidad del dropdown
        configurarDropdown();
        
        // Configurar botón de logout
        configurarLogout();
    } else {
        navBar.insertAdjacentHTML('beforeend', crearMenuPublico());
    }
}

// Función para configurar el dropdown del usuario
function configurarDropdown() {
    const userToggle = document.querySelector('.user-menu-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (userToggle && dropdownMenu) {
        userToggle.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownMenu.classList.toggle('show');
        });

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
}

// Función para eliminar completamente todas las cookies JWT
function eliminarTodasLasCookiesJWT() {
    // Múltiples intentos de eliminación con diferentes configuraciones
    const metodosEliminacion = [
        "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;",
        "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;",
        "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;",
        "jwt=; max-age=0; path=/;",
        "jwt=; max-age=0; path=/; domain=localhost;",
        "jwt=; max-age=0; path=/; domain=.localhost;",
        "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;",
        "jwt=; max-age=0; path=/; SameSite=Lax;"
    ];
    
    metodosEliminacion.forEach(metodo => {
        document.cookie = metodo;
    });
    
    // Verificación adicional - eliminar TODAS las cookies que contengan 'jwt'
    document.cookie.split(";").forEach(function(c) { 
        const cookie = c.trim();
        if (cookie.indexOf('jwt') === 0) {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost";
        }
    });
    
    console.log('🧹 Todas las cookies JWT eliminadas desde navegacion.js');
}

// Función para configurar el botón de logout
function configurarLogout() {
    console.log('🔧 Configurando botón de logout...');
    
    // Buscar tanto el botón del dropdown como el de la página de perfil
    const logoutBtnDropdown = document.getElementById('logout-btn');
    const logoutBtnPerfil = document.getElementById('btn-logout');
    
    console.log('🔍 Botón logout dropdown encontrado:', logoutBtnDropdown);
    console.log('🔍 Botón logout perfil encontrado:', logoutBtnPerfil);
    
    // Función unificada para manejar el logout (misma lógica que perfil.js)
    const manejarLogoutUnificado = async (e) => {
        console.log('🖱️ Click en botón logout detectado desde navegación');
        e.preventDefault();
        e.stopPropagation();
        
        // Usar modal personalizado en lugar de confirm()
        const confirmResult = await mostrarModalConfirmacion(
            '¿Estás seguro de que quieres cerrar sesión?',
            'Cerrar Sesión'
        );
        
        if (confirmResult) {
            // Usar la función más agresiva de logout si está disponible (igual que perfil.js)
            if (typeof window.forzarLogoutCompleto === 'function') {
                console.log('🔥 Usando logout forzado completo desde navegación');
                window.forzarLogoutCompleto();
                return;
            }
            
            // Fallback al método anterior (igual que perfil.js)
            console.log('⚠️ Usando logout tradicional como fallback desde navegación');
            try {
                console.log('📡 Enviando petición de logout desde navegación...');
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('📥 Respuesta del servidor desde navegación:', response.status);
                
                if (response.ok) {
                    console.log('✅ Logout exitoso desde navegación, realizando limpieza completa...');
                    
                    // Eliminar todas las cookies JWT de manera agresiva
                    eliminarTodasLasCookiesJWT();
                    
                    // Limpiar localStorage y sessionStorage completamente
                    try {
                        localStorage.clear();
                        sessionStorage.clear();
                        console.log('🧹 Storage limpiado desde navegación');
                    } catch (e) {
                        console.log('⚠️ Error limpiando storage:', e);
                    }
                    
                    // Limpiar cache del navegador si es posible
                    if ('caches' in window) {
                        caches.keys().then(names => {
                            names.forEach(name => {
                                caches.delete(name);
                            });
                        });
                    }
                    
                    console.log('🔄 Forzando recarga completa desde navegación...');
                    
                    // Verificar que la cookie fue eliminada
                    setTimeout(() => {
                        const cookies = document.cookie;
                        console.log('🍪 Cookies después del logout:', cookies);
                        
                        // Actualizar navegación si la función existe
                        if (typeof window.actualizarNavegacionDespuesLogin === 'function') {
                            window.actualizarNavegacionDespuesLogin();
                        }
                        
                        // Método más agresivo: reemplazar la URL completamente
                        const timestamp = new Date().getTime();
                        const randomParam = Math.random().toString(36).substring(7);
                        
                        // Forzar recarga con parámetros únicos para evitar cache
                        window.location.replace(`/?logout=${timestamp}&r=${randomParam}`);
                        
                        // Backup: si replace no funciona, usar href
                        setTimeout(() => {
                            window.location.href = `/?logout=${timestamp}&r=${randomParam}`;
                        }, 100);
                        
                    }, 500);
                    
                } else {
                    console.error('❌ Error al cerrar sesión desde navegación');
                    alert('Error al cerrar sesión. Por favor, intenta nuevamente.');
                }
            } catch (error) {
                console.error('❌ Error desde navegación:', error);
                alert('Error de conexión. Por favor, intenta nuevamente.');
            }
        } else {
            console.log('❌ Usuario canceló el logout');
        }
    };
    
    // Agregar event listener al botón del dropdown si existe
    if (logoutBtnDropdown) {
        console.log('✅ Agregando event listener al botón logout del dropdown');
        // Remover cualquier event listener previo
        logoutBtnDropdown.replaceWith(logoutBtnDropdown.cloneNode(true));
        const newLogoutBtnDropdown = document.getElementById('logout-btn');
        newLogoutBtnDropdown.addEventListener('click', manejarLogoutUnificado);
    }
    
    // No agregar event listener al botón de perfil si estamos en perfil, 
    // ya que perfil.js se encarga de eso
    if (logoutBtnPerfil && window.location.pathname !== '/perfil') {
        console.log('✅ Agregando event listener al botón logout del perfil (fuera de página perfil)');
        // Remover cualquier event listener previo
        logoutBtnPerfil.replaceWith(logoutBtnPerfil.cloneNode(true));
        const newLogoutBtnPerfil = document.getElementById('btn-logout');
        newLogoutBtnPerfil.addEventListener('click', manejarLogoutUnificado);
    }
    
    if (!logoutBtnDropdown && !logoutBtnPerfil) {
        console.log('⚠️ No se encontraron botones de logout para configurar');
    }
}

// Función para agregar estilos CSS al dropdown
function agregarEstilosDropdown() {
    const style = document.createElement('style');
    style.textContent = `
        .nav-auth {
            display: flex;
            align-items: center;
        }
        
        .auth-btn {
            color: white !important;
            text-decoration: none !important;
            padding: 8px 16px !important;
            border-radius: 5px !important;
            transition: background-color 0.3s ease !important;
            background-color: #007bff !important;
        }
        
        .auth-btn:hover {
            background-color: #0056b3 !important;
        }
        
        .user-dropdown {
            position: relative;
        }
        
        .user-menu-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            color: white !important;
            text-decoration: none !important;
            padding: 8px 16px !important;
            border-radius: 5px !important;
            transition: background-color 0.3s ease !important;
        }
        
        .user-menu-toggle:hover {
            background-color: #444 !important;
        }
        
        .dropdown-arrow {
            transition: transform 0.3s ease;
            font-size: 0.8rem;
        }
        
        .user-dropdown:hover .dropdown-arrow {
            transform: rotate(180deg);
        }
        
        .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: #0e0f0f;
            border: 1px solid #333;
            border-radius: 8px;
            min-width: 180px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            margin-top: 10px;
        }
        
        .dropdown-menu.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .dropdown-item {
            display: block;
            padding: 12px 16px;
            color: white;
            text-decoration: none;
            transition: background-color 0.3s ease;
            border-bottom: 1px solid #333;
        }
        
        .dropdown-item:last-child {
            border-bottom: none;
        }
        
        .dropdown-item:hover {
            background-color: #333;
        }
        
        @media (max-width: 768px) {
            .nav-bar {
                flex-direction: column !important;
                gap: 1rem !important;
                padding: 15px 10px !important;
            }
            
            .nav-menu {
                justify-content: center !important;
                flex-wrap: wrap;
            }
            
            .nav-auth {
                width: 100%;
                justify-content: center;
            }
            
            .dropdown-menu {
                position: static;
                box-shadow: none;
                border: none;
                background: #1a1a1a;
                margin-top: 10px;
                border-radius: 0;
            }
            
            .user-dropdown {
                width: 100%;
            }
            
            .dropdown-menu.show {
                display: block;
            }
        }
    `;
    document.head.appendChild(style);
}

// Función para limpiar cookies corruptas o expiradas
function limpiarCookiesInvalidas() {
    const cookies = document.cookie.split(';');
    const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
    
    if (jwtCookie) {
        const token = jwtCookie.split('=')[1];
        
        // Si el token está vacío o es inválido
        if (!token || token.trim() === '') {
            console.log('🧹 Eliminando cookie JWT vacía...');
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            return;
        }
        
        // Verificar estructura del token
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            console.log('🧹 Eliminando cookie JWT con estructura inválida...');
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            return;
        }
        
        try {
            // Verificar si el token está expirado
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                console.log('🧹 Eliminando cookie JWT expirada...');
                document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        } catch (error) {
            console.log('🧹 Eliminando cookie JWT corrupta...');
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 DOM cargado, inicializando navegación...');
    
    // Limpiar cookies inválidas primero
    limpiarCookiesInvalidas();
    
    agregarEstilosDropdown();
    actualizarNavegacion();
    
    // Configurar logout siempre (tanto para dropdown como para botón estático)
    console.log('🔧 Configurando logout desde DOMContentLoaded...');
    configurarLogout();
    
    // Registrar actividad de página visitada
    registrarActividadPagina();
});

// Función para registrar actividad del usuario
function registrarActividadUsuario(texto, icono = '📋') {
    // Solo registrar si el usuario está autenticado
    if (!estaAutenticado()) return;
    
    try {
        const actividades = JSON.parse(localStorage.getItem('actividadesUsuario') || '[]');
        const ahora = new Date();
        
        // Determinar el texto de fecha
        let fechaTexto = 'Hace un momento';
        
        const nuevaActividad = {
            fecha: fechaTexto,
            texto: texto,
            icono: icono,
            timestamp: ahora.getTime()
        };
        
        // Evitar duplicados recientes (mismo texto en las últimas 30 minutos)
        const treintaMinutosAtras = ahora.getTime() - (30 * 60 * 1000);
        const actividadesFiltradas = actividades.filter(act => 
            !(act.texto === texto && act.timestamp && act.timestamp > treintaMinutosAtras)
        );
        
        // Agregar nueva actividad al inicio
        actividadesFiltradas.unshift(nuevaActividad);
        
        // Mantener solo las últimas 3 actividades
        const actividadesLimitadas = actividadesFiltradas.slice(0, 3);
        
        localStorage.setItem('actividadesUsuario', JSON.stringify(actividadesLimitadas));
        
        console.log('📝 Actividad registrada:', nuevaActividad);
        
    } catch (error) {
        console.error('Error al registrar actividad:', error);
    }
}

// Función para registrar actividad según la página actual
function registrarActividadPagina() {
    if (!estaAutenticado()) return;
    
    const path = window.location.pathname;
    const pagina = window.location.href;
    
    // Determinar actividad según la página
    if (path === '/' || path === '/index.html') {
        registrarActividadUsuario('Visitaste la página principal', '🏠');
    } else if (path.includes('/muebles') || path.includes('muebles')) {
        if (path === '/muebles' || path.includes('muebles.html')) {
            registrarActividadUsuario('Exploraste el catálogo de muebles', '🛋️');
        } else if (path.includes('mesa_ratona')) {
            registrarActividadUsuario('Viste información de mesas ratonas', '🪑');
        } else if (path.includes('escritorio')) {
            registrarActividadUsuario('Consultaste escritorios disponibles', '💻');
        } else if (path.includes('estanteria')) {
            registrarActividadUsuario('Exploraste estanterías', '📚');
        } else if (path.includes('barra')) {
            registrarActividadUsuario('Viste barras y banquetas', '🍺');
        } else {
            registrarActividadUsuario('Exploraste productos específicos', '🛋️');
        }
    } else if (path.includes('/preguntas') || path.includes('pfrecuentes')) {
        registrarActividadUsuario('Consultaste preguntas frecuentes', '❓');
    } else if (path.includes('/perfil')) {
        registrarActividadUsuario('Accediste a tu perfil', '👤');
    } else if (path.includes('/login') || path.includes('sesion_login')) {
        // No registrar login aquí, se registra desde el script de login
    } else if (path.includes('/register') || path.includes('sesion.html')) {
        // No registrar registro aquí, se registra desde el script de registro
    }
}

// Función global para actualizar navegación después del login
window.actualizarNavegacionDespuesLogin = actualizarNavegacion;

// Función global para registrar actividades (para usar desde otros scripts)
window.registrarActividadUsuario = registrarActividadUsuario;

// Escuchar cambios en las cookies (para detectar login/logout)
let cookieAnterior = document.cookie;
setInterval(() => {
    if (document.cookie !== cookieAnterior) {
        cookieAnterior = document.cookie;
        actualizarNavegacion();
    }
}, 1000);
