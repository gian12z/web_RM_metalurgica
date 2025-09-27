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

// Función para obtener y mostrar información del usuario
async function cargarInformacionPerfil() {
    try {
        console.log('� Iniciando carga de información del perfil...');
        console.log('�📡 Obteniendo información del usuario...');
        
        const response = await fetch('/api/user-info', {
            credentials: 'include'
        });
        
        console.log('📥 Respuesta recibida:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('👤 Información del usuario obtenida:', data);
        
        if (data.success && data.user) {
            const usuario = data.user;
            console.log('📅 Datos de usuario completos:', usuario);
            console.log('📅 Fecha de creación específica:', usuario.fecha_creacion);
            
            // Actualizar título del perfil con el nombre del usuario
            const perfilTitulo = document.getElementById('perfil-titulo');
            console.log('🎯 Elemento perfil-titulo encontrado:', perfilTitulo);
            if (perfilTitulo && usuario.username) {
                console.log('✏️ Cambiando título a:', usuario.username);
                perfilTitulo.textContent = usuario.username;
                // Actualizar también la descripción para personalizarla
                const perfilBienvenida = document.querySelector('.perfil-bienvenida');
                if (perfilBienvenida) {
                    console.log('✏️ Cambiando mensaje de bienvenida');
                    perfilBienvenida.textContent = `Bienvenido/a ${usuario.username} a tu perfil de RM Metalúrgica`;
                }
            }
            
            // Actualizar nombre de usuario
            const usuarioNombre = document.getElementById('usuario-nombre');
            console.log('🎯 Elemento usuario-nombre encontrado:', usuarioNombre);
            if (usuarioNombre) {
                console.log('✏️ Cambiando nombre de usuario a:', usuario.username);
                usuarioNombre.textContent = usuario.username;
            }
            
            // Actualizar fecha de registro
            const fechaRegistro = document.getElementById('fecha-registro');
            console.log('🎯 Elemento fecha-registro encontrado:', fechaRegistro);
            if (fechaRegistro && usuario.fecha_creacion) {
                console.log('📅 Procesando fecha:', usuario.fecha_creacion);
                try {
                    // Crear fecha desde el string de la base de datos
                    const fecha = new Date(usuario.fecha_creacion);
                    
                    // Verificar que la fecha es válida
                    if (!isNaN(fecha.getTime())) {
                        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        console.log('✏️ Cambiando fecha a:', fechaFormateada);
                        fechaRegistro.textContent = fechaFormateada;
                    } else {
                        console.error('Fecha inválida recibida:', usuario.fecha_creacion);
                        fechaRegistro.textContent = 'Fecha no válida';
                    }
                } catch (error) {
                    console.error('Error al formatear fecha:', error);
                    fechaRegistro.textContent = 'Error en formato de fecha';
                }
            } else if (fechaRegistro) {
                console.log('No se recibió fecha de creación:', usuario.fecha_creacion);
                fechaRegistro.textContent = 'No disponible';
            }
            
            // Actualizar actividad reciente con datos más realistas
            actualizarActividadReciente(usuario);
            
        } else {
            throw new Error('No se pudo obtener la información del usuario');
        }
        
    } catch (error) {
        console.error('❌ Error al cargar información del perfil:', error);
        
        // Mostrar datos por defecto en caso de error
        const perfilTitulo = document.getElementById('perfil-titulo');
        const usuarioNombre = document.getElementById('usuario-nombre');
        const fechaRegistro = document.getElementById('fecha-registro');
        const perfilBienvenida = document.querySelector('.perfil-bienvenida');
        
        if (perfilTitulo) perfilTitulo.textContent = 'Mi Perfil';
        if (perfilBienvenida) perfilBienvenida.textContent = 'Bienvenido/a a tu perfil de RM Metalúrgica';
        if (usuarioNombre) usuarioNombre.textContent = 'Usuario';
        if (fechaRegistro) fechaRegistro.textContent = 'No disponible';
        
        // Actividad por defecto
        actualizarActividadReciente(null);
    }
}

// Función para actualizar la actividad reciente
function actualizarActividadReciente(usuario) {
    const actividadLista = document.querySelector('.actividad-lista');
    if (!actividadLista) return;
    
    // Limpiar actividad existente
    actividadLista.innerHTML = '';
    
    // Crear actividades realistas basadas en la información del usuario
    const actividades = [];
    const ahora = new Date();
    
    // Obtener actividades del localStorage (navegación del usuario)
    const actividadesGuardadas = obtenerActividadesUsuario();
    
    // Actividad de hoy - inicio de sesión (solo si no hay actividades recientes)
    if (actividadesGuardadas.length === 0) {
        actividades.push({
            fecha: 'Hace un momento',
            texto: 'Iniciaste sesión en tu cuenta',
            icono: '🔑'
        });
    }
    
    // Agregar actividades del localStorage si existen
    if (actividadesGuardadas.length > 0) {
        actividadesGuardadas.forEach(act => actividades.push(act));
    }
    
    // Si el usuario es reciente (menos de 7 días), agregar actividad de registro
    if (usuario && usuario.fecha_creacion) {
        const fechaCreacion = new Date(usuario.fecha_creacion);
        const diasDesdeCreacion = Math.floor((ahora - fechaCreacion) / (1000 * 60 * 60 * 24));
        
        if (diasDesdeCreacion <= 7) {
            const fechaCreacionTexto = diasDesdeCreacion === 0 ? 'Hoy' : 
                                     diasDesdeCreacion === 1 ? 'Ayer' : 
                                     `Hace ${diasDesdeCreacion} días`;
            actividades.push({
                fecha: fechaCreacionTexto,
                texto: 'Te registraste en RM Metalúrgica',
                icono: '🎉'
            });
        }
    }
    
    // Si no hay actividades, mostrar actividades por defecto
    if (actividades.length === 0) {
        actividades.push({
            fecha: 'Hace un momento',
            texto: 'Accediste a tu perfil',
            icono: '�'
        });
        
        actividades.push({
            fecha: 'Hoy',
            texto: 'Visitaste la página principal',
            icono: '🏠'
        });
    }
    
    // Limitar a máximo 5 actividades y ordenar por timestamp si existe
    const actividadesOrdenadas = actividades.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp; // Más reciente primero
        }
        return 0;
    });
    const actividadesLimitadas = actividadesOrdenadas.slice(0, 5);
    
    // Crear elementos HTML para cada actividad
    actividadesLimitadas.forEach((actividad, index) => {
        const actividadItem = document.createElement('div');
        actividadItem.className = 'actividad-item';
        actividadItem.style.animationDelay = `${index * 0.1}s`;
        
        actividadItem.innerHTML = `
            <span class="actividad-icono">${actividad.icono || '📋'}</span>
            <div class="actividad-info">
                <span class="actividad-fecha">${actividad.fecha}</span>
                <span class="actividad-texto">${actividad.texto}</span>
            </div>
        `;
        
        actividadLista.appendChild(actividadItem);
    });
    
    // Agregar animación de entrada
    actividadLista.classList.add('actividades-cargadas');
    
    // Registrar la visita al perfil
    if (typeof window.registrarActividadUsuario === 'function') {
        window.registrarActividadUsuario('Accediste a tu perfil', '👤');
    }
}

