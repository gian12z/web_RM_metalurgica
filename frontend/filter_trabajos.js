// Robust initialization: try to find DOM elements multiple times (in case other scripts inject or modify DOM)
console.log('filter_trabajos.js: script loaded — will attempt to initialize');

let _ft_initialized = false;
let _ft_attempts = 0;
const _ft_maxAttempts = 12; // ~12 * 200ms = 2.4s
const _ft_delay = 200;

function _ft_tryInit() {
    _ft_attempts++;
    const searchForm = document.getElementById('empleos-search-form');
    const searchInput = document.getElementById('trabajos-search-input');
    const filterSelect = document.getElementById('filter-trabajos');

    const sections = {
        mesas: document.querySelector('.mesas'),
        escritorios: document.querySelector('.escritorios'),
        mesasRatonas: document.querySelector('.mesas.ratonas')
    };

    if (!searchForm || !searchInput || !filterSelect) {
        console.warn('filter_trabajos.js: elementos de búsqueda no encontrados (attempt ' + _ft_attempts + ')', {searchForm, searchInput, filterSelect});
        if (_ft_attempts < _ft_maxAttempts) {
            setTimeout(_ft_tryInit, _ft_delay);
        } else {
            console.error('filter_trabajos.js: no se encontraron los elementos tras varios intentos, abortando inicialización');
        }
        return;
    }

    if (_ft_initialized) return;
    _ft_initialized = true;
    console.log('filter_trabajos.js: elementos encontrados, attaching listeners (attempt ' + _ft_attempts + ')');

    // Función para normalizar texto (remover acentos y convertir a minúsculas)
    function normalizeText(text) {
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    // Función para filtrar secciones
    function filterSections() {
        console.log('filter_trabajos.js: filterSections called', {value: searchInput.value, filter: filterSelect.value});
        const searchTerm = normalizeText(searchInput.value.trim());
        const filterValue = filterSelect.value;

        // Si no hay búsqueda ni filtro, mostrar todo
        if (!searchTerm && !filterValue) {
            Object.values(sections).forEach(section => {
                if (section) section.style.display = 'block';
            });
            return;
        }

        // Ocultar todas las secciones primero
        Object.values(sections).forEach(section => {
            if (section) section.style.display = 'none';
        });

        // Mapeo de términos de búsqueda a secciones
        const searchMap = {
            'mesa': ['mesas', 'mesasRatonas'],
            'mesas': ['mesas', 'mesasRatonas'],
            'comedor': ['mesas'],
            'ratona': ['mesasRatonas'],
            'ratonas': ['mesasRatonas'],
            'escritorio': ['escritorios'],
            'escritorios': ['escritorios'],
            'barra': ['mesas'],
            'vidrio': ['mesas', 'mesasRatonas'],
            'moderna': ['mesas', 'escritorios', 'mesasRatonas'],
            'moderno': ['mesas', 'escritorios', 'mesasRatonas']
        };

        // Buscar por término ingresado
        if (searchTerm) {
            let found = false;
            
            // Buscar coincidencias exactas o parciales
            for (const [key, sectionNames] of Object.entries(searchMap)) {
                if (normalizeText(key).includes(searchTerm) || searchTerm.includes(normalizeText(key))) {
                    sectionNames.forEach(sectionName => {
                        if (sections[sectionName]) {
                            sections[sectionName].style.display = 'block';
                            found = true;
                        }
                    });
                }
            }

            // Si no se encontró nada específico, buscar en los títulos de productos
            if (!found) {
                Object.values(sections).forEach(section => {
                    if (section) {
                        const h2 = section.querySelector('h2');
                        const sectionTitle = h2 ? normalizeText(h2.textContent) : '';
                        const productos = section.querySelectorAll('.producto h3');
                        let hasMatch = false;

                        // Verificar si el título de la sección coincide
                        if (sectionTitle.includes(searchTerm)) {
                            hasMatch = true;
                        } else {
                            // Verificar si algún producto coincide
                            productos.forEach(producto => {
                                if (normalizeText(producto.textContent).includes(searchTerm)) {
                                    hasMatch = true;
                                }
                            });
                        }

                        if (hasMatch) {
                            section.style.display = 'block';
                        }
                    }
                });
            }
        }

        // Filtrar por select (si está seleccionado)
        if (filterValue) {
            const filterMap = {
                'mesas': 'mesas',
                'escritorios': 'escritorios',
                'mesas-ratonas': 'mesasRatonas',
                'trabajos-personalizados': 'todas' // trabajos personalizados muestra todo
            };

            const targetSection = filterMap[filterValue];
            
            if (targetSection === 'todas') {
                Object.values(sections).forEach(section => {
                    if (section) section.style.display = 'block';
                });
            } else if (sections[targetSection]) {
                // Si hay búsqueda, combinar con el filtro
                if (searchTerm) {
                    // Mantener visible solo si ya estaba visible por la búsqueda
                    if (sections[targetSection].style.display === 'none') {
                        Object.values(sections).forEach(section => {
                            if (section) section.style.display = 'none';
                        });
                    }
                }
                sections[targetSection].style.display = 'block';
            }
        }
    }

    // Event listener para el formulario (evitar recarga de página)
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filterSections();
    });

    // Event listener para búsqueda en tiempo real
    searchInput.addEventListener('input', (e) => {
        // log keystroke to debug
        // note: keep lightweight to avoid flooding console
        if (e && e.type) console.debug('filter_trabajos.js: input event');
        filterSections();
    });

    // Event listener para el filtro select
    filterSelect.addEventListener('change', (e) => {
        console.debug('filter_trabajos.js: select change', filterSelect.value);
        filterSections();
    });

    // Run an initial pass to ensure sections are visible by default
    console.log('filter_trabajos.js: running initial filterSections pass');
    filterSections();
}

// Start initialization: if DOM already ready, try immediately; else wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('filter_trabajos.js: DOMContentLoaded event received — starting init attempts');
        _ft_tryInit();
    });
} else {
    console.log('filter_trabajos.js: document.readyState != loading — starting init attempts immediately');
    _ft_tryInit();
}