// ============================================
// GESTIÓN DE MISIONES SEMANALES
// ============================================

let currentUser = null;
let activeMissions = [];

// Mapeo de tipos de material a iconos y nombres
const materialInfo = {
    plastic: { icon: '🍾', name: 'Plástico', color: '#3498db' },
    paper: { icon: '📄', name: 'Papel y Cartón', color: '#f39c12' },
    glass: { icon: '🍷', name: 'Vidrio', color: '#16a085' },
    metal: { icon: '🥫', name: 'Metal', color: '#95a5a6' },
    electronic: { icon: '🔋', name: 'Electrónicos', color: '#e74c3c' },
    organic: { icon: '🌿', name: 'Orgánicos', color: '#27ae60' }
};

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    currentUser = getUser();
    
    if (!currentUser) {
        window.location.href = '/pages/login.html';
        return;
    }
    
    await loadUserStats();
    await loadMissions();
});

// Cargar estadísticas del usuario
async function loadUserStats() {
    try {
        // Obtener puntos del usuario usando el ID correcto
        const pointsRes = await fetch(`${API_URL}/puntos/${currentUser.id}`);
        const pointsData = await pointsRes.json();
        
        console.log('📊 Puntos recibidos del servidor:', pointsData);
        
        // El endpoint devuelve 'credits' y 'totalEarned'
        const userPoints = pointsData.credits || 0;
        const totalEarned = pointsData.totalEarned || 0;
        
        // Actualizar puntos en la página de misiones
        const userPointsElement = document.getElementById('userPoints');
        if (userPointsElement) {
            userPointsElement.textContent = userPoints;
        }
        
        // Actualizar puntos en el header si existe
        const headerPointsElement = document.querySelector('.user-credits');
        if (headerPointsElement) {
            headerPointsElement.textContent = `⭐ ${userPoints}`;
        }
        
        // Actualizar el usuario en localStorage
        currentUser.credits = userPoints;
        currentUser.total_earned = totalEarned;
        saveUser(currentUser);
        
        console.log('✅ Puntos actualizados en UI:', userPoints);
        console.log('✅ Total ganado:', totalEarned);
        
        // Las estadísticas de misiones se calcularán al cargar las misiones
    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
    }
}

// Cargar misiones
async function loadMissions() {
    try {
        const response = await fetch(`${API_URL}/misiones-progreso/${currentUser.id}`);
        const missions = await response.json();
        
        activeMissions = missions;
        renderMissions(missions);
        updateMissionStats(missions);
    } catch (error) {
        console.error('❌ Error al cargar misiones:', error);
        showError();
    }
}

// Renderizar misiones
function renderMissions(missions) {
    const grid = document.getElementById('missionsGrid');
    
    if (missions.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎯</div>
                <h3>No hay misiones activas</h3>
                <p>Vuelve pronto para nuevos desafíos</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = missions.map(mission => createMissionCard(mission)).join('');
    
    // Iniciar temporizadores para cada misión
    startTimers();
}

// Crear tarjeta de misión
function createMissionCard(mission) {
    const materialData = materialInfo[mission.material_type] || materialInfo.plastic;
    const currentWeight = mission.current_weight || 0;
    const progress = Math.min((currentWeight / mission.target_weight) * 100, 100);
    const isCompleted = mission.is_completed === 1;
    const canClaim = currentWeight >= mission.target_weight && !isCompleted;
    
    // Crear elemento único para el temporizador
    const timerId = `timer-${mission.id}`;
    
    return `
        <div class="mission-card ${isCompleted ? 'completed' : ''}" data-mission-id="${mission.id}">
            <div class="mission-header">
                <div class="mission-type-badge">${materialData.name}</div>
                <div class="mission-icon">${materialData.icon}</div>
                <h3 class="mission-name">${mission.name}</h3>
            </div>
            
            <div class="mission-body">
                <p class="mission-description">${mission.description}</p>
                
                <div class="mission-time-left">
                    <div class="timer-container" id="${timerId}" data-end-date="${mission.end_date}">
                        <span class="timer-icon">⏰</span>
                        <span class="timer-text">Calculando...</span>
                    </div>
                </div>
                
                <div class="mission-details">
                    <div class="detail-item">
                        <span class="detail-icon">🎯</span>
                        <span class="detail-text">Objetivo:</span>
                        <span class="detail-value">${mission.target_weight} kg</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">🎁</span>
                        <span class="detail-text">Recompensa:</span>
                        <span class="detail-value">${mission.reward_points} puntos</span>
                    </div>
                </div>
                
                <div class="mission-progress">
                    <div class="progress-header">
                        <span class="progress-label">Progreso</span>
                        <span class="progress-value">${currentWeight.toFixed(2)} / ${mission.target_weight} kg</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                ${getActionButton(mission, canClaim, isCompleted)}
            </div>
        </div>
    `;
}

// Obtener botón de acción según el estado
function getActionButton(mission, canClaim, isCompleted) {
    if (isCompleted) {
        return `
            <button class="mission-action completed-btn" disabled>
                <span>✅</span>
                <span>¡Completada!</span>
            </button>
        `;
    }
    
    if (canClaim) {
        return `
            <button class="mission-action claim-btn" onclick="claimReward(${mission.id}, ${mission.reward_points})">
                <span>🎁</span>
                <span>¡Reclamar Recompensa!</span>
            </button>
        `;
    }
    
    return `
        <button class="mission-action in-progress-btn" disabled>
            <span>📊</span>
            <span>En Progreso</span>
        </button>
    `;
}

// Reclamar recompensa
async function claimReward(missionId, points) {
    try {
        const token = getToken();
        if (!token) {
            alert('⚠️ Debes iniciar sesión para reclamar recompensas');
            window.location.href = '/pages/login.html';
            return;
        }
        
        console.log('🎁 Reclamando misión:', missionId, 'Usuario:', currentUser.id);
        
        const response = await fetch(`${API_URL}/reclamar-mision`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: currentUser.id,
                missionId: missionId
            })
        });
        
        const data = await response.json();
        console.log('📦 Respuesta del servidor:', data);
        
        if (data.success) {
            // Mostrar notificación de éxito
            showSuccessNotification(data.message, points);
            
            console.log('🔄 Actualizando estadísticas...');
            
            // Recargar misiones y estadísticas inmediatamente
            await Promise.all([
                loadUserStats(),
                loadMissions()
            ]);
            
            console.log('✅ Estadísticas actualizadas');
            
            // Animación de actualización de puntos
            animatePointsUpdate(points);
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('❌ Error al reclamar recompensa:', error);
        alert('❌ Error al reclamar la recompensa. Intenta de nuevo.');
    }
}

