// ============================================
// ANIMACIONES HERO SECTION - VerdeGo
// ============================================

// Obtener estadísticas desde la API
async function loadStats() {
    try {
        const response = await fetch('http://localhost:3000/api/stats');
        const data = await response.json();
        
        if (data.success) {
            // Actualizar los data-target con los valores reales
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers[0].setAttribute('data-target', data.stats.locations);
            statNumbers[1].setAttribute('data-target', data.stats.users);
            statNumbers[2].setAttribute('data-target', data.stats.bonuses);
            
            // Iniciar animación de contadores
            animateCounters();
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        // Si hay error, usar valores por defecto y animar igual
        animateCounters();
    }
}

// Animación de contadores
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        // Iniciar animación cuando sea visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && counter.textContent === '0') {
                    updateCounter();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// Animación de partículas
function createParticleAnimation() {
    const particles = document.querySelectorAll('.particle');
    
    particles.forEach((particle, index) => {
        // Posición aleatoria
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDelay = Math.random() * 5;
        const randomDuration = 15 + Math.random() * 10;
        
        particle.style.left = `${randomX}%`;
        particle.style.top = `${randomY}%`;
        particle.style.animationDelay = `${randomDelay}s`;
        particle.style.animationDuration = `${randomDuration}s`;
        
        // Tamaño aleatorio
        const size = 4 + Math.random() * 8;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
    });
}

// Animación del texto del título - DESACTIVADA
function animateTitle() {
    // Función desactivada para evitar que el texto se pegue
    // const titleText = document.querySelector('.title-text');
    // if (!titleText) return;
    
    // const text = titleText.textContent;
    // titleText.textContent = '';
    // titleText.style.display = 'inline-block';
    
    // // Dividir en letras
    // text.split('').forEach((char, index) => {
    //     const span = document.createElement('span');
    //     span.textContent = char;
    //     span.style.display = 'inline-block';
    //     span.style.opacity = '0';
    //     span.style.transform = 'translateY(-20px)';
    //     span.style.animation = `letterFadeIn 0.5s ease forwards ${index * 0.05}s`;
    //     titleText.appendChild(span);
    // });
}

// Efecto de hover en las estadísticas
function setupStatHoverEffects() {
    const statItems = document.querySelectorAll('.stat-item');
    
    statItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Scroll suave al hacer click en botones
function setupSmoothScroll() {
    // El botón de Ver Mapa ahora abre el modal
    // Ya no hace scroll
    
    // Scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            document.querySelector('.map-section').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
}

// Efecto parallax en el hero - DESACTIVADO
function setupParallaxEffect() {
    // Función desactivada para mantener el hero section estático
    // const heroSection = document.querySelector('.hero-section');
    
    // window.addEventListener('scroll', () => {
    //     const scrolled = window.pageYOffset;
    //     const parallaxSpeed = 0.5;
    //     
    //     if (scrolled < window.innerHeight) {
    //         heroSection.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    //         heroSection.style.opacity = 1 - (scrolled / window.innerHeight);
    //     }
    // });
}

// Animación de las etiquetas de características
function animateFeatureTags() {
    const featureTags = document.querySelectorAll('.feature-tag');
    
    featureTags.forEach((tag, index) => {
        setTimeout(() => {
            tag.style.opacity = '1';
            tag.style.transform = 'scale(1)';
        }, 1000 + (index * 200));
    });
}

// Efecto de typing en la descripción
function typingEffect() {
    const description = document.querySelector('.hero-description');
    if (!description) return;
    
    const originalText = description.textContent;
    description.textContent = '';
    description.style.opacity = '1';
    
    let index = 0;
    const speed = 30; // milisegundos por letra
    
    function type() {
        if (index < originalText.length) {
            // Mantener el HTML para los spans highlight
            if (originalText.charAt(index) === '<') {
                let endTag = originalText.indexOf('>', index);
                description.innerHTML += originalText.substring(index, endTag + 1);
                index = endTag + 1;
            } else {
                description.textContent += originalText.charAt(index);
                index++;
            }
            setTimeout(type, speed);
        }
    }
    
    // Iniciar después de que el título termine
    setTimeout(type, 1500);
}

// Añadir efecto ripple a los botones
function setupRippleEffect() {
    const button = document.querySelector('.hero-cta button');
    
    if (button) {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }
}

// Efecto de brillo en el badge
function animateBadge() {
    const badge = document.querySelector('.hero-badge');
    if (!badge) return;
    
    setInterval(() => {
        badge.style.animation = 'none';
        setTimeout(() => {
            badge.style.animation = 'badgeShine 2s ease-in-out';
        }, 10);
    }, 5000);
}

// Inicializar todas las animaciones
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un momento para que todo cargue
    setTimeout(() => {
        loadStats(); // Cargar estadísticas desde la API
        createParticleAnimation();
        animateTitle();
        setupStatHoverEffects();
        setupSmoothScroll();
        setupParallaxEffect();
        animateFeatureTags();
        setupRippleEffect();
        animateBadge();
    }, 100);
});

// Reiniciar animaciones cuando la ventana se redimensiona
window.addEventListener('resize', () => {
    createParticleAnimation();
});
