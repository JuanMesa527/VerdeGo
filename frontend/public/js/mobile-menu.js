// ============================================
// MENÚ MÓVIL - SOLO < 768px
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🍔 Inicializando menú móvil...');
    setupMobileMenuEventListeners();
    
    // Reinicializar al cambiar tamaño
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
});

function setupMobileMenuEventListeners() {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuOverlay = document.querySelector('.menu-overlay');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    console.log('🔍 Elementos encontrados:');
    console.log('   - Menu toggle:', menuToggle ? '✅' : '❌');
    console.log('   - Menu overlay:', menuOverlay ? '✅' : '❌');
    console.log('   - Nav buttons:', navButtons.length);
    
    // Toggle menú
    if (menuToggle) {
        // Remover listeners anteriores si existen
        menuToggle.replaceWith(menuToggle.cloneNode(true));
        const newMenuToggle = document.querySelector('.menu-toggle');
        
        newMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🍔 Click en menú hamburguesa');
            toggleMobileMenu();
        });
        
        console.log('✅ Event listener agregado al menú toggle');
    } else {
        console.warn('⚠️ No se encontró el botón menu-toggle');
    }
    
    // Cerrar con overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', (e) => {
            console.log('🔲 Click en overlay');
            closeMobileMenu();
        });
    }
    
    // Cerrar al hacer clic en un botón
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                console.log('📱 Click en botón de navegación (móvil)');
                closeMobileMenu();
            }
        });
    });
}

function toggleMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const isActive = menuToggle?.classList.contains('active');
    
    console.log('🔄 Toggle menú - Estado actual:', isActive ? 'Abierto' : 'Cerrado');
    
    if (isActive) {
        console.log('➡️ Cerrando menú...');
        closeMobileMenu();
    } else {
        console.log('➡️ Abriendo menú...');
        openMobileMenu();
    }
}

function openMobileMenu() {
    console.log('📂 Abriendo menú móvil...');
    document.querySelector('.menu-toggle')?.classList.add('active');
    document.querySelector('.nav-buttons')?.classList.add('active');
    document.querySelector('.auth-buttons')?.classList.add('active');
    document.querySelector('.menu-overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('✅ Menú abierto');
}

function closeMobileMenu() {
    console.log('📁 Cerrando menú móvil...');
    document.querySelector('.menu-toggle')?.classList.remove('active');
    document.querySelector('.nav-buttons')?.classList.remove('active');
    document.querySelector('.auth-buttons')?.classList.remove('active');
    document.querySelector('.menu-overlay')?.classList.remove('active');
    document.body.style.overflow = '';
    console.log('✅ Menú cerrado');
}