// Función para obtener actividades del usuario desde localStorage
function obtenerActividadesUsuario() {
    try {
        const actividades = JSON.parse(localStorage.getItem('actividadesUsuario') || '[]');
        return actividades.slice(0, 3); // Máximo 3 actividades guardadas
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        return [];
    }
}

// Función para guardar una nueva actividad
function guardarActividad(texto, icono = '📋') {
    try {
        const actividades = obtenerActividadesUsuario();
        const ahora = new Date();
        const hoy = ahora.toDateString();
        
        // Determinar el texto de fecha
        let fechaTexto = 'Hace un momento';
        const minutosTranscurridos = Math.floor((ahora - new Date(ahora.toDateString())) / (1000 * 60));
        
        if (minutosTranscurridos < 60) {
            fechaTexto = 'Hace un momento';
        } else if (minutosTranscurridos < 1440) { // Menos de 24 horas
            const horas = Math.floor(minutosTranscurridos / 60);
            fechaTexto = horas === 1 ? 'Hace 1 hora' : `Hace ${horas} horas`;
        }
        
        const nuevaActividad = {
            fecha: fechaTexto,
            texto: texto,
            icono: icono,
            timestamp: ahora.getTime()
        };
        
        // Evitar duplicados recientes (mismo texto en las últimas 2 horas)
        const dosHorasAtras = ahora.getTime() - (2 * 60 * 60 * 1000);
        const actividadesFiltradas = actividades.filter(act => 
            !(act.texto === texto && act.timestamp && act.timestamp > dosHorasAtras)
        );
        
        // Agregar nueva actividad al inicio
        actividadesFiltradas.unshift(nuevaActividad);
        
        // Mantener solo las últimas 3 actividades
        const actividadesLimitadas = actividadesFiltradas.slice(0, 3);
        
        localStorage.setItem('actividadesUsuario', JSON.stringify(actividadesLimitadas));
        
        console.log('💾 Actividad guardada:', nuevaActividad);
        
    } catch (error) {
        console.error('Error al guardar actividad:', error);
    }
}

// Función para cerrar sesión
async function cerrarSesion() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            // Limpiar storage local
            localStorage.clear();
            sessionStorage.clear();
            
            // Redireccionar al home
            window.location.href = '/';
        } else {
            console.error('Error en logout');
            alert('Error al cerrar sesión. Por favor, intenta nuevamente.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión. Por favor, intenta nuevamente.');
    }
}

