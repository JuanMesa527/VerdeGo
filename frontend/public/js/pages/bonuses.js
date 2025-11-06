// ============================================
// MIS BONOS - LÓGICA DE LA PÁGINA
// ============================================

// Catálogo de bonos colombianos
const BONUSES_CATALOG = [
    // ROPA
    {
        id: 'arturo-calle-50',
        category: 'ropa',
        brand: 'Arturo Calle',
        icon: '👔',
        value: '$50.000',
        description: 'Bono de $50.000 COP para compras en cualquier tienda Arturo Calle',
        points: 500
    },
    {
        id: 'studio-f-30',
        category: 'ropa',
        brand: 'Studio F',
        icon: '👗',
        value: '$30.000',
        description: 'Bono de $30.000 COP en moda femenina Studio F',
        points: 300
    },
    {
        id: 'koaj-40',
        category: 'ropa',
        brand: 'Koaj',
        icon: '👕',
        value: '$40.000',
        description: 'Bono de $40.000 COP para compras en Koaj',
        points: 400
    },
    {
        id: 'adidas-60',
        category: 'ropa',
        brand: 'Adidas Colombia',
        icon: '👟',
        value: '$60.000',
        description: 'Bono de $60.000 COP en productos Adidas',
        points: 600
    },

    // COMIDA
    {
        id: 'juan-valdez-20',
        category: 'comida',
        brand: 'Juan Valdez',
        icon: '☕',
        value: '$20.000',
        description: 'Bono de $20.000 COP para disfrutar café y alimentos en Juan Valdez',
        points: 200
    },
    {
        id: 'crepes-waffles-50',
        category: 'comida',
        brand: 'Crepes & Waffles',
        icon: '🧇',
        value: '$50.000',
        description: 'Bono de $50.000 COP para comer en Crepes & Waffles',
        points: 500
    },
    {
        id: 'archies-30',
        category: 'comida',
        brand: "Archie's",
        icon: '🍕',
        value: '$30.000',
        description: "Bono de $30.000 COP en Archie's Pizza",
        points: 300
    },
    {
        id: 'el-corral-40',
        category: 'comida',
        brand: 'El Corral',
        icon: '🍔',
        value: '$40.000',
        description: 'Bono de $40.000 COP para hamburguesas en El Corral',
        points: 400
    },
    {
        id: 'frisby-25',
        category: 'comida',
        brand: 'Frisby',
        icon: '🍗',
        value: '$25.000',
        description: 'Bono de $25.000 COP en pollo Frisby',
        points: 250
    },

    // TECNOLOGÍA
    {
        id: 'alkosto-100',
        category: 'tecnologia',
        brand: 'Alkosto',
        icon: '💻',
        value: '$100.000',
        description: 'Bono de $100.000 COP para compras en Alkosto',
        points: 1000
    },
    {
        id: 'exito-80',
        category: 'tecnologia',
        brand: 'Éxito',
        icon: '🛒',
        value: '$80.000',
        description: 'Bono de $80.000 COP para compras en Almacenes Éxito',
        points: 800
    },
    {
        id: 'falabella-75',
        category: 'tecnologia',
        brand: 'Falabella',
        icon: '🏬',
        value: '$75.000',
        description: 'Bono de $75.000 COP para compras en Falabella',
        points: 750
    },

    // ENTRETENIMIENTO
    {
        id: 'cine-colombia-35',
        category: 'entretenimiento',
        brand: 'Cine Colombia',
        icon: '🎬',
        value: '$35.000',
        description: 'Bono de $35.000 COP para boletas y combo en Cine Colombia',
        points: 350
    },
    {
        id: 'procinal-30',
        category: 'entretenimiento',
        brand: 'Procinal',
        icon: '🍿',
        value: '$30.000',
        description: 'Bono de $30.000 COP para cine en Procinal',
        points: 300
    },
    {
        id: 'spotify-premium',
        category: 'entretenimiento',
        brand: 'Spotify Premium',
        icon: '🎵',
        value: '1 Mes',
        description: '1 mes de Spotify Premium',
        points: 150
    }
];

const INITIAL_BONUSES_SHOW = 3; // Mostrar inicialmente 3 bonos canjeados

