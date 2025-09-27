document.addEventListener("DOMContentLoaded", () => {
    console.log("Script de login cargado");
    
    const formularioLogin = document.getElementById("login-form");
    console.log("Formulario de login encontrado:", formularioLogin);
    
    // Función helper para mostrar errores
    function mostrarError(mensaje) {
        let mensajeError = document.getElementById("mensaje-error");
        if (mensajeError) {
            mensajeError.textContent = mensaje;
            mensajeError.style.display = "block";
            mensajeError.style.color = "red";
        } else {
            alert(mensaje);
        }
    }
    
    function ocultarError() {
        let mensajeError = document.getElementById("mensaje-error");
        if (mensajeError) {
            mensajeError.style.display = "none";
        }
    }
    
    if (formularioLogin) {
        formularioLogin.addEventListener("submit", async (e) => { 
            console.log("Formulario de login enviado");
            e.preventDefault();
            
            const usuario = document.getElementById("user").value;
            const clave = document.getElementById("password").value;
            
            // Validación personalizada
            if (!usuario.trim()) {
                mostrarError("Por favor ingresa tu nombre de usuario");
                return;
            }
            
            if (!clave.trim()) {
                mostrarError("Por favor ingresa tu contraseña");
                return;
            }
            
            // Ocultar errores previos
            ocultarError();
            
            console.log("Datos de login:", { usuario, clave: "***" });

            try {
                const res = await fetch("/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ user: usuario, password: clave }),
                    credentials: 'include' // Forzar incluir cookies
                });
                
                console.log("Respuesta del servidor:", res.status, res.ok);
                
                if (!res.ok) {
                    const errorData = await res.json();
                    console.log("Error del servidor:", errorData);
                    
                    // Buscar el elemento de error (puede tener diferentes IDs)
                    let mensajeError = document.getElementById("mensaje-error") || 
                                    document.getElementById("error-general") ||
                                    document.querySelector(".error-message");
                    
                    if (mensajeError) {
                        mensajeError.textContent = errorData.message || "Error al iniciar sesión";
                        mensajeError.style.display = "block";
                        mensajeError.style.color = "red";
                    } else {
                        alert(errorData.message || "Error al iniciar sesión");
                    }
                    return;
                }
                
                const resJson = await res.json();
                console.log("Login exitoso:", resJson);
                
                // Actualizar navegación si la función existe
                if (typeof window.actualizarNavegacionDespuesLogin === 'function') {
                    window.actualizarNavegacionDespuesLogin();
                }
                
                // Registrar actividad de login exitoso
                if (typeof window.registrarActividadUsuario === 'function') {
                    window.registrarActividadUsuario('Iniciaste sesión exitosamente', '🔑');
                }
                
                // Esperar un poco para que la navegación se actualice
                setTimeout(() => {
                    if (resJson.redirect) {
                        window.location.href = resJson.redirect;
                    } else {
                        // Redirigir al perfil por defecto
                        window.location.href = "/perfil";
                    }
                }, 100);
            } catch (error) {
                console.log("Error en el fetch:", error);
                alert("Error de conexión con el servidor");
            }
        });
    } else {
        console.log("No se encontró el formulario de login");
    }
});
