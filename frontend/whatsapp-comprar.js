// Funcionalidad de WhatsApp para botones de comprar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Configurando botones de comprar con WhatsApp...');
    
    // Función para abrir WhatsApp con mensaje predefinido
    function abrirWhatsApp(nombreProducto) {
        const numeroWhatsApp = '5492915067326'; // +54 9 2915 06-7326
        const mensaje = `Hola! Me interesa el producto "${nombreProducto}" que vi en su página web. ¿Podrían darme más información sobre precio y disponibilidad?`;
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        
        console.log('📱 Abriendo WhatsApp para:', nombreProducto);
        console.log('📞 Número:', numeroWhatsApp);
        console.log('💬 Mensaje:', mensaje);
        
        window.open(url, '_blank');
    }
    
    // Buscar todos los botones de comprar
    const botonesComprar = document.querySelectorAll('.boton-comprar');
    console.log(`🔍 Encontrados ${botonesComprar.length} botones de comprar`);
    
    botonesComprar.forEach((boton, index) => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener el nombre del producto
            let nombreProducto = 'Producto de RM Metalúrgica';
            
            // Intentar obtener el nombre del producto desde el atributo data-producto
            if (boton.hasAttribute('data-producto')) {
                nombreProducto = boton.getAttribute('data-producto');
            } else {
                // Si no tiene el atributo, buscar en el elemento padre
                const contenedorProducto = boton.closest('.producto, .info-producto');
                if (contenedorProducto) {
                    const tituloProducto = contenedorProducto.querySelector('h1, h2, h3');
                    if (tituloProducto) {
                        nombreProducto = tituloProducto.textContent.trim();
                    }
                }
            }
            
            console.log(`🛒 Click en botón ${index + 1} - Producto: ${nombreProducto}`);
            abrirWhatsApp(nombreProducto);
        });
    });
    
    console.log('✅ Configuración de botones de comprar completada');
});
