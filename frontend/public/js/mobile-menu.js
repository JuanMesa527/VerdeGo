// ============================================
// MENÚ MÓVIL - SOLO < 768px
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    // Reinicializar al cambiar tamaño
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
});

function setupEventListeners() {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuOverlay = document.querySelector('.menu-overlay');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    // Toggle menú
    if (menuToggle) {
        menuToggle.onclick = (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        };
    }
    
    // Cerrar con overlay
    if (menuOverlay) {
        menuOverlay.onclick = closeMobileMenu;
    }
    
    // Cerrar al hacer clic en un botón
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
}

function toggleMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const isActive = menuToggle?.classList.contains('active');
    
    if (isActive) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    document.querySelector('.menu-toggle')?.classList.add('active');
    document.querySelector('.nav-buttons')?.classList.add('active');
    document.querySelector('.auth-buttons')?.classList.add('active');
    document.querySelector('.menu-overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    document.querySelector('.menu-toggle')?.classList.remove('active');
    document.querySelector('.nav-buttons')?.classList.remove('active');
    document.querySelector('.auth-buttons')?.classList.remove('active');
    document.querySelector('.menu-overlay')?.classList.remove('active');
    document.body.style.overflow = '';
}
