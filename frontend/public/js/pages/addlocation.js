// ============================================
// AGREGAR UBICACIÓN - JAVASCRIPT
// ============================================

let map;
let selectedMarker = null;
let selectedAddress = '';
let editingLocationId = null; // Para saber si estamos editando

// Límites de Bogotá, Colombia
const BOGOTA_BOUNDS = {
    north: 4.8379,
    south: 4.4689,
    east: -73.9830,
    west: -74.2230
};

const BOGOTA_CENTER = [4.6533, -74.0621];
const DEFAULT_ZOOM = 12;

// ============================================
// INICIALIZACIÓN DEL MAPA
// ============================================

function initMap() {
    console.log('Inicializando mapa de Bogotá...');
    
    // Crear el mapa centrado en Bogotá
    map = L.map('map', {
        center: BOGOTA_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 11,
        maxZoom: 18,
        maxBounds: [
            [BOGOTA_BOUNDS.south - 0.1, BOGOTA_BOUNDS.west - 0.1],
            [BOGOTA_BOUNDS.north + 0.1, BOGOTA_BOUNDS.east + 0.1]
        ],
        preferCanvas: false,
        zoomControl: true
    });

    // Agregar capa de mosaicos (tiles)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Agregar polígono semi-transparente para delimitar Bogotá
    addBogotaBoundary();

    // Evento de clic en el mapa para seleccionar ubicación
    map.on('click', function(e) {
        console.log('Evento click detectado');
        onMapClick(e);
    });

    // Agregar control de búsqueda
    addSearchControl();
    
    console.log('Mapa inicializado correctamente');
}

// ============================================
// DELIMITAR ÁREA DE BOGOTÁ
// ============================================

function addBogotaBoundary() {
    const bounds = [
        [BOGOTA_BOUNDS.north, BOGOTA_BOUNDS.west],
        [BOGOTA_BOUNDS.north, BOGOTA_BOUNDS.east],
        [BOGOTA_BOUNDS.south, BOGOTA_BOUNDS.east],
        [BOGOTA_BOUNDS.south, BOGOTA_BOUNDS.west]
    ];

    const rectangle = L.rectangle(bounds, {
        color: '#28a745',
        weight: 2,
        fillOpacity: 0,
        dashArray: '5, 10',
        interactive: false // No interceptar clicks
    }).addTo(map);
    
    // Tooltip en lugar de popup para no interferir
    rectangle.bindTooltip('Área disponible: Bogotá, Colombia', {
        permanent: false,
        direction: 'center'
    });
}

// ============================================
// VALIDAR SI ESTÁ EN BOGOTÁ
// ============================================

function isInBogota(lat, lng) {
    return lat >= BOGOTA_BOUNDS.south && 
           lat <= BOGOTA_BOUNDS.north && 
           lng >= BOGOTA_BOUNDS.west && 
           lng <= BOGOTA_BOUNDS.east;
}

// ============================================
// EVENTO DE CLIC EN EL MAPA
// ============================================

async function onMapClick(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    console.log('Clic en mapa:', lat, lng);

    // Validar que esté dentro de Bogotá
    if (!isInBogota(lat, lng)) {
        showMessage('⚠️ Por favor seleccione una ubicación dentro de Bogotá, Colombia', 'error');
        return;
    }

    console.log('Ubicación válida en Bogotá');

    // Actualizar campos ocultos
    document.getElementById('latitude').value = lat.toFixed(6);
    document.getElementById('longitude').value = lng.toFixed(6);

    // Remover marcador anterior si existe
    if (selectedMarker) {
        map.removeLayer(selectedMarker);
    }

    // Agregar nuevo marcador
    selectedMarker = L.marker([lat, lng], {
        draggable: true,
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map);

    // Mostrar popup de carga
    selectedMarker.bindPopup(`
        <div class="marker-popup">
            <strong>🔍 Obteniendo dirección...</strong>
        </div>
    `).openPopup();

    // Obtener dirección
    await reverseGeocode(lat, lng);

    // Evento de arrastrar marcador
    selectedMarker.on('dragend', async function(e) {
        const position = e.target.getLatLng();
        
        // Validar que el nuevo punto esté en Bogotá
        if (!isInBogota(position.lat, position.lng)) {
            showMessage('⚠️ El marcador debe estar dentro de Bogotá', 'error');
            // Regresar al punto anterior
            selectedMarker.setLatLng([lat, lng]);
            return;
        }

        document.getElementById('latitude').value = position.lat.toFixed(6);
        document.getElementById('longitude').value = position.lng.toFixed(6);
        
        selectedMarker.bindPopup(`
            <div class="marker-popup">
                <strong>🔍 Actualizando dirección...</strong>
            </div>
        `).openPopup();
        
        await reverseGeocode(position.lat, position.lng);
    });

    // Habilitar botón de guardar
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
        console.log('Botón de guardar habilitado');
    }
}

