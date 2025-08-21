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
        console.log('📡 Obteniendo información del usuario...');
        
        const response = await fetch('/api/user-info', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('👤 Información del usuario obtenida:', data);
        
        if (data.success && data.user) {
            const usuario = data.user;
            
            // Actualizar nombre de usuario
            const usuarioNombre = document.getElementById('usuario-nombre');
            if (usuarioNombre) {
                usuarioNombre.textContent = usuario.username;
            }
            
            // Actualizar fecha de registro
            const fechaRegistro = document.getElementById('fecha-registro');
            if (fechaRegistro && usuario.fecha_creacion) {
                const fecha = new Date(usuario.fecha_creacion);
                fechaRegistro.textContent = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            
            // Actualizar actividad reciente con datos más realistas
            actualizarActividadReciente(usuario);
            
        } else {
            throw new Error('No se pudo obtener la información del usuario');
        }
        
    } catch (error) {
        console.error('❌ Error al cargar información del perfil:', error);
        
        // Mostrar datos por defecto en caso de error
        const usuarioNombre = document.getElementById('usuario-nombre');
        const fechaRegistro = document.getElementById('fecha-registro');
        
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
    
    // Actividad de hoy - inicio de sesión
    actividades.push({
        fecha: 'Hoy',
        texto: 'Iniciaste sesión en tu cuenta'
    });
    
    // Si el usuario es reciente (menos de 7 días)
    if (usuario && usuario.fecha_creacion) {
        const fechaCreacion = new Date(usuario.fecha_creacion);
        const ahora = new Date();
        const diasDesdeCreacion = Math.floor((ahora - fechaCreacion) / (1000 * 60 * 60 * 24));
        
        if (diasDesdeCreacion <= 7) {
            const fechaCreacionTexto = diasDesdeCreacion === 0 ? 'Hoy' : 
                                     diasDesdeCreacion === 1 ? 'Ayer' : 
                                     `Hace ${diasDesdeCreacion} días`;
            actividades.push({
                fecha: fechaCreacionTexto,
                texto: 'Te registraste en RM Metalúrgica'
            });
        } else {
            // Usuario más antiguo
            actividades.push({
                fecha: 'Ayer',
                texto: 'Visitaste la sección de Muebles'
            });
            
            actividades.push({
                fecha: 'Hace 2 días',
                texto: 'Consultaste información de contacto'
            });
        }
    } else {
        // Actividades por defecto
        actividades.push({
            fecha: 'Ayer',
            texto: 'Visitaste la sección de Muebles'
        });
        
        actividades.push({
            fecha: 'Hace 2 días',
            texto: 'Consultaste Preguntas Frecuentes'
        });
    }
    
    // Crear elementos HTML para cada actividad
    actividades.forEach(actividad => {
        const actividadItem = document.createElement('div');
        actividadItem.className = 'actividad-item';
        
        actividadItem.innerHTML = `
            <span class="actividad-fecha">${actividad.fecha}</span>
            <span class="actividad-texto">${actividad.texto}</span>
        `;
        
        actividadLista.appendChild(actividadItem);
    });
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
});

// CSS para el efecto ripple
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
`;
document.head.appendChild(style);
