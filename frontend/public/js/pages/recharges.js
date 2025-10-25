// ============================================
// MIS RECARGAS - LÓGICA DE LA PÁGINA
// ============================================

// Constantes
const POINTS_TO_COP = 10; // 1 punto = $10 COP
const MIN_RECHARGE = 100; // $100 COP mínimo
const MAX_RECHARGE = 10000; // $10,000 COP máximo
const INITIAL_ITEMS_SHOW = 3; // Mostrar inicialmente 3 recargas

let currentUser = null;
let userPoints = 0;
let rechargeHistory = [];
let selectedRecharge = null;
let showAllRecharges = false; // Controla si mostrar todas o solo 3

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    await requireAuth();
    await loadUserData();
    await loadRechargeHistory();
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

        console.log('👤 Usuario actual:', currentUser.name);

        // SIEMPRE obtener puntos actualizados del servidor
        try {
            console.log('🔄 Obteniendo puntos del servidor...');
            const response = await fetch(`http://localhost:3000/api/puntos/${currentUser.id}`);
            
            if (response.ok) {
                const data = await response.json();
                userPoints = data.credits || 0;
                currentUser.credits = userPoints;
                saveUser(currentUser);
                console.log('✅ Puntos sincronizados desde servidor:', userPoints);
            } else {
                console.warn('⚠️ No se pudo obtener puntos del servidor, usando locales');
                userPoints = currentUser.credits || 0;
            }
        } catch (error) {
            console.warn('⚠️ Error de conexión, usando puntos locales:', error);
            userPoints = currentUser.credits || 0;
        }

        // Actualizar UI
        updatePointsDisplay();
        console.log('📊 Puntos disponibles:', userPoints);

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
    
    const maxRechargeAmount = Math.min(userPoints * POINTS_TO_COP, MAX_RECHARGE);
    document.getElementById('maxRecharge').textContent = `$${maxRechargeAmount.toLocaleString('es-CO')} COP`;
}

// ============================================
// CALCULAR PUNTOS NECESARIOS
// ============================================

function calculatePoints() {
    const amountInput = document.getElementById('rechargeAmount');
    const cardNumberInput = document.getElementById('cardNumber');
    const calculationCard = document.getElementById('calculationCard');
    const rechargeBtn = document.getElementById('rechargeBtn');
    
    const amount = parseInt(amountInput.value) || 0;
    const cardNumber = cardNumberInput.value.replace(/\s/g, ''); // Remover espacios
    
    if (amount < MIN_RECHARGE) {
        calculationCard.style.display = 'none';
        rechargeBtn.disabled = true;
        return;
    }
    
    if (amount > MAX_RECHARGE) {
        amountInput.value = MAX_RECHARGE;
        calculatePoints();
        return;
    }
    
    const pointsNeeded = Math.ceil(amount / POINTS_TO_COP);
    const remainingPoints = userPoints - pointsNeeded;
    
    // Mostrar cálculos
    calculationCard.style.display = 'block';
    document.getElementById('displayAmount').textContent = `$${amount.toLocaleString('es-CO')} COP`;
    document.getElementById('pointsNeeded').textContent = `${pointsNeeded} pts`;
    document.getElementById('pointsAvailable').textContent = `${userPoints} pts`;
    document.getElementById('remainingPoints').textContent = `${remainingPoints} pts`;
    
    // Cambiar color si quedan negativos
    const remainingElement = document.getElementById('remainingPoints');
    if (remainingPoints < 0) {
        remainingElement.style.color = '#dc3545';
        rechargeBtn.disabled = true;
    } else {
        remainingElement.style.color = '#11998e';
        // Habilitar botón solo si también tiene número de tarjeta válido (16 dígitos)
        rechargeBtn.disabled = cardNumber.length !== 16;
    }
}

// ============================================
// FORMATEAR NÚMERO DE TARJETA
// ============================================

function formatCardNumber(input) {
    // Remover todo lo que no sea número
    let value = input.value.replace(/\D/g, '');
    
    // Limitar a 16 dígitos
    value = value.substring(0, 16);
    
    // Agregar espacios cada 4 dígitos
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += ' ';
        }
        formatted += value[i];
    }
    
    input.value = formatted;
    calculatePoints();
}

// ============================================
// ESTABLECER MONTO RÁPIDO
// ============================================

function setAmount(amount) {
    document.getElementById('rechargeAmount').value = amount;
    calculatePoints();
}

// ============================================
// PROCESAR RECARGA
// ============================================