// ============================================
// GEOCODIFICACIÓN INVERSA
// ============================================

async function reverseGeocode(lat, lng) {
    console.log('Obteniendo dirección para:', lat, lng);
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'es'
                }
            }
        );
        const data = await response.json();
        
        if (data && data.display_name) {
            selectedAddress = data.display_name;
            document.getElementById('address').value = selectedAddress;
            
            // Actualizar UI
            const locationInfo = document.getElementById('location-info');
            const addressSpan = document.getElementById('selected-address');
            
            addressSpan.textContent = selectedAddress;
            locationInfo.style.display = 'flex';
            
            console.log('Dirección obtenida:', selectedAddress);
            
            // Actualizar popup del marcador
            if (selectedMarker) {
                selectedMarker.setPopupContent(`
                    <div class="marker-popup">
                        <strong>📍 Ubicación seleccionada</strong>
                        <div class="coordinates">
                            Lat: ${lat.toFixed(6)}<br>
                            Lng: ${lng.toFixed(6)}
                        </div>
                        <div class="address">
                            ${selectedAddress.split(',').slice(0, 3).join(',')}
                        </div>
                    </div>
                `).openPopup();
            }
        } else {
            selectedAddress = `Ubicación en Bogotá (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            document.getElementById('address').value = selectedAddress;
            
            const locationInfo = document.getElementById('location-info');
            const addressSpan = document.getElementById('selected-address');
            addressSpan.textContent = selectedAddress;
            locationInfo.style.display = 'flex';
            
            if (selectedMarker) {
                selectedMarker.openPopup();
            }
        }
    } catch (error) {
        console.error('Error en geocodificación inversa:', error);
        selectedAddress = `Ubicación en Bogotá (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        document.getElementById('address').value = selectedAddress;
        
        const locationInfo = document.getElementById('location-info');
        const addressSpan = document.getElementById('selected-address');
        addressSpan.textContent = selectedAddress;
        locationInfo.style.display = 'flex';
        
        if (selectedMarker) {
            selectedMarker.setPopupContent(`
                <div class="marker-popup">
                    <strong>📍 Ubicación seleccionada</strong>
                    <div class="coordinates">
                        Lat: ${lat.toFixed(6)}<br>
                        Lng: ${lng.toFixed(6)}
                    </div>
                </div>
            `).openPopup();
        }
    }
}

// ============================================
// CONTROL DE BÚSQUEDA
// ============================================

function addSearchControl() {
    const searchContainer = L.control({ position: 'topright' });

    searchContainer.onAdd = function() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.style.background = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.innerHTML = `
            <div style="display: flex; gap: 5px;">
                <input 
                    type="text" 
                    id="map-search" 
                    placeholder="Buscar en Bogotá..." 
                    style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 200px;"
                >
                <button 
                    onclick="searchAddress()" 
                    style="padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                    <i class="fas fa-search"></i>
                </button>
            </div>
        `;

        L.DomEvent.disableClickPropagation(div);
        return div;
    };

    searchContainer.addTo(map);

    // Evento Enter
    setTimeout(() => {
        const searchInput = document.getElementById('map-search');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchAddress();
                }
            });
        }
    }, 100);
}

// ============================================
// BÚSQUEDA DE DIRECCIÓN
// ============================================

async function searchAddress() {
    const searchInput = document.getElementById('map-search');
    const query = searchInput.value.trim();

    if (!query) {
        showMessage('Por favor ingrese una dirección para buscar', 'error');
        return;
    }

    try {
        // Buscar solo en Bogotá
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Bogotá, Colombia')}&limit=5`,
            {
                headers: {
                    'Accept-Language': 'es'
                }
            }
        );
        const data = await response.json();

        if (data && data.length > 0) {
            // Buscar el primer resultado que esté en Bogotá
            let foundInBogota = false;
            
            for (const result of data) {
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);

                if (isInBogota(lat, lng)) {
                    map.setView([lat, lng], 16);
                    await onMapClick({ latlng: { lat, lng } });
                    showMessage('✅ Ubicación encontrada', 'success');
                    foundInBogota = true;
                    break;
                }
            }

            if (!foundInBogota) {
                showMessage('⚠️ La dirección encontrada está fuera de Bogotá', 'error');
            }
        } else {
            showMessage('No se encontró la dirección. Intente con otra búsqueda.', 'error');
        }
    } catch (error) {
        console.error('Error en búsqueda:', error);
        showMessage('Error al buscar la dirección', 'error');
    }
}