let currentUser = null;
let userPoints = 0;
let redeemedBonuses = [];
let selectedBonus = null;
let showAllBonuses = false; // Controla si mostrar todos o solo 3

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    await requireAuth();
    await loadUserData();
    displayBonuses('all');
    // Los bonos canjeados ya se cargan en loadUserData()
});

// ============================================
// CARGAR DATOS DEL USUARIO
// ============================================

async function loadUserData() {
    try {
        currentUser = getUser();
        
        if (!currentUser) {
            throw new Error('No se pudo obtener información del usuario');
        }

        // Obtener puntos actualizados del servidor
        try {
            const response = await fetch(`${API_URL}/puntos/${currentUser.id}`);
            if (response.ok) {
                const data = await response.json();
                userPoints = data.credits || 0;
                currentUser.credits = userPoints;
                currentUser.total_earned = data.totalEarned || 0;
                saveUser(currentUser);
                console.log('✅ Puntos del usuario cargados:', userPoints);
            } else {
                userPoints = currentUser.credits || 0;
            }
        } catch (error) {
            console.log('⚠️ Usando puntos locales');
            userPoints = currentUser.credits || 0;
        }

        // Cargar bonos canjeados desde el servidor (IMPORTANTE: antes de updatePointsDisplay)
        await loadRedeemedBonusesFromServer();

        // Actualizar UI de puntos (después de cargar los bonos)
        updatePointsDisplay();

    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        alert('Error al cargar tu información. Por favor, intenta de nuevo.');
    }
}

// ============================================
// ACTUALIZAR DISPLAY DE PUNTOS
// ============================================

function updatePointsDisplay() {
    document.getElementById('userPoints').textContent = userPoints;
    
    // Calcular estadísticas desde los bonos canjeados
    const totalRedeemed = redeemedBonuses.reduce((sum, bonus) => sum + bonus.points, 0);
    const totalEarned = currentUser.total_earned || (userPoints + totalRedeemed);
    
    console.log('📊 Actualizando display de puntos:');
    console.log('   - Puntos disponibles:', userPoints);
    console.log('   - Total ganado:', totalEarned);
    console.log('   - Total canjeado:', totalRedeemed);
    console.log('   - Bonos canjeados:', redeemedBonuses.length);
    
    document.getElementById('totalEarned').textContent = `${totalEarned} pts`;
    document.getElementById('totalRedeemed').textContent = `${totalRedeemed} pts`;
}

// ============================================
// MOSTRAR BONOS
// ============================================