// Función para configurar acciones
function configurarAcciones() {
    console.log('🔧 Configurando acciones...');
    
    // Contactar Soporte - Redirigir a WhatsApp
    const btnSoporte = document.getElementById('btn-soporte');
    if (btnSoporte) {
        btnSoporte.addEventListener('click', () => {
            const mensaje = 'Hola! Me comunico desde la página web de RM Metalúrgica. Necesito ayuda con mi cuenta.';
            const telefono = '5492914447897'; // Número de WhatsApp argentino (+54 9 291 444-7897)
            const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
    
    // Cerrar Sesión - Enfoque más robusto
    const btnLogout = document.getElementById('btn-logout');
    console.log('🔍 Botón logout encontrado en perfil.js:', btnLogout);
    
    if (btnLogout) {
        console.log('✅ Agregando event listener al botón logout en perfil.js');
        
        // Remover cualquier event listener previo
        btnLogout.replaceWith(btnLogout.cloneNode(true));
        const newBtnLogout = document.getElementById('btn-logout');
        
        newBtnLogout.addEventListener('click', async function(e) {
            console.log('🖱️ Click detectado en botón logout (perfil.js)');
            e.preventDefault();
            e.stopPropagation();
            
            console.log('💭 Mostrando confirmación personalizada...');
            const confirmResult = await mostrarModalConfirmacion(
                '¿Estás seguro de que quieres cerrar sesión?',
                'Cerrar Sesión'
            );
            console.log('💭 Resultado de confirmación:', confirmResult);
            
            if (confirmResult) {
                console.log('✅ Usuario confirmó logout, ejecutando cerrarSesion()...');
                cerrarSesion();
            } else {
                console.log('❌ Usuario canceló el logout');
            }
        });
        
        console.log('✅ Event listener agregado exitosamente');
    } else {
        console.error('❌ No se encontró el botón logout en perfil.js');
    }
}

// Función para agregar efectos visuales
function agregarEfectosVisuales() {
    // Efecto de hover para las cards
    const cards = document.querySelectorAll('.info-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Efecto de click para botones de acción
    const botones = document.querySelectorAll('.btn-accion');
    botones.forEach(boton => {
        boton.addEventListener('click', function(e) {
            // Efecto de ondas
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Función para verificar autenticación
function verificarAutenticacion() {
    // En una implementación real, verificarías el JWT aquí
    // Por ahora, asumimos que el middleware ya verificó la autenticación
    console.log('Usuario autenticado correctamente');
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 perfil.js DOMContentLoaded ejecutado');
    verificarAutenticacion();
    cargarInformacionPerfil();
    configurarAcciones();
    agregarEfectosVisuales();
    
    // Actualizar actividad cada 30 segundos para reflejar cambios
    setInterval(() => {
        const actividadesActuales = obtenerActividadesUsuario();
        if (actividadesActuales.length > 0) {
            // Solo actualizar la sección de actividades sin recargar todo el perfil
            actualizarSoloActividades();
        }
    }, 30000); // 30 segundos
});

// Función para actualizar solo las actividades sin recargar toda la información del perfil
function actualizarSoloActividades() {
    const actividadLista = document.querySelector('.actividad-lista');
    if (!actividadLista) return;
    
    const actividadesGuardadas = obtenerActividadesUsuario();
    if (actividadesGuardadas.length === 0) return;
    
    // Limpiar y recargar solo las actividades
    actividadLista.innerHTML = '';
    
    actividadesGuardadas.forEach((actividad, index) => {
        const actividadItem = document.createElement('div');
        actividadItem.className = 'actividad-item';
        actividadItem.style.animationDelay = `${index * 0.1}s`;
        
        actividadItem.innerHTML = `
            <span class="actividad-icono">${actividad.icono || '📋'}</span>
            <div class="actividad-info">
                <span class="actividad-fecha">${actividad.fecha}</span>
                <span class="actividad-texto">${actividad.texto}</span>
            </div>
        `;
        
        actividadLista.appendChild(actividadItem);
    });
    
    actividadLista.classList.add('actividades-cargadas');
}

// CSS para el efecto ripple y actividades mejoradas
const style = document.createElement('style');
style.textContent = `
    .btn-accion {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    /* Estilos mejorados para actividades */
    .actividad-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #eee;
        opacity: 0;
        transform: translateY(20px);
        animation: slideInActivity 0.5s ease forwards;
    }
    
    .actividad-item:last-child {
        border-bottom: none;
    }
    
    .actividad-icono {
        font-size: 1.2em;
        margin-right: 12px;
        width: 24px;
        text-align: center;
    }
    
    .actividad-info {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    
    .actividad-fecha {
        font-size: 0.85em;
        color: #666;
        font-weight: 600;
        margin-bottom: 2px;
    }
    
    .actividad-texto {
        font-size: 0.9em;
        color: #333;
        line-height: 1.3;
    }
    
    .actividad-cargando {
        text-align: center;
        padding: 20px;
        color: #666;
        font-style: italic;
    }
    
    .actividades-cargadas .actividad-cargando {
        display: none;
    }
    
    @keyframes slideInActivity {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Responsive para actividades */
    @media (max-width: 768px) {
        .actividad-item {
            padding: 10px 0;
        }
        
        .actividad-icono {
            font-size: 1em;
            margin-right: 8px;
            width: 20px;
        }
        
        .actividad-fecha {
            font-size: 0.8em;
        }
        
        .actividad-texto {
            font-size: 0.85em;
        }
    }
`;
document.head.appendChild(style);
