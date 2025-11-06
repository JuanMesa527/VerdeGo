// ============================================
// MAPA INTERACTIVO DE UBICACIONES - VerdeGo
// ============================================

let modalMap;
let modalMarkers = [];
let allLocations = [];
let modalActiveFilter = 'all';

// Iconos personalizados para cada tipo de ubicación
const locationIcons = {
    verdego: L.divIcon({
        html: '<div class="custom-marker verdego">♻️</div>',
        className: 'custom-marker-container',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    }),
    aliada: L.divIcon({
        html: '<div class="custom-marker aliada">🏪</div>',
        className: 'custom-marker-container',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    }),
    default: L.divIcon({
        html: '<div class="custom-marker default">♻️</div>',
        className: 'custom-marker-container',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    })
};


// Cargar ubicaciones desde el backend
async function loadLocations() {
    try {
        const response = await fetch(`${API_URL.replace('/api', '')}/api/ubicaciones`);
        const data = await response.json();

        if (data.locations && data.locations.length > 0) {
            allLocations = data.locations;
            // Solo cargar en el modal si está abierto
            if (modalMap) {
                displayModalLocations(allLocations);
            }
        } else {
            console.log('No hay ubicaciones disponibles');
        }
    } catch (error) {
        console.error('❌ Error al cargar ubicaciones:', error);
        showError('Error al cargar las ubicaciones del mapa');
    }
}

// Obtener emoji según el tipo
function getTypeEmoji(type) {
    const emojis = {
        verdego: '♻️',
        aliada: '🏪',
        default: '♻️'
    };
    return emojis[type] || emojis.default;
}

// Formatear el tipo para mostrar
function formatType(type) {
    const types = {
        verdego: 'Ubicación VerdeGo',
        aliada: 'Tienda Aliada',
        default: 'Ubicación'
    };
    return types[type] || type;
}

// Abrir direcciones en Google Maps
function openDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
}

// Mostrar error
function showError(message) {
    console.error(message);
    // Podrías agregar una notificación visual aquí
}

// ============================================
// FUNCIONES DEL MODAL
// ============================================

// Inicializar mapa modal
function initModalMap() {
    if (modalMap) {
        modalMap.remove();
    }
    
    modalMap = L.map('modalMap', {
        center: [4.7110, -74.0721],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 10
    }).addTo(modalMap);

    // Cargar ubicaciones en el modal
    displayModalLocations(allLocations);
    updateModalLocationCount(allLocations.length);
    
    // Forzar actualización del mapa
    setTimeout(() => {
        modalMap.invalidateSize();
    }, 300);
}

// Mostrar ubicaciones en el mapa modal
function displayModalLocations(locations) {
    // Limpiar marcadores existentes
    modalMarkers.forEach(marker => modalMap.removeLayer(marker));
    modalMarkers = [];

    // Crear marcadores para cada ubicación
    locations.forEach(location => {
        if (location.latitude && location.longitude) {
            const icon = locationIcons[location.type] || locationIcons.default;

            const marker = L.marker([location.latitude, location.longitude], {
                icon: icon,
                title: location.name
            });

            const popupContent = `
                <div class="location-popup">
                    <h3>${getTypeEmoji(location.type)} ${location.name}</h3>
                    <p><strong>📍 Dirección:</strong> ${location.address}</p>
                    <p><strong>🏷️ Tipo:</strong> ${formatType(location.type)}</p>
                    <div class="popup-actions">
                        <button onclick="openDirections(${location.latitude}, ${location.longitude})" class="popup-btn">
                            🗺️ Cómo llegar
                        </button>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.addTo(modalMap);
            modalMarkers.push(marker);
        }
    });

    // Ajustar el mapa para mostrar todos los marcadores
    if (modalMarkers.length > 0) {
        const group = new L.featureGroup(modalMarkers);
        modalMap.fitBounds(group.getBounds().pad(0.1));
    }
}

// Filtrar ubicaciones en el modal
function filterModalLocations(type) {
    modalActiveFilter = type;

    // Actualizar botones de filtro del modal
    document.querySelectorAll('.modal-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });

    // Filtrar ubicaciones
    let filteredLocations = allLocations;
    if (type !== 'all') {
        filteredLocations = allLocations.filter(loc => loc.type === type);
    }

    // Mostrar ubicaciones filtradas
    displayModalLocations(filteredLocations);
    updateModalLocationCount(filteredLocations.length);
}

// Actualizar contador del modal
function updateModalLocationCount(count) {
    const countElement = document.getElementById('modalLocationCount');
    if (countElement) {
        const text = count === 1 ? 'ubicación encontrada' : 'ubicaciones encontradas';
        countElement.textContent = `📌 ${count} ${text}`;
    }
}

// Abrir modal
function openMapModal() {
    const modal = document.getElementById('mapModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Inicializar el mapa del modal si aún no existe
    if (!modalMap) {
        setTimeout(() => {
            initModalMap();
        }, 100);
    } else {
        setTimeout(() => {
            modalMap.invalidateSize();
        }, 300);
    }
}

// Cerrar modal
function closeMapModal() {
    const modal = document.getElementById('mapModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar ubicaciones al inicio
    loadLocations();
    
    // Event listeners para el modal
    const openModalBtn = document.getElementById('openMapModal');
    const closeModalBtn = document.getElementById('closeMapModal');
    const modal = document.getElementById('mapModal');
    
    if (openModalBtn) {
        openModalBtn.addEventListener('click', openMapModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeMapModal);
    }
    
    // Cerrar modal al hacer click fuera
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeMapModal();
            }
        });
    }
    
    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMapModal();
        }
    });
    
    // Agregar event listeners a los botones de filtro del modal
    document.querySelectorAll('.modal-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterModalLocations(btn.dataset.type);
        });
    });
});