function displayBonuses(category) {
    const grid = document.getElementById('bonusesGrid');
    
    let bonusesToShow = BONUSES_CATALOG;
    if (category !== 'all') {
        bonusesToShow = BONUSES_CATALOG.filter(bonus => bonus.category === category);
    }

    grid.innerHTML = bonusesToShow.map(bonus => {
        const canRedeem = userPoints >= bonus.points;
        const statusClass = canRedeem ? 'available' : 'locked';
        const statusText = canRedeem ? '✅ Disponible' : '🔒 Bloqueado';

        return `
            <div class="bonus-card ${canRedeem ? '' : 'locked'}" data-category="${bonus.category}">
                <div class="bonus-header">
                    <div class="bonus-icon">${bonus.icon}</div>
                    <div class="bonus-brand">${bonus.brand}</div>
                    <div class="bonus-value">${bonus.value}</div>
                </div>
                <div class="bonus-body">
                    <p class="bonus-description">${bonus.description}</p>
                    <div class="bonus-points">
                        <div class="points-cost">
                            <span>⭐</span>
                            <span>${bonus.points} puntos</span>
                        </div>
                        <span class="bonus-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
                <div class="bonus-footer">
                    <button class="btn-redeem ${statusClass}" 
                            onclick="openRedeemModal('${bonus.id}')"
                            ${!canRedeem ? 'disabled' : ''}>
                        ${canRedeem ? '🎁 Canjear Bono' : '🔒 Puntos Insuficientes'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// FILTRAR POR CATEGORÍA
// ============================================

function filterCategory(category) {
    // Actualizar tabs activos
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Mostrar bonos filtrados
    displayBonuses(category);
}

// ============================================
// MODAL DE CONFIRMACIÓN
// ============================================

function openRedeemModal(bonusId) {
    selectedBonus = BONUSES_CATALOG.find(b => b.id === bonusId);
    
    if (!selectedBonus) return;

    const modal = document.getElementById('confirmModal');
    const modalBody = document.getElementById('modalBody');

    const remainingPoints = userPoints - selectedBonus.points;

    modalBody.innerHTML = `
        <div class="modal-bonus-info">
            <div style="text-align: center; font-size: 64px; margin-bottom: 15px;">
                ${selectedBonus.icon}
            </div>
            <div class="modal-bonus-brand">${selectedBonus.brand}</div>
            <div class="modal-bonus-details">
                <div>💰 Valor: ${selectedBonus.value}</div>
                <div>📝 ${selectedBonus.description}</div>
            </div>
        </div>
        <p style="text-align: center; color: #6c757d; margin: 15px 0;">
            ¿Estás seguro de que deseas canjear este bono?
        </p>
        <div class="modal-points-info">
            <div>
                <div style="font-size: 12px; color: #6c757d;">Puntos actuales</div>
                <div style="font-size: 20px; color: #28a745;">${userPoints} pts</div>
            </div>
            <div style="font-size: 24px; color: #6c757d;">→</div>
            <div>
                <div style="font-size: 12px; color: #6c757d;">Después del canje</div>
                <div style="font-size: 20px; color: ${remainingPoints >= 0 ? '#28a745' : '#dc3545'};">${remainingPoints} pts</div>
            </div>
        </div>
    `;

    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('confirmModal').classList.remove('show');
    selectedBonus = null;
}

// ============================================
// CONFIRMAR CANJE
// ============================================

async function confirmRedeem() {
    if (!selectedBonus) return;

    try {
        // Descontar puntos
        const newPoints = userPoints - selectedBonus.points;

        if (newPoints < 0) {
            alert('❌ No tienes suficientes puntos');
            return;
        }

        // Generar código del bono
        const bonusCode = generateBonusCode();

        // Actualizar puntos en el servidor
        const pointsResponse = await fetch(`${API_URL}/actualizar-puntos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                userId: currentUser.id,
                pointsToAdd: -selectedBonus.points
            })
        });

        if (!pointsResponse.ok) {
            throw new Error('Error al actualizar puntos en el servidor');
        }

        const pointsData = await pointsResponse.json();
        userPoints = pointsData.newTotal;

        // Guardar bono canjeado en el servidor
        const bonusResponse = await fetch(`${API_URL}/canjear-bono`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                userId: currentUser.id,
                bonusId: selectedBonus.id,
                bonusBrand: selectedBonus.brand,
                bonusValue: selectedBonus.value,
                bonusIcon: selectedBonus.icon,
                bonusCategory: selectedBonus.category,
                pointsCost: selectedBonus.points,
                bonusCode: bonusCode
            })
        });

        if (!bonusResponse.ok) {
            throw new Error('Error al guardar el bono');
        }

        // Actualizar usuario en localStorage
        currentUser.credits = userPoints;
        currentUser.total_earned = pointsData.totalEarned;
        saveUser(currentUser);

        // Crear objeto del bono canjeado
        const redeemedBonus = {
            ...selectedBonus,
            redeemedAt: new Date().toISOString(),
            code: bonusCode
        };

        // Cerrar modal de confirmación
        closeModal();

        // Mostrar modal de éxito
        showSuccessModal(redeemedBonus);

        // Recargar bonos canjeados desde el servidor
        await loadRedeemedBonusesFromServer();

        // Actualizar displays
        updatePointsDisplay();
        displayBonuses('all');
        updateAuthUI();

    } catch (error) {
        console.error('❌ Error al canjear bono:', error);
        alert('Error al canjear el bono. Por favor, intenta de nuevo.');
    }
}

// ============================================
// MODAL DE ÉXITO
// ============================================

function showSuccessModal(bonus) {
    const modal = document.getElementById('successModal');
    const body = document.getElementById('successBody');

    body.innerHTML = `
        <div style="font-size: 80px; margin: 20px 0;">
            ${bonus.icon}
        </div>
        <p style="font-size: 18px; margin-bottom: 10px;">
            <strong>Has obtenido el bono de:</strong>
        </p>
        <h3 style="color: #28a745; margin-bottom: 20px; font-size: 28px;">
            ${bonus.brand}
        </h3>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <div style="font-size: 14px; color: #6c757d; margin-bottom: 10px;">
                Código del bono:
            </div>
            <div style="font-size: 24px; font-weight: bold; color: #333; font-family: monospace; letter-spacing: 2px;">
                ${bonus.code}
            </div>
        </div>
        <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
            Puedes ver este código en la sección "Mis Bonos Canjeados" más abajo
        </p>
    `;

    modal.classList.add('show');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
}