// ============================================
// ENVÍO DEL FORMULARIO
// ============================================

document.getElementById('addLocationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Obtener datos del formulario
    const name = document.getElementById('name').value.trim();
    const type = document.getElementById('type').value;
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const address = document.getElementById('address').value;

    // Validaciones
    if (!name || !type) {
        showMessage('Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    if (!latitude || !longitude || !address) {
        showMessage('Por favor seleccione una ubicación en el mapa', 'error');
        return;
    }

    const formData = {
        name,
        type,
        address,
        latitude,
        longitude
    };

    // Botón de envío
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const originalText = submitBtnText.textContent;
    
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtnText.textContent = editingLocationId ? 'Actualizando...' : 'Guardando...';

    try {
        const method = editingLocationId ? 'PUT' : 'POST';
        const apiEndpoint = API_URL.includes('/api') 
            ? API_URL.replace('/api', '') + (editingLocationId ? `/api/locations/${editingLocationId}` : '/api/locations')
            : API_URL + (editingLocationId ? `/api/locations/${editingLocationId}` : '/api/locations');
            
        console.log('Método:', method);
        console.log('API_URL:', API_URL);
        console.log('Enviando datos a:', apiEndpoint);
        console.log('Datos:', formData);

        const response = await fetch(apiEndpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        console.log('Respuesta:', result);

        if (response.ok) {
            const successMsg = editingLocationId ? '✅ ¡Ubicación actualizada exitosamente!' : '✅ ¡Ubicación agregada exitosamente!';
            showMessage(successMsg, 'success');
            
            // Limpiar formulario
            document.getElementById('addLocationForm').reset();
            document.getElementById('location-info').style.display = 'none';
            editingLocationId = null;
            
            // Remover marcador
            if (selectedMarker) {
                map.removeLayer(selectedMarker);
                selectedMarker = null;
            }

            // Restaurar botón
            submitBtn.disabled = true;
            submitBtnText.textContent = 'Guardar Ubicación';
            submitBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';

            // Recargar lista de ubicaciones
            loadAllLocations();

            // Scroll a la lista
            setTimeout(() => {
                document.querySelector('.locations-list-container').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 1000);
        } else {
            showMessage(result.error || 'Error al guardar la ubicación', 'error');
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión. Verifique que el servidor esté ejecutándose.', 'error');
        submitBtn.disabled = false;
    } finally {
        submitBtn.classList.remove('loading');
        submitBtnText.textContent = originalText;
    }
});

// ============================================
// MOSTRAR MENSAJES
// ============================================

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    messageDiv.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'flex';

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);

    // Scroll al mensaje
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando mapa...');
    console.log('API_URL:', API_URL);
    initMap();
    loadAllLocations(); // Cargar ubicaciones al iniciar
});

// ============================================
// GESTIÓN DE UBICACIONES
// ============================================

// Cargar todas las ubicaciones
async function loadAllLocations() {
    const listContainer = document.getElementById('locations-list');
    
    try {
        listContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                Cargando ubicaciones...
            </div>
        `;

        const apiEndpoint = API_URL.includes('/api') 
            ? API_URL.replace('/api', '') + '/api/locations'
            : API_URL + '/api/locations';

        const response = await fetch(apiEndpoint);
        const data = await response.json();

        if (response.ok && data.locations && data.locations.length > 0) {
            renderLocationsList(data.locations);
        } else {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-map-marked-alt"></i>
                    <h3>No hay ubicaciones registradas</h3>
                    <p>Agrega tu primera ubicación usando el formulario de arriba</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar ubicaciones:', error);
        listContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar ubicaciones</h3>
                <p>Por favor intenta nuevamente</p>
            </div>
        `;
    }
}