function processRecharge() {
    const cardNumberInput = document.getElementById('cardNumber').value.trim();
    const cardNumber = cardNumberInput.replace(/\s/g, ''); // Remover espacios
    const amount = parseInt(document.getElementById('rechargeAmount').value) || 0;
    
    if (cardNumber.length !== 16) {
        alert('⚠️ Por favor ingresa un número de tarjeta válido de 16 dígitos');
        return;
    }
    
    if (amount < MIN_RECHARGE || amount > MAX_RECHARGE) {
        alert(`⚠️ El monto debe estar entre $${MIN_RECHARGE} y $${MAX_RECHARGE} COP`);
        return;
    }
    
    const pointsNeeded = Math.ceil(amount / POINTS_TO_COP);
    
    if (pointsNeeded > userPoints) {
        alert('❌ No tienes suficientes puntos para esta recarga');
        return;
    }
    
    selectedRecharge = {
        cardNumber: cardNumber,
        cardNumberFormatted: cardNumberInput, // Guardar versión formateada para display
        amount: amount,
        pointsNeeded: pointsNeeded
    };
    
    openConfirmModal();
}

// ============================================
// MODAL DE CONFIRMACIÓN
// ============================================

function openConfirmModal() {
    const modal = document.getElementById('confirmModal');
    const modalBody = document.getElementById('modalBody');
    
    const remainingPoints = userPoints - selectedRecharge.pointsNeeded;
    
    modalBody.innerHTML = `
        <div class="modal-recharge-info">
            <div class="modal-recharge-card">
                🚌 Tarjeta TuLlave: ${selectedRecharge.cardNumberFormatted}
            </div>
            <div class="modal-recharge-details">
                <div class="modal-detail-row">
                    <span>Monto a recargar:</span>
                    <strong style="color: #11998e;">$${selectedRecharge.amount.toLocaleString('es-CO')} COP</strong>
                </div>
                <div class="modal-detail-row">
                    <span>Puntos a usar:</span>
                    <strong style="color: #dc3545;">-${selectedRecharge.pointsNeeded} pts</strong>
                </div>
                <div class="modal-detail-row">
                    <span>Puntos actuales:</span>
                    <span>${userPoints} pts</span>
                </div>
                <div class="modal-detail-row">
                    <span>Puntos restantes:</span>
                    <strong style="color: #11998e;">${remainingPoints} pts</strong>
                </div>
            </div>
        </div>
        <p style="text-align: center; color: #6c757d; font-size: 14px;">
            ¿Confirmas que deseas realizar esta recarga?
        </p>
    `;
    
    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('confirmModal').classList.remove('show');
    selectedRecharge = null;
}

// ============================================
// CONFIRMAR RECARGA
// ============================================