// Actualizar estadísticas de misiones
function updateMissionStats(missions) {
    const completed = missions.filter(m => m.is_completed === 1).length;
    
    // Calcular total de puntos ganados SOLO de las misiones completadas
    const totalRewards = missions
        .filter(m => m.is_completed === 1)
        .reduce((sum, m) => sum + m.reward_points, 0);
    
    // Actualizar misiones completadas
    document.getElementById('completedMissions').textContent = completed;
    
    // Actualizar puntos ganados de misiones semanales
    document.getElementById('totalRewards').textContent = totalRewards;
}

// Mostrar notificación de éxito
function showSuccessNotification(message, points) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 25px 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);
        z-index: 10000;
        animation: slideIn 0.5s ease;
        max-width: 350px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 3rem;">🎉</div>
            <div>
                <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 5px;">
                    ${message}
                </div>
                <div style="font-size: 1.3rem; font-weight: 700;">
                    +${points} puntos
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Mostrar error
function showError() {
    const grid = document.getElementById('missionsGrid');
    grid.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">❌</div>
            <h3>Error al cargar misiones</h3>
            <p>Por favor, intenta recargar la página</p>
        </div>
    `;
}

// Función para iniciar y actualizar temporizadores
function startTimers() {
    const timerElements = document.querySelectorAll('.timer-container');
    
    timerElements.forEach(timerElement => {
        updateTimer(timerElement);
    });
    
    // Actualizar cada segundo
    setInterval(() => {
        timerElements.forEach(timerElement => {
            updateTimer(timerElement);
        });
    }, 1000);
}

// Actualizar un temporizador individual
function updateTimer(timerElement) {
    const endDateStr = timerElement.getAttribute('data-end-date');
    if (!endDateStr) return;
    
    // Parsear la fecha en zona horaria local (no UTC)
    // La fecha viene como "YYYY-MM-DD"
    const [year, month, day] = endDateStr.split('-').map(Number);
    // Mes es 0-indexed en JavaScript
    const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
    const now = new Date();
    const diff = endDate - now;
    
    if (diff <= 0) {
        timerElement.querySelector('.timer-text').textContent = '¡Tiempo agotado!';
        timerElement.style.color = '#e74c3c';
        return;
    }
    
    // Calcular días, horas, minutos y segundos
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Formatear texto
    let timeText = '';
    if (days > 0) {
        timeText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
        timeText = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        timeText = `${minutes}m ${seconds}s`;
    } else {
        timeText = `${seconds}s`;
    }
    
    timerElement.querySelector('.timer-text').textContent = timeText;
    
    // Cambiar color si queda poco tiempo (menos de 1 día)
    if (days === 0) {
        timerElement.style.color = '#f39c12';
    }
    if (days === 0 && hours === 0) {
        timerElement.style.color = '#e74c3c';
    }
}


// Animaciones CSS (agregar al head)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
    }
`;
document.head.appendChild(style);

// Animar actualización de puntos
function animatePointsUpdate(points) {
    const userPointsElement = document.getElementById('userPoints');
    if (userPointsElement) {
        userPointsElement.style.animation = 'pulse 0.6s ease';
        setTimeout(() => {
            userPointsElement.style.animation = '';
        }, 600);
    }
    
    const headerPointsElement = document.querySelector('.user-credits');
    if (headerPointsElement) {
        headerPointsElement.style.animation = 'pulse 0.6s ease';
        setTimeout(() => {
            headerPointsElement.style.animation = '';
        }, 600);
    }
}