// Renderizar lista de ubicaciones
function renderLocationsList(locations) {
    const listContainer = document.getElementById('locations-list');
    
    const html = locations.map(location => {
        const typeLabel = location.type === 'verdego' ? 'Centro de Reciclaje' : 'Tienda Aliada';
        const typeIcon = location.type === 'verdego' ? 'recycle' : 'store';
        
        return `
            <div class="location-card" data-id="${location.id}">
                <div class="location-card-header">
                    <div class="location-info">
                        <h3>
                            <i class="fas fa-${typeIcon}"></i>
                            ${location.name}
                        </h3>
                        <span class="location-type-badge ${location.type}">
                            <i class="fas fa-tag"></i>
                            ${typeLabel}
                        </span>
                    </div>
                    <div class="location-actions">
                        <button class="btn-icon btn-view-map" onclick="viewOnMap(${location.id})" title="Ver en mapa">
                            <i class="fas fa-map-marker-alt"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editLocation(${location.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="confirmDeleteLocation(${location.id}, '${location.name.replace(/'/g, "\\'")}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="location-details">
                    <div class="location-detail">
                        <i class="fas fa-map-marked-alt"></i>
                        <span>${location.address}</span>
                    </div>
                    ${location.latitude && location.longitude ? `
                        <div class="location-coordinates">
                            <span><strong>Lat:</strong> ${parseFloat(location.latitude).toFixed(6)}</span>
                            <span><strong>Lng:</strong> ${parseFloat(location.longitude).toFixed(6)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    listContainer.innerHTML = html;
}

// Ver ubicación en el mapa
async function viewOnMap(id) {
    try {
        const apiEndpoint = API_URL.includes('/api') 
            ? API_URL.replace('/api', '') + `/api/locations/${id}`
            : API_URL + `/api/locations/${id}`;

        const response = await fetch(apiEndpoint);
        const data = await response.json();

        if (response.ok && data.location) {
            const loc = data.location;
            
            if (loc.latitude && loc.longitude) {
                // Centrar mapa en la ubicación
                map.setView([loc.latitude, loc.longitude], 16);
                
                // Remover marcador anterior si existe
                if (selectedMarker) {
                    map.removeLayer(selectedMarker);
                }
                
                // Agregar marcador temporal
                selectedMarker = L.marker([loc.latitude, loc.longitude], {
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                }).addTo(map);
                
                selectedMarker.bindPopup(`
                    <div class="marker-popup">
                        <strong>${loc.name}</strong>
                        <div class="address">${loc.address}</div>
                    </div>
                `).openPopup();
                
                // Scroll al mapa
                document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    } catch (error) {
        console.error('Error al ver ubicación:', error);
        showMessage('Error al cargar la ubicación en el mapa', 'error');
    }
}

// Editar ubicación
async function editLocation(id) {
    try {
        const apiEndpoint = API_URL.includes('/api') 
            ? API_URL.replace('/api', '') + `/api/locations/${id}`
            : API_URL + `/api/locations/${id}`;

        const response = await fetch(apiEndpoint);
        const data = await response.json();

        if (response.ok && data.location) {
            const loc = data.location;
            
            // Guardar ID de edición
            editingLocationId = id;
            
            // Llenar formulario
            document.getElementById('name').value = loc.name;
            document.getElementById('type').value = loc.type;
            document.getElementById('address').value = loc.address;
            document.getElementById('latitude').value = loc.latitude;
            document.getElementById('longitude').value = loc.longitude;
            
            // Actualizar UI
            selectedAddress = loc.address;
            const locationInfo = document.getElementById('location-info');
            const addressSpan = document.getElementById('selected-address');
            addressSpan.textContent = loc.address;
            locationInfo.style.display = 'flex';
            
            // Cambiar texto del botón
            const submitBtn = document.getElementById('submitBtn');
            const submitBtnText = document.getElementById('submitBtnText');
            submitBtn.disabled = false;
            submitBtnText.textContent = 'Actualizar Ubicación';
            submitBtn.style.background = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
            
            // Mostrar en mapa si tiene coordenadas
            if (loc.latitude && loc.longitude) {
                map.setView([loc.latitude, loc.longitude], 16);
                
                if (selectedMarker) {
                    map.removeLayer(selectedMarker);
                }
                
                selectedMarker = L.marker([loc.latitude, loc.longitude], {
                    draggable: true,
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                }).addTo(map);
                
                selectedMarker.bindPopup(`
                    <div class="marker-popup">
                        <strong>📍 Editando: ${loc.name}</strong>
                        <div class="address">${loc.address}</div>
                    </div>
                `).openPopup();
                
                // Evento de arrastrar al editar
                selectedMarker.on('dragend', async function(e) {
                    const position = e.target.getLatLng();
                    if (!isInBogota(position.lat, position.lng)) {
                        showMessage('⚠️ El marcador debe estar dentro de Bogotá', 'error');
                        selectedMarker.setLatLng([loc.latitude, loc.longitude]);
                        return;
                    }
                    document.getElementById('latitude').value = position.lat.toFixed(6);
                    document.getElementById('longitude').value = position.lng.toFixed(6);
                    await reverseGeocode(position.lat, position.lng);
                });
            }
            
            // Scroll al formulario
            document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
            showMessage('Modo edición activado. Modifica los datos y guarda los cambios.', 'success');
        }
    } catch (error) {
        console.error('Error al cargar ubicación:', error);
        showMessage('Error al cargar la ubicación para editar', 'error');
    }
}

// Confirmar eliminación
function confirmDeleteLocation(id, name) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Confirmar Eliminación</h3>
            </div>
            <div class="modal-body">
                <p>¿Estás seguro de que deseas eliminar la ubicación:</p>
                <p><strong>${name}</strong></p>
                <p>Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                    Cancelar
                </button>
                <button class="btn btn-delete" onclick="deleteLocation(${id})">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Cerrar modal
function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Eliminar ubicación
async function deleteLocation(id) {
    closeModal();
    
    try {
        const apiEndpoint = API_URL.includes('/api') 
            ? API_URL.replace('/api', '') + `/api/locations/${id}`
            : API_URL + `/api/locations/${id}`;

        const response = await fetch(apiEndpoint, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('✅ Ubicación eliminada exitosamente', 'success');
            loadAllLocations(); // Recargar lista
        } else {
            showMessage(result.error || 'Error al eliminar la ubicación', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión al eliminar la ubicación', 'error');
    }
}

// Cancelar edición
function cancelEdit() {
    editingLocationId = null;
    document.getElementById('addLocationForm').reset();
    document.getElementById('location-info').style.display = 'none';
    
    if (selectedMarker) {
        map.removeLayer(selectedMarker);
        selectedMarker = null;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    submitBtn.disabled = true;
    submitBtnText.textContent = 'Guardar Ubicación';
    submitBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    
    showMessage('Edición cancelada', 'success');
}

// ============================================
// BÚSQUEDA Y FILTRADO
// ============================================

// Filtrar ubicaciones por nombre
function filterLocations() {
    const searchInput = document.getElementById('search-input');
    const searchValue = searchInput.value.toLowerCase().trim();
    const clearBtn = document.getElementById('clear-search-btn');
    const resultsCount = document.getElementById('search-results-count');
    const locationCards = document.querySelectorAll('.location-card');
    
    // Mostrar/ocultar botón de limpiar
    if (searchValue) {
        clearBtn.style.display = 'block';
    } else {
        clearBtn.style.display = 'none';
        resultsCount.style.display = 'none';
    }
    
    let visibleCount = 0;
    
    // Filtrar tarjetas
    locationCards.forEach(card => {
        const locationName = card.querySelector('h3').textContent.toLowerCase();
        
        if (locationName.includes(searchValue)) {
            card.classList.remove('hidden');
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.classList.add('hidden');
            card.style.display = 'none';
        }
    });
    
    // Mostrar contador de resultados
    if (searchValue) {
        resultsCount.style.display = 'block';
        if (visibleCount === 0) {
            resultsCount.innerHTML = `<i class="fas fa-exclamation-circle"></i> No se encontraron ubicaciones con "${searchValue}"`;
            resultsCount.style.background = '#fff3cd';
            resultsCount.style.borderLeftColor = '#ffc107';
            resultsCount.style.color = '#856404';
        } else {
            resultsCount.innerHTML = `<i class="fas fa-check-circle"></i> ${visibleCount} ubicación${visibleCount !== 1 ? 'es' : ''} encontrada${visibleCount !== 1 ? 's' : ''}`;
            resultsCount.style.background = '#e8f5e9';
            resultsCount.style.borderLeftColor = '#28a745';
            resultsCount.style.color = '#155724';
        }
    }
}

// Limpiar búsqueda
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search-btn');
    const resultsCount = document.getElementById('search-results-count');
    const locationCards = document.querySelectorAll('.location-card');
    
    searchInput.value = '';
    clearBtn.style.display = 'none';
    resultsCount.style.display = 'none';
    
    // Mostrar todas las tarjetas
    locationCards.forEach(card => {
        card.classList.remove('hidden');
        card.style.display = 'block';
    });
    
    // Focus en el input
    searchInput.focus();
}