async function confirmRecharge() {
    if (!selectedRecharge) return;
    
    // Deshabilitar botón para evitar clicks múltiples
    const confirmBtn = document.querySelector('.btn-confirm');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Procesando...';
    }
    
    let rechargeSuccess = false;
    
    try {
        console.log('🔄 Iniciando recarga:', {
            puntos: selectedRecharge.pointsNeeded,
            monto: selectedRecharge.amount,
            tarjeta: selectedRecharge.cardNumber
        });
        
        // Descontar puntos
        const response = await fetch('http://localhost:3000/api/actualizar-puntos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                userId: currentUser.id,
                pointsToAdd: -selectedRecharge.pointsNeeded
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al actualizar puntos');
        }
        
        const data = await response.json();
        console.log('✅ Puntos actualizados:', data);
        
        // Actualizar puntos localmente INMEDIATAMENTE
        userPoints = data.newTotal;
        currentUser.credits = userPoints;
        saveUser(currentUser);
        
        // Marcar como éxito parcial (puntos ya descontados)
        rechargeSuccess = true;
        
        // Guardar recarga en el servidor
        try {
            const rechargeResponse = await fetch('http://localhost:3000/api/crear-recarga', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    cardNumber: selectedRecharge.cardNumber,
                    amount: selectedRecharge.amount,
                    pointsUsed: selectedRecharge.pointsNeeded,
                    transactionId: generateTransactionId()
                })
            });
            
            // Intentar parsear respuesta pero no fallar si hay error
            if (rechargeResponse.ok) {
                try {
                    const rechargeData = await rechargeResponse.json();
                    console.log('✅ Recarga guardada:', rechargeData);
                } catch (parseError) {
                    console.log('✅ Recarga procesada (sin respuesta JSON)');
                }
            }
        } catch (saveError) {
            // Si falla guardar la recarga, igual continuamos porque los puntos ya se descontaron
            console.warn('⚠️ Error al guardar recarga, pero puntos ya descontados');
        }
        
        // Cerrar modal de confirmación
        closeModal();
        
        // Actualizar displays ANTES de mostrar modal de éxito
        updatePointsDisplay();
        document.getElementById('userPoints').textContent = userPoints;
        
        // Actualizar UI de autenticación (header)
        if (typeof updateAuthUI === 'function') {
            updateAuthUI();
        }
        
        // Recargar historial INMEDIATAMENTE (antes del modal)
        console.log('🔄 Actualizando historial...');
        try {
            await loadRechargeHistory();
            console.log('✅ Historial actualizado');
        } catch (historyError) {
            console.warn('⚠️ No se pudo actualizar historial');
        }
        
        // Limpiar formulario
        document.getElementById('cardNumber').value = '';
        document.getElementById('rechargeAmount').value = '';
        document.getElementById('calculationCard').style.display = 'none';
        document.getElementById('rechargeBtn').disabled = true;
        
        // Mostrar modal de éxito DESPUÉS de actualizar todo
        showSuccessModal(selectedRecharge);
        
        console.log('✅ Recarga completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error al procesar recarga:', error);
        
        // Si los puntos ya fueron descontados, mostrar éxito de todos modos
        if (rechargeSuccess) {
            console.log('✅ Mostrando éxito porque puntos ya fueron descontados');
            
            closeModal();
            updatePointsDisplay();
            document.getElementById('userPoints').textContent = userPoints;
            
            if (typeof updateAuthUI === 'function') {
                updateAuthUI();
            }
            
            try {
                await loadRechargeHistory();
            } catch (e) {}
            
            document.getElementById('cardNumber').value = '';
            document.getElementById('rechargeAmount').value = '';
            document.getElementById('calculationCard').style.display = 'none';
            document.getElementById('rechargeBtn').disabled = true;
            
            showSuccessModal(selectedRecharge);
            return;
        }
        
        // Solo mostrar error si realmente falló todo
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirmar';
        }
        
        alert(`❌ Error: ${error.message}\n\nPor favor, verifica tu conexión e intenta de nuevo.`);
        
        // Recargar puntos del servidor por si acaso
        try {
            const response = await fetch(`http://localhost:3000/api/puntos/${currentUser.id}`);
            if (response.ok) {
                const data = await response.json();
                userPoints = data.credits || 0;
                currentUser.credits = userPoints;
                saveUser(currentUser);
                updatePointsDisplay();
            }
        } catch (reloadError) {
            console.error('❌ Error al recargar puntos:', reloadError);
        }
    }
}

// ============================================
// MODAL DE ÉXITO
// ============================================

function showSuccessModal(recharge) {
    const modal = document.getElementById('successModal');
    const body = document.getElementById('successBody');
    
    // Calcular puntos restantes
    const puntosRestantes = userPoints;
    
    body.innerHTML = `
        <div style="font-size: 80px; margin: 20px 0;">
            🚌
        </div>
        <p style="font-size: 18px; margin-bottom: 10px;">
            <strong>¡Recarga procesada exitosamente!</strong>
        </p>
        <h3 style="color: #11998e; margin-bottom: 20px; font-size: 32px;">
            $${recharge.amount.toLocaleString('es-CO')} COP
        </h3>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <div style="font-size: 14px; color: #6c757d; margin-bottom: 10px;">
                Tarjeta TuLlave:
            </div>
            <div style="font-size: 20px; font-weight: bold; color: #333; font-family: monospace; letter-spacing: 2px;">
                ${recharge.cardNumberFormatted}
            </div>
        </div>
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #11998e;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6c757d;">Puntos usados:</span>
                <strong style="color: #dc3545;">-${recharge.pointsNeeded} pts</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: #6c757d;">Puntos restantes:</span>
                <strong style="color: #11998e; font-size: 18px;">${puntosRestantes} pts</strong>
            </div>
        </div>
        <p style="color: #6c757d; font-size: 13px; margin-top: 10px;">
            El saldo estará disponible en tu tarjeta en los próximos minutos
        </p>
    `;
    
    modal.classList.add('show');
}

async function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
    
    // Refrescar puntos una vez más para estar seguros
    try {
        const response = await fetch(`http://localhost:3000/api/puntos/${currentUser.id}`);
        if (response.ok) {
            const data = await response.json();
            userPoints = data.credits || 0;
            currentUser.credits = userPoints;
            saveUser(currentUser);
            updatePointsDisplay();
            
            // Actualizar header también
            if (typeof updateAuthUI === 'function') {
                updateAuthUI();
            }
            
            console.log('✅ Puntos refrescados al cerrar modal:', userPoints);
        }
    } catch (error) {
        console.warn('⚠️ No se pudo refrescar puntos:', error);
    }
}

