// ============================================
// MI CUENTA - LÓGICA DE LA PÁGINA
// ============================================

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', async () => {
    await requireAuth();
    await loadAccountData();
});

// Cargar datos de la cuenta
async function loadAccountData() {
    try {
        console.log('🔄 Cargando datos de la cuenta...');
        
        // Primero obtener usuario del localStorage
        let user = getUser();
        
        if (!user) {
            throw new Error('No se pudo obtener información del usuario');
        }

        console.log('👤 Usuario local:', user.name, '- Puntos:', user.credits);

        // Obtener datos actualizados del servidor
        try {
            console.log('📡 Consultando puntos actualizados del servidor...');
            const response = await fetch(`http://localhost:3000/api/puntos/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Datos del servidor recibidos:', data);
                
                // Actualizar puntos del usuario con los datos del servidor
                user.credits = data.credits || 0;
                user.total_earned = data.totalEarned || 0;
                
                // Guardar usuario actualizado en localStorage
                saveUser(user);
                
                console.log('💾 Usuario actualizado con puntos del servidor:', user.credits);
                console.log('📊 Total histórico:', user.total_earned);
            } else {
                console.warn('⚠️ No se pudieron obtener puntos del servidor, usando datos locales');
            }
        } catch (error) {
            console.warn('⚠️ Error al obtener puntos del servidor:', error.message);
            console.log('📱 Usando datos locales como respaldo');
        }

        // Actualizar información del perfil
        updateProfileInfo(user);
        
        // Actualizar insignias (usar total_earned en lugar de credits)
        const pointsForBadges = user.total_earned || user.credits || 0;
        updateBadgeInfo(pointsForBadges);
        
        // Actualizar detalles de la cuenta
        updateAccountDetails(user);
        
    } catch (error) {
        console.error('❌ Error al cargar datos de la cuenta:', error);
        alert('Error al cargar tu información. Por favor, intenta de nuevo.');
    }
}

// Actualizar información del perfil
function updateProfileInfo(user) {
    // Nombre
    const profileName = document.getElementById('profileName');
    const fullName = `${user.name} ${user.surname || ''}`.trim();
    profileName.textContent = fullName;
    
    // Email
    const profileEmail = document.getElementById('profileEmail');
    profileEmail.textContent = user.email;
    
    // Puntos disponibles
    const profilePoints = document.getElementById('profilePoints');
    profilePoints.textContent = user.credits || 0;
    
    // Total ganado
    const profileTotalEarned = document.getElementById('profileTotalEarned');
    profileTotalEarned.textContent = user.total_earned || user.credits || 0;
    
    // Fecha de registro
    const memberSince = document.getElementById('memberSince');
    if (user.created_at) {
        const date = new Date(user.created_at);
        // Formato: 2025/10/24
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        memberSince.textContent = `${year}/${month}/${day}`;
    } else {
        // Si no hay fecha, mostrar la fecha actual como fallback
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        memberSince.textContent = `${year}/${month}/${day}`;
    }
    
    // Avatar (iniciales)
    const avatarInitials = document.getElementById('avatarInitials');
    const initials = getInitials(user.name, user.surname);
    avatarInitials.textContent = initials;
}

// Obtener iniciales del nombre
function getInitials(name, surname) {
    let initials = '';
    if (name) initials += name.charAt(0);
    if (surname) initials += surname.charAt(0);
    return initials.toUpperCase() || '?';
}

// Actualizar información de insignias
function updateBadgeInfo(points) {
    // Obtener insignia actual
    const currentBadge = getBadgeByPoints(points);
    
    // Mostrar insignia actual
    displayCurrentBadge(currentBadge);
    
    // Mostrar progreso hacia la siguiente insignia
    displayBadgeProgress(points);
    
    // Mostrar todas las insignias
    displayAllBadges(points);
}

// Mostrar insignia actual
function displayCurrentBadge(badge) {
    const container = document.getElementById('currentBadgeCard');
    container.style.background = badge.gradient;
    container.style.color = 'white';
    
    container.innerHTML = `
        <div class="current-badge-icon">${badge.icon}</div>
        <h2 class="current-badge-name">${badge.name}</h2>
        <p class="current-badge-description" style="color: rgba(255,255,255,0.9);">
            ${badge.description}
        </p>
    `;
}

// Mostrar progreso hacia la siguiente insignia
function displayBadgeProgress(points) {
    const progress = getProgressToNextBadge(points);
    const container = document.getElementById('badgeProgressCard');
    
    if (!progress.nextBadge) {
        // Es la última insignia
        container.innerHTML = `
            <div class="progress-header">
                <h3 class="progress-title">🎉 ¡Felicitaciones!</h3>
            </div>
            <p style="text-align: center; color: #6c757d; margin: 20px 0;">
                Has alcanzado el nivel máximo. ¡Eres una Leyenda del Planeta!
            </p>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="progress-header">
            <h3 class="progress-title">Progreso hacia la siguiente insignia</h3>
            <span class="progress-info">${progress.percentage}%</span>
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${progress.percentage}%; background: ${progress.nextBadge.gradient};">
                ${progress.percentage}%
            </div>
        </div>
        <div class="next-badge-info">
            <div class="next-badge-icon">${progress.nextBadge.icon}</div>
            <div class="next-badge-details">
                <h4 class="next-badge-name">${progress.nextBadge.name}</h4>
                <p class="next-badge-points">
                    Te faltan ${progress.pointsToNext} puntos para desbloquear esta insignia
                </p>
            </div>
        </div>
    `;
}

// Mostrar todas las insignias
function displayAllBadges(userPoints) {
    const allBadges = getAllBadges();
    const container = document.getElementById('allBadgesGrid');
    
    container.innerHTML = allBadges.map(badge => {
        const isUnlocked = userPoints >= badge.minPoints;
        const rangeText = badge.maxPoints === Infinity 
            ? `${badge.minPoints}+ puntos`
            : `${badge.minPoints} - ${badge.maxPoints} puntos`;
        
        return `
            <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" 
                 style="border-color: ${badge.color};">
                <span class="badge-icon" style="filter: ${isUnlocked ? 'none' : 'grayscale(100%)'};">
                    ${badge.icon}
                </span>
                <h3 class="badge-name">${badge.name}</h3>
                <p class="badge-range">${rangeText}</p>
                <p class="badge-description">${badge.description}</p>
                <div class="badge-status ${isUnlocked ? 'unlocked' : 'locked'}">
                    ${isUnlocked ? '✅ Desbloqueada' : '🔒 Bloqueada'}
                </div>
            </div>
        `;
    }).join('');
}

// Actualizar detalles de la cuenta
function updateAccountDetails(user) {
    document.getElementById('userId').textContent = user.id || '-';
    document.getElementById('userFullName').textContent = 
        `${user.name} ${user.surname || ''}`.trim();
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userCredits').textContent = `${user.credits || 0} puntos`;
    document.getElementById('userTotalEarned').textContent = `${user.total_earned || user.credits || 0} puntos`;
}

// Cambiar foto de perfil (placeholder)
function changeProfilePhoto() {
    alert('Funcionalidad de cambio de foto - En desarrollo\n\nPróximamente podrás subir tu propia foto de perfil.');
}
