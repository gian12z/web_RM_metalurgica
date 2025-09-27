// Funcionalidad para hacer productos clickeables
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔗 Configurando productos clickeables...');
    
    // Buscar todos los productos con atributo data-link
    const productos = document.querySelectorAll('.producto[data-link]');
    console.log(`🔍 Encontrados ${productos.length} productos clickeables`);
    
    productos.forEach((producto, index) => {
        // Añadir estilo de cursor pointer
        producto.style.cursor = 'pointer';
        
        // Añadir evento de click
        producto.addEventListener('click', function(e) {
            e.preventDefault();
            
            const link = producto.getAttribute('data-link');
            if (link) {
                console.log(`🔗 Navegando a: ${link}`);
                window.location.href = link;
            }
        });
        
        // Añadir efectos hover
        producto.addEventListener('mouseenter', function() {
            producto.style.transform = 'scale(1.05)';
        });
        
        producto.addEventListener('mouseleave', function() {
            producto.style.transform = 'scale(1.02)';
        });
    });
    
    console.log('✅ Configuración de productos clickeables completada');
});