// ============================================
// GENERAR ID DE TRANSACCIÓN
// ============================================

function generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TL${timestamp}${random}`;
}

// ============================================
// CARGAR HISTORIAL DE RECARGAS
// ============================================

async function loadRechargeHistory() {
    try {
        console.log('📋 Cargando historial de recargas...');
        const response = await fetch(`http://localhost:3000/api/recargas/${currentUser.id}`);
        
        if (response.ok) {
            const data = await response.json();
            rechargeHistory = data.recharges || [];
            console.log(`✅ ${rechargeHistory.length} recargas encontradas`);
            displayRechargeHistory();
        } else {
            console.warn('⚠️ No se pudo cargar el historial');
            rechargeHistory = [];
            displayRechargeHistory();
        }
    } catch (error) {
        console.error('❌ Error al cargar historial:', error);
        rechargeHistory = [];
        displayRechargeHistory();
    }
}

// ============================================
// MOSTRAR HISTORIAL DE RECARGAS
// ============================================

function displayRechargeHistory() {
    const list = document.getElementById('historyList');
    const badge = document.getElementById('historyBadge');
    
    console.log('📊 Mostrando historial:', rechargeHistory.length, 'recargas');
    
    // Actualizar badge con contador
    if (badge) {
        badge.textContent = rechargeHistory.length;
        badge.style.display = rechargeHistory.length > 0 ? 'inline-block' : 'none';
    }
    
    if (rechargeHistory.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💳</div>
                <p>Aún no has realizado ninguna recarga</p>
                <p style="font-size: 14px; margin-top: 10px;">
                    Convierte tus puntos en saldo para tu tarjeta TuLlave
                </p>
            </div>
        `;
        return;
    }
    
    // Determinar cuántos elementos mostrar
    const itemsToShow = showAllRecharges ? rechargeHistory.length : Math.min(INITIAL_ITEMS_SHOW, rechargeHistory.length);
    const rechargesToDisplay = rechargeHistory.slice(0, itemsToShow);
    
    // Generar HTML del historial con animación de entrada
    const historyHTML = rechargesToDisplay.map((recharge, index) => {
        const date = new Date(recharge.created_at);
        const formattedDate = date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Formatear número de tarjeta
        const cardNumber = recharge.card_number;
        const formattedCard = cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
        
        // Agregar clase 'new' al primer elemento (más reciente) para animación
        const isNew = index === 0 && !showAllRecharges ? 'history-item-new' : '';
        
        return `
            <div class="history-item ${isNew}">
                <div class="history-info">
                    <div class="history-icon">🚌</div>
                    <div class="history-details">
                        <div class="history-card">Tarjeta ${formattedCard}</div>
                        <div class="history-date">📅 ${formattedDate}</div>
                        <div class="history-transaction">ID: ${recharge.transaction_id}</div>
                    </div>
                </div>
                <div class="history-values">
                    <div class="history-amount">$${recharge.amount.toLocaleString('es-CO')} COP</div>
                    <div class="history-points">-${recharge.points_used} pts</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Agregar botón "Ver más" si hay más de 3 elementos
    let showMoreButton = '';
    if (rechargeHistory.length > INITIAL_ITEMS_SHOW) {
        if (showAllRecharges) {
            showMoreButton = `
                <button class="btn-show-more" onclick="toggleShowAllRecharges()">
                    ▲ Ver menos
                </button>
            `;
        } else {
            const remaining = rechargeHistory.length - INITIAL_ITEMS_SHOW;
            showMoreButton = `
                <button class="btn-show-more" onclick="toggleShowAllRecharges()">
                    ▼ Ver ${remaining} más
                </button>
            `;
        }
    }
    
    list.innerHTML = historyHTML + showMoreButton;
    
    console.log('✅ Historial actualizado en DOM');
    
    // Si hay elementos nuevos, hacer scroll suave hacia el historial
    if (rechargeHistory.length > 0 && !showAllRecharges) {
        setTimeout(() => {
            const historySection = document.querySelector('.history-section');
            if (historySection) {
                historySection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }
        }, 100);
    }
}

// ============================================
// TOGGLE MOSTRAR TODAS LAS RECARGAS
// ============================================

function toggleShowAllRecharges() {
    showAllRecharges = !showAllRecharges;
    displayRechargeHistory();
}
