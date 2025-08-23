
document.addEventListener("DOMContentLoaded", () => {
    console.log("Script cargado correctamente");
    
    const mensajeError = document.getElementById("mensaje-error");
    console.log("mensajeError encontrado:", mensajeError);

    const formulario = document.getElementById("register-form");
    console.log("formulario encontrado:", formulario);

    if (formulario) {
        formulario.addEventListener("submit", async (e) => {
            console.log("¡Formulario enviado!");
            e.preventDefault();

            // Ocultar mensaje de error previo
            if (mensajeError) {
                mensajeError.style.display = "none";
                mensajeError.style.color = "red"; // Resetear color
            }

            const usuario = document.getElementById("usuario").value;
            const email = document.getElementById("email").value;
            const clave = document.getElementById("clave").value;
            const telefono = document.getElementById("telefono").value;
            const comentarios = document.getElementById("comentarios").value;
            const newsletter = document.querySelector('input[name="newsletter"]:checked')?.value === 'si';

            console.log("Datos del formulario:");
            console.log("Usuario:", usuario);
            console.log("Email:", email);
            console.log("Clave:", clave);
            console.log("Teléfono:", telefono);
            console.log("Newsletter:", newsletter);

            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ 
                        user: usuario, 
                        email: email, 
                        password: clave,
                        telefono: telefono,
                        comentarios: comentarios,
                        newsletter: newsletter
                    }),
                    credentials: 'include'
                });

                console.log("Respuesta del servidor:", res.status, res.ok);

                if (!res.ok) {
                    console.log("Error en la respuesta, mostrando mensaje");
                    
                    // Intentar obtener el mensaje de error del servidor
                    try {
                        const errorData = await res.json();
                        if (mensajeError) {
                            mensajeError.textContent = errorData.message || "Error al registrar el usuario";
                            mensajeError.style.display = "block";
                        }
                    } catch (parseError) {
                        console.log("Error al parsear respuesta de error:", parseError);
                        if (mensajeError) {
                            mensajeError.textContent = "Error al registrar el usuario";
                            mensajeError.style.display = "block";
                        }
                    }
                    return;
                }

                const resJson = await res.json();
                console.log("Respuesta exitosa:", resJson);
                
                // Registrar actividad de registro exitoso
                if (typeof window.registrarActividadUsuario === 'function') {
                    window.registrarActividadUsuario('Te registraste en RM Metalúrgica', '🎉');
                }
                
                if (resJson.redirect) {
                    window.location.href = resJson.redirect;
                } else {
                    // Mostrar mensaje de éxito
                    if (mensajeError) {
                        mensajeError.textContent = "Usuario registrado exitosamente";
                        mensajeError.style.color = "green";
                        mensajeError.style.display = "block";
                    }
                }
            } catch (error) {
                console.log("Error en fetch:", error);
                if (mensajeError) {
                    mensajeError.textContent = "Error de conexión con el servidor";
                    mensajeError.style.display = "block";
                }
            }
        });
    } else {
        console.log("No se encontró el formulario con ID 'register-form'");
    }
});














// document.addEventListener('DOMContentLoaded', function () {
//     const nombre = document.getElementById("usuario");
//     const mail = document.getElementById("email");
//     const clave = document.getElementById("clave");
//     const errorNombre = document.getElementById("errorNombre");
//     const errorMail = document.getElementById("mailInvalido");
//     const errorClave = document.getElementById("errorClave");
//     const formulario = document.querySelector("form");

//     formulario.addEventListener("submit", function (e) {
//         let hayError = false;

//         // Ocultar errores anteriores
//         errorNombre.style.display = "none";
//         errorMail.style.display = "none";
//         errorClave.style.display = "none";

//         // Validar nombre
//         if (nombre.value.trim() === "") {
//             errorNombre.style.display = "inline";
//             hayError = true;
//         }

//         // Validar email
//         const regexMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!regexMail.test(mail.value.trim())) {
//             errorMail.style.display = "inline";
//             hayError = true;
//         }

//         // Validar clave
//         // Validar contraseña
//         if (clave.value.trim() === "") {
//             errorClave.style.display = "inline";
//             hayError = true;
//         } else {
//             errorClave.style.display = "none";
//         }


//         // Evitar envío si hay errores
//         if (hayError) {
//             e.preventDefault();
//         }
//     });
// });
