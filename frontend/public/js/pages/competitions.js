// ============================================
// LÓGICA DE COMPETENCIAS
// ============================================

// API_URL ya está definido en auth.js

let currentUser = null;
let activeCompetition = null;
let selectedUniversity = null;
let currentFilter = 'current';

// Inicializar página
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si hay token pero no redirigir si no lo hay
    const token = getToken();
    if (token) {
        await checkAuth();
    } else {
        // Mostrar contenido sin autenticación
        currentUser = null;
        updateAuthButtonsForGuest();
    }
    
    await loadActiveCompetition();
    await loadRanking('current');
    
    if (currentUser) {
        await loadUserContributions();
        await loadUserRewards();
    }
    
    setupEventListeners();
});

// Verificar autenticación
async function checkAuth() {
    const token = getToken(); // Usar función de auth.js
    
    if (!token) {
        return false;
    }
    
    try {
        const response = await fetch(`${API_URL}/perfil`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('No autorizado');
        }
        
        const data = await response.json();
        currentUser = data.user; // Cambiar de data.usuario a data.user
        
        console.log('👤 Usuario cargado:', currentUser);
        
        // Actualizar puntos en el header solo si currentUser está definido
        if (currentUser && currentUser.credits !== undefined) {
            const userPointsEl = document.getElementById('userPoints');
            if (userPointsEl) {
                userPointsEl.textContent = currentUser.credits || 0;
            }
        }
        
        // Actualizar botón de auth
        updateAuthButtons();
        
        return true;
        
    } catch (error) {
        console.error('Error de autenticación:', error);
        removeToken(); // Usar función de auth.js
        currentUser = null;
        return false;
    }
}

// Actualizar botones de autenticación
function updateAuthButtons() {
    const authButtons = document.querySelector('.auth-buttons');
    if (currentUser) {
        authButtons.innerHTML = `
            <button class="btn-profile" onclick="window.location.href='/pages/user/account'">
                👤 ${currentUser.name}
            </button>
            <button class="btn-logout" onclick="logout()">Cerrar Sesión</button>
        `;
    }
}

// Actualizar botones para invitado
function updateAuthButtonsForGuest() {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.innerHTML = `
            <button class="btn-login" onclick="window.location.href='/pages/login.html'">Iniciar Sesión</button>
            <button class="btn-register" onclick="window.location.href='/pages/register.html'">Registro</button>
        `;
    }
}