// ============================================
// GENERAR CÓDIGO DE BONO
// ============================================

function generateBonusCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ============================================
// CARGAR BONOS CANJEADOS DESDE EL SERVIDOR
// ============================================

async function loadRedeemedBonusesFromServer() {
    try {
        console.log('🔄 Cargando bonos canjeados del servidor...');
        const response = await fetch(`${API_URL}/bonos-canjeados/${currentUser.id}`);
        
        if (response.ok) {
            const data = await response.json();
            
            console.log('📦 Respuesta del servidor:', data);
            
            // Convertir bonos del servidor al formato del frontend
            redeemedBonuses = data.bonuses.map(bonus => ({
                id: bonus.bonus_id,
                brand: bonus.bonus_brand,
                value: bonus.bonus_value,
                icon: bonus.bonus_icon,
                category: bonus.bonus_category,
                points: bonus.points_cost,
                code: bonus.bonus_code,
                redeemedAt: bonus.redeemed_at
            }));
            
            console.log('✅ Bonos canjeados cargados:', redeemedBonuses.length);
            console.log('💰 Total de puntos canjeados:', data.totalRedeemed);
            
            // Mostrar los bonos
            displayRedeemedBonuses();
        } else {
            console.log('⚠️ No se pudieron cargar bonos del servidor');
            redeemedBonuses = [];
            displayRedeemedBonuses();
        }
    } catch (error) {
        console.error('❌ Error al cargar bonos:', error);
        redeemedBonuses = [];
        displayRedeemedBonuses();
    }
}

// ============================================
// MOSTRAR BONOS CANJEADOS
// ============================================

function displayRedeemedBonuses() {
    const list = document.getElementById('redeemedList');

    if (redeemedBonuses.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎁</div>
                <p>Aún no has canjeado ningún bono</p>
                <p style="font-size: 14px; margin-top: 10px;">
                    Recicla más para ganar puntos y canjear bonos increíbles
                </p>
            </div>
        `;
        return;
    }

    // Determinar cuántos elementos mostrar
    const itemsToShow = showAllBonuses ? redeemedBonuses.length : Math.min(INITIAL_BONUSES_SHOW, redeemedBonuses.length);
    const bonusesToDisplay = redeemedBonuses.slice(0, itemsToShow);

    const bonusesHTML = bonusesToDisplay.map(bonus => {
        const date = new Date(bonus.redeemedAt);
        const formattedDate = date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="redeemed-item">
                <div class="redeemed-info">
                    <div class="redeemed-icon">${bonus.icon}</div>
                    <div class="redeemed-details">
                        <div class="redeemed-brand">${bonus.brand} - ${bonus.value}</div>
                        <div class="redeemed-date">📅 ${formattedDate}</div>
                        <div style="font-family: monospace; font-size: 12px; color: #28a745; margin-top: 5px;">
                            🎟️ Código: ${bonus.code}
                        </div>
                    </div>
                </div>
                <div class="redeemed-cost">-${bonus.points} pts</div>
            </div>
        `;
    }).join('');

    // Agregar botón "Ver más" si hay más de 3 elementos
    let showMoreButton = '';
    if (redeemedBonuses.length > INITIAL_BONUSES_SHOW) {
        if (showAllBonuses) {
            showMoreButton = `
                <button class="btn-show-more" onclick="toggleShowAllBonuses()">
                    ▲ Ver menos
                </button>
            `;
        } else {
            const remaining = redeemedBonuses.length - INITIAL_BONUSES_SHOW;
            showMoreButton = `
                <button class="btn-show-more" onclick="toggleShowAllBonuses()">
                    ▼ Ver ${remaining} más
                </button>
            `;
        }
    }

    list.innerHTML = bonusesHTML + showMoreButton;
}

// ============================================
// TOGGLE MOSTRAR TODOS LOS BONOS
// ============================================

function toggleShowAllBonuses() {
    showAllBonuses = !showAllBonuses;
    displayRedeemedBonuses();
}
