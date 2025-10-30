// ============================================
// SISTEMA DE AUTENTICACIÓN CON JWT + localStorage
// ============================================

const API_URL = 'http://localhost:3000/api';

// ============================================
// GESTIÓN DE TOKEN (localStorage)
// ============================================

// Guardar token en localStorage
function saveToken(token) {
    localStorage.setItem('authToken', token);
}

// Obtener token de localStorage
function getToken() {
    return localStorage.getItem('authToken');
}

// Eliminar token de localStorage
function removeToken() {
    localStorage.removeItem('authToken');
}

// Guardar datos del usuario
function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Obtener datos del usuario
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Eliminar datos del usuario
function removeUser() {
    localStorage.removeItem('user');
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

// Registro de usuario
async function register(cedula, name, surname, email, password, referralCode) {
    try {
        const response = await fetch(`${API_URL}/crear-usuario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                id: cedula, 
                name,
                surname,
                email, 
                password,
                referralCodeUsed: referralCode || null
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en el registro');
        }

        // Después de registrar, hacer login automático
        await login(email, password);

        return data;
    } catch (error) {
        throw error;
    }
}

// Inicio de sesión
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en el inicio de sesión');
        }

        // Guardar token y usuario en localStorage
        saveToken(data.token);
        saveUser(data.user);

        console.log('✅ Login exitoso. Token guardado.');

        return data;
    } catch (error) {
        throw error;
    }
}

// Cerrar sesión
function logout() {
    removeToken();
    removeUser();
    console.log('👋 Sesión cerrada');
    window.location.href = '/';
}

// Verificar si está autenticado
async function isAuthenticated() {
    const token = getToken();
    if (!token) return false;

    try {
        const response = await fetch(`${API_URL}/verificar-token`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            return true;
        } else {
            // Token inválido o expirado
            removeToken();
            removeUser();
            return false;
        }
    } catch (error) {
        return false;
    }
}

// Obtener perfil del usuario autenticado
async function getProfile() {
    const token = getToken();
    if (!token) throw new Error('No autenticado');

    try {
        const response = await fetch(`${API_URL}/perfil`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al obtener perfil');
        }

        // Actualizar datos del usuario guardados
        saveUser(data.user);

        return data.user;
    } catch (error) {
        throw error;
    }
}

// ============================================
// ACTUALIZACIÓN DE UI SEGÚN AUTENTICACIÓN
// ============================================

async function updateAuthUI() {
    const authenticated = await isAuthenticated();
    let user = getUser();

    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    if (authenticated && user) {
        // Intentar obtener puntos actualizados del servidor
        try {
            const response = await fetch(`http://localhost:3000/api/puntos/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                user.credits = data.credits || 0;
                saveUser(user); // Actualizar localStorage
                console.log('✅ Puntos actualizados en el menú:', user.credits);
            }
        } catch (error) {
            console.log('⚠️ No se pudieron actualizar puntos, usando datos locales');
        }

        // Usuario autenticado - Mostrar menú de usuario
        authButtons.innerHTML = `
            <div class="user-menu-container">
                <button class="user-menu-btn" onclick="toggleUserMenu()">
                    <span class="user-info-compact">
                        <span class="user-name">👋 ${user.name || user.email.split('@')[0]}</span>
                        <span class="user-credits">⭐ ${user.credits || 0}</span>
                    </span>
                    <span class="menu-arrow">▼</span>
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <div class="dropdown-header">
                        <div class="user-avatar">👤</div>
                        <div class="user-details">
                            <p class="user-full-name">${user.name} ${user.surname || ''}</p>
                            <p class="user-email">${user.email}</p>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <ul class="dropdown-menu">
                        <li class="dropdown-item" onclick="goToMyAccount()">
                            <span class="item-icon">👤</span>
                            <span class="item-text">Mi Cuenta</span>
                        </li>
                        <li class="dropdown-item" onclick="goToMyBonuses()">
                            <span class="item-icon">🎁</span>
                            <span class="item-text">Mis Bonos</span>
                        </li>
                        <li class="dropdown-item" onclick="goToMyRecharges()">
                            <span class="item-icon">💳</span>
                            <span class="item-text">Mis Recargas</span>
                        </li>
                        <li class="dropdown-divider"></li>
                        <li class="dropdown-item logout-item" onclick="logout()">
                            <span class="item-icon">🚪</span>
                            <span class="item-text">Cerrar Sesión</span>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        // Usuario no autenticado - Mostrar botones de login/registro
        authButtons.innerHTML = `
            <button class="btn-login" onclick="window.location.href='/pages/login.html'">Iniciar Sesión</button>
            <button class="btn-register" onclick="window.location.href='/pages/register.html'">Registro</button>
        `;
    }
}

// ============================================
// FUNCIONES DEL MENÚ DE USUARIO
// ============================================

// Toggle del menú desplegable
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (event) => {
    const userMenu = document.querySelector('.user-menu-container');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && dropdown && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Navegación a Mi Cuenta
function goToMyAccount() {
    window.location.href = '/pages/user/account.html';
}

// Navegación a Mis Bonos
function goToMyBonuses() {
    window.location.href = '/pages/user/bonuses.html';
}

// Navegación a Mis Recargas
function goToMyRecharges() {
    window.location.href = '/pages/user/recharges.html';
}

// ============================================
// PROTECCIÓN DE RUTAS
// ============================================

// Redirigir a login si no está autenticado
async function requireAuth() {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = '/pages/login.html';
    }
}

// Redirigir a index si YA está autenticado (para login/register)
async function redirectIfAuthenticated() {
    const authenticated = await isAuthenticated();
    if (authenticated) {
        window.location.href = '/';
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Ejecutar al cargar cualquier página
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    
    // Si estamos en login o register, redirigir si ya está autenticado
    const currentPage = window.location.pathname;
    if (currentPage.includes('login.html') || currentPage.includes('register.html')) {
        redirectIfAuthenticated();
    }
});