// Cerrar sesión
function logout() {
    removeToken(); // Usar función de auth.js
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Cargar competencia activa
async function loadActiveCompetition() {
    try {
        console.log('📡 Cargando competencia activa...');
        const response = await fetch(`${API_URL}/competencia-activa`);
        const data = await response.json();
        
        console.log('✅ Datos recibidos:', data);
        
        activeCompetition = data.competition;
        
        console.log('🎯 Competencia activa:', activeCompetition);
        
        renderCompetitionInfo();
        
    } catch (error) {
        console.error('❌ Error al cargar competencia:', error);
        activeCompetition = null;
        renderNoCompetition();
    }
}

// Renderizar información de la competencia
function renderCompetitionInfo() {
    const infoCard = document.getElementById('competitionInfo');
    
    if (!activeCompetition) {
        renderNoCompetition();
        return;
    }
    
    const startDate = new Date(activeCompetition.start_date);
    const endDate = new Date(activeCompetition.end_date);
    const now = new Date();
    
    const timeRemaining = calculateTimeRemaining(endDate);
    
    infoCard.innerHTML = `
        <div class="competition-active">
            <div class="info-item">
                <span class="info-icon">🏆</span>
                <span class="info-label">Competencia Actual</span>
                <span class="info-value">${activeCompetition.name}</span>
            </div>
            <div class="info-item">
                <span class="info-icon">📅</span>
                <span class="info-label">Fecha de Inicio</span>
                <span class="info-value">${formatDate(startDate)}</span>
            </div>
            <div class="info-item">
                <span class="info-icon">⏰</span>
                <span class="info-label">Fecha de Finalización</span>
                <span class="info-value">${formatDate(endDate)}</span>
            </div>
            <div class="info-item">
                <span class="info-icon">⏳</span>
                <span class="info-label">Tiempo Restante</span>
                <span class="info-value">
                    <span class="competition-timer" id="competitionTimer">${timeRemaining}</span>
                </span>
            </div>
            <div class="info-item">
                <span class="info-icon">🎁</span>
                <span class="info-label">Recompensa</span>
                <span class="info-value">${activeCompetition.reward_percentage}% + Bonus</span>
            </div>
        </div>
    `;
    
    // Actualizar timer cada segundo
    startTimer(endDate);
}

// Renderizar sin competencia
function renderNoCompetition() {
    const infoCard = document.getElementById('competitionInfo');
    
    infoCard.innerHTML = `
        <div class="no-competition">
            <div class="no-competition-icon">📢</div>
            <h3>No hay competencias activas</h3>
            <p>Mantente atento para participar en la próxima competencia</p>
        </div>
    `;
}

// Calcular tiempo restante
function calculateTimeRemaining(endDate) {
    const now = new Date();
    const diff = endDate - now;
    
    if (diff <= 0) {
        return 'Finalizada';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Iniciar temporizador
function startTimer(endDate) {
    const timerElement = document.getElementById('competitionTimer');
    if (!timerElement) return;
    
    setInterval(() => {
        const timeRemaining = calculateTimeRemaining(endDate);
        timerElement.textContent = timeRemaining;
        
        if (timeRemaining === 'Finalizada') {
            location.reload();
        }
    }, 60000); // Actualizar cada minuto
}

// Formatear fecha
function formatDate(date) {
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Cargar ranking
async function loadRanking(filter = 'current') {
    currentFilter = filter;
    const rankingGrid = document.getElementById('rankingGrid');
    
    rankingGrid.innerHTML = `
        <div class="ranking-loading">
            <div class="loading-spinner"></div>
            <p>Cargando ranking...</p>
        </div>
    `;
    
    try {
        let url = `${API_URL}/ranking-universidades`;
        if (filter === 'current' && activeCompetition) {
            url += `?competitionId=${activeCompetition.id}`;
        }
        
        console.log('📊 Cargando ranking con URL:', url);
        console.log('   - Filtro:', filter);
        console.log('   - Competencia activa:', activeCompetition);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('📊 Ranking recibido:', data.ranking);
        
        renderRanking(data.ranking);
        
    } catch (error) {
        console.error('Error al cargar ranking:', error);
        rankingGrid.innerHTML = `
            <div class="ranking-loading">
                <p>Error al cargar el ranking</p>
            </div>
        `;
    }
}

// Renderizar ranking
function renderRanking(universities) {
    const rankingGrid = document.getElementById('rankingGrid');
    
    // Si no hay competencia activa y el filtro es 'current', mostrar mensaje
    if (currentFilter === 'current' && !activeCompetition) {
        rankingGrid.innerHTML = `
            <div class="no-contributions">
                <div class="no-contributions-icon">📢</div>
                <p>No hay competencia activa en este momento</p>
                <p style="font-size: 14px; color: #6c757d;">Selecciona "Histórico Global" para ver el ranking general</p>
            </div>
        `;
        return;
    }
    
    if (universities.length === 0) {
        rankingGrid.innerHTML = `
            <div class="no-contributions">
                <div class="no-contributions-icon">🏫</div>
                <p>No hay universidades en el ranking</p>
            </div>
        `;
        return;
    }
    
    rankingGrid.innerHTML = universities.map(uni => {
        const rankClass = uni.rank <= 3 ? `rank-${uni.rank}` : '';
        const canContribute = activeCompetition && currentUser;
        
        return `
            <div class="university-card ${rankClass}">
                <div class="rank-badge">#${uni.rank}</div>
                <div class="university-logo">${uni.logo}</div>
                <div class="university-details">
                    <h3 class="university-name">${uni.name}</h3>
                    <div class="university-stats">
                        <div class="stat">
                            <span class="stat-icon-small">⭐</span>
                            <span><span class="stat-value-inline">${uni.total_points || 0}</span> puntos</span>
                        </div>
                        <div class="stat">
                            <span class="stat-icon-small">👥</span>
                            <span><span class="stat-value-inline">${uni.total_contributors || 0}</span> contribuyentes</span>
                        </div>
                    </div>
                </div>
                <div class="university-actions">
                    <button 
                        class="btn-contribute" 
                        onclick="openContributeModal(${uni.id}, '${uni.name}', '${uni.logo}')"
                        ${!canContribute ? 'disabled' : ''}
                    >
                        ${canContribute ? 'Contribuir' : 'No disponible'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Abrir modal de contribución
function openContributeModal(universityId, universityName, universityLogo) {
    // Verificar si hay usuario autenticado
    if (!currentUser) {
        alert('Debes iniciar sesión para contribuir');
        window.location.href = '/pages/login.html';
        return;
    }
    
    if (!activeCompetition) {
        alert('No hay competencia activa');
        return;
    }
    
    selectedUniversity = { id: universityId, name: universityName, logo: universityLogo };
    
    const modal = document.getElementById('contributeModal');
    const modalUniversityInfo = document.getElementById('modalUniversityInfo');
    const modalAvailablePoints = document.getElementById('modalAvailablePoints');
    const pointsInput = document.getElementById('pointsInput');
    const contributionPreview = document.getElementById('contributionPreview');
    const modalAlert = document.getElementById('modalAlert');
    
    // Limpiar
    pointsInput.value = '';
    contributionPreview.style.display = 'none';
    modalAlert.style.display = 'none';
    
    // Llenar información
    modalUniversityInfo.innerHTML = `
        <div class="modal-university-logo">${universityLogo}</div>
        <div>
            <h4 class="modal-university-name">${universityName}</h4>
        </div>
    `;
    
    modalAvailablePoints.textContent = currentUser.credits || 0;
    
    modal.classList.add('active');
}

// Cerrar modal
function closeContributeModal() {
    const modal = document.getElementById('contributeModal');
    modal.classList.remove('active');
    selectedUniversity = null;
}

// Confirmar contribución
async function confirmContribution() {
    const pointsInput = document.getElementById('pointsInput');
    const points = parseInt(pointsInput.value);
    const modalAlert = document.getElementById('modalAlert');
    const confirmBtn = document.getElementById('confirmContributeBtn');
    
    modalAlert.style.display = 'none';
    
    console.log('🎯 Intentando contribuir:', {
        points,
        currentUser,
        selectedUniversity,
        activeCompetition
    });
    
    if (!points || points <= 0) {
        showModalAlert('Por favor ingresa una cantidad válida', 'error');
        return;
    }
    
    if (!currentUser || !currentUser.id) {
        showModalAlert('Error: Usuario no identificado. Por favor recarga la página.', 'error');
        return;
    }
    
    if (points > currentUser.credits) {
        showModalAlert('No tienes suficientes puntos', 'error');
        return;
    }
    
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Procesando...';
    
    try {
        const token = getToken(); // Usar función de auth.js
        
        const requestBody = {
            userId: currentUser.id,
            universityId: selectedUniversity.id,
            points: points,
            competitionId: activeCompetition.id
        };
        
        console.log('📤 Enviando solicitud:', requestBody);
        
        const response = await fetch(`${API_URL}/contribuir-universidad`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        console.log('📥 Respuesta del servidor:', data);
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al contribuir');
        }
        
        showModalAlert('¡Contribución exitosa!', 'success');
        
        // Actualizar puntos del usuario
        currentUser.credits = data.newBalance;
        const userPointsEl = document.getElementById('userPoints');
        if (userPointsEl) {
            userPointsEl.textContent = currentUser.credits;
        }
        
        // Cerrar modal y recargar página para actualizar todo
        setTimeout(() => {
            closeContributeModal();
            location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('Error al contribuir:', error);
        showModalAlert(error.message, 'error');
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Contribuir Puntos';
    }
}

// Mostrar alerta en modal
function showModalAlert(message, type) {
    const modalAlert = document.getElementById('modalAlert');
    modalAlert.textContent = message;
    modalAlert.className = `modal-alert ${type}`;
    modalAlert.style.display = 'block';
}

// Cargar contribuciones del usuario
async function loadUserContributions() {
    if (!currentUser) return;
    
    try {
        let url = `${API_URL}/contribuciones/${currentUser.id}`;
        if (activeCompetition) {
            url += `?competitionId=${activeCompetition.id}`;
        }
        
        console.log('📊 Cargando contribuciones desde:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('✅ Datos de contribuciones recibidos:', data);
        
        renderContributions(data.contributions, data.totalContributed);
        
    } catch (error) {
        console.error('Error al cargar contribuciones:', error);
    }
}

// Cargar recompensas del usuario
async function loadUserRewards() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_URL}/recompensas/${currentUser.id}`);
        const data = await response.json();
        
        console.log('📦 Recompensas recibidas:', data);
        
        // Actualizar total de recompensas
        const rewardsReceivedEl = document.getElementById('rewardsReceived');
        if (rewardsReceivedEl && data.rewards) {
            const totalRewards = data.rewards.reduce((sum, r) => sum + r.reward_points, 0);
            rewardsReceivedEl.textContent = totalRewards;
        }
        
        // Renderizar lista de recompensas
        renderRewards(data.rewards);
        
    } catch (error) {
        console.error('Error al cargar recompensas:', error);
    }
}

// Renderizar recompensas
function renderRewards(rewards) {
    const rewardsList = document.getElementById('rewardsList');
    
    if (!rewardsList) return;
    
    if (!rewards || rewards.length === 0) {
        rewardsList.innerHTML = `
            <div class="no-contributions">
                <div class="no-contributions-icon">🎁</div>
                <p>${currentUser ? 'Aún no has recibido recompensas de competencias' : 'Inicia sesión para ver tus recompensas'}</p>
            </div>
        `;
        return;
    }
    
    rewardsList.innerHTML = rewards.map(reward => {
        const date = new Date(reward.created_at);
        const rankEmojis = ['🥇', '🥈', '🥉'];
        const rankEmoji = reward.university_rank <= 3 ? rankEmojis[reward.university_rank - 1] : '🏅';
        const rankText = reward.university_rank === 1 ? 'Ganador' : 
                        reward.university_rank === 2 ? '2do Lugar' : 
                        reward.university_rank === 3 ? '3er Lugar' : 
                        `${reward.university_rank}° Lugar`;
        
        return `
            <div class="contribution-item" style="border-left: 4px solid #28a745;">
                <div class="contribution-info">
                    <div class="contribution-logo">${reward.university_logo || '🎓'}</div>
                    <div class="contribution-details">
                        <h4>${rankEmoji} ${rankText}</h4>
                        <p>${formatDate(date)} - ${reward.competition_name}</p>
                        <p style="font-size: 12px; color: #6c757d;">Contribución: ${reward.points_contributed} pts</p>
                    </div>
                </div>
                <div class="contribution-points" style="color: #28a745;">
                    +${reward.reward_points} pts
                </div>
            </div>
        `;
    }).join('');
}

// Renderizar contribuciones
function renderContributions(contributions, totalContributed) {
    const contributionList = document.getElementById('contributionList');
    const totalContributedEl = document.getElementById('totalContributed');
    const contributionCountEl = document.getElementById('contributionCount');
    
    console.log('🎨 Renderizando contribuciones:');
    console.log('   - Contributions:', contributions);
    console.log('   - Total:', totalContributed);
    console.log('   - Count:', contributions ? contributions.length : 0);
    
    if (!totalContributedEl || !contributionCountEl) {
        console.error('❌ No se encontraron los elementos totalContributed o contributionCount');
        return;
    }
    
    totalContributedEl.textContent = totalContributed || 0;
    contributionCountEl.textContent = contributions ? contributions.length : 0;
    
    console.log('✅ Valores actualizados:');
    console.log('   - totalContributed:', totalContributedEl.textContent);
    console.log('   - contributionCount:', contributionCountEl.textContent);
    
    if (!contributionList) return;
    
    if (!contributions || contributions.length === 0) {
        contributionList.innerHTML = `
            <div class="no-contributions">
                <div class="no-contributions-icon">📝</div>
                <p>${currentUser ? 'No has realizado contribuciones aún' : 'Inicia sesión para ver tus contribuciones'}</p>
            </div>
        `;
        return;
    }
    
    contributionList.innerHTML = contributions.map(contribution => {
        const date = new Date(contribution.contributed_at || contribution.created_at);
        
        return `
            <div class="contribution-item">
                <div class="contribution-info">
                    <div class="contribution-logo">${contribution.university_logo}</div>
                    <div class="contribution-details">
                        <h4>${contribution.university_name}</h4>
                        <p>${formatDate(date)} - ${contribution.competition_name}</p>
                    </div>
                </div>
                <div class="contribution-points">
                    +${contribution.points_contributed} pts
                </div>
            </div>
        `;
    }).join('');
}

// Configurar event listeners
function setupEventListeners() {
    // Filtros de ranking
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            loadRanking(filter);
        });
    });
    
    // Input de puntos - mostrar preview
    const pointsInput = document.getElementById('pointsInput');
    if (pointsInput) {
        pointsInput.addEventListener('input', () => {
            const points = parseInt(pointsInput.value) || 0;
            const contributionPreview = document.getElementById('contributionPreview');
            const previewUniversity = document.getElementById('previewUniversity');
            const previewPoints = document.getElementById('previewPoints');
            const previewRemaining = document.getElementById('previewRemaining');
            
            if (points > 0) {
                contributionPreview.style.display = 'block';
                previewUniversity.textContent = selectedUniversity ? selectedUniversity.name : '-';
                previewPoints.textContent = points;
                previewRemaining.textContent = (currentUser.credits - points);
            } else {
                contributionPreview.style.display = 'none';
            }
        });
    }
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('contributeModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeContributeModal();
        }
    });
}
