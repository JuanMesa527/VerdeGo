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
async function register(cedula, name, surname, email, password) {
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
                password 
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
    const user = getUser();

    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    if (authenticated && user) {
        // Usuario autenticado - Mostrar perfil y botón de cerrar sesión
        authButtons.innerHTML = `
            <span class="user-info">
                <span class="user-welcome">👋 Hola, ${user.name || user.email.split('@')[0]}</span>
                <span class="user-credits">⭐ ${user.credits} créditos</span>
                <span class="user-rank">🏆 ${user.rank_name || 'Novato'}</span>
            </span>
            <button class="btn-logout" onclick="logout()">Cerrar Sesión</button>
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
