// ============================================
// SISTEMA DE INSIGNIAS DE VERDEGO
// ============================================

const BADGES = {
    NOVATO: {
        id: 1,
        name: 'Reciclador Novato',
        minPoints: 0,
        maxPoints: 99,
        icon: '🌱',
        color: '#6c757d',
        gradient: 'linear-gradient(135deg, #6c757d 0%, #868e96 100%)',
        description: 'Estás comenzando tu viaje ecológico'
    },
    RECOLECTOR: {
        id: 2,
        name: 'Recolector Ecológico',
        minPoints: 100,
        maxPoints: 299,
        icon: '♻️',
        color: '#17a2b8',
        gradient: 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)',
        description: 'Tu compromiso con el ambiente está creciendo'
    },
    GUARDIAN: {
        id: 3,
        name: 'Guardian Ambiental',
        minPoints: 300,
        maxPoints: 599,
        icon: '🛡️',
        color: '#28a745',
        gradient: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        description: 'Proteges activamente nuestro planeta'
    },
    HEROE: {
        id: 4,
        name: 'Héroe Verde',
        minPoints: 600,
        maxPoints: 999,
        icon: '🦸',
        color: '#ffc107',
        gradient: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
        description: 'Eres un ejemplo para tu comunidad'
    },
    LEYENDA: {
        id: 5,
        name: 'Leyenda del Planeta',
        minPoints: 1000,
        maxPoints: Infinity,
        icon: '👑',
        color: '#dc3545',
        gradient: 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)',
        description: 'Has alcanzado el nivel máximo de compromiso ambiental'
    }
};

// Obtener insignia según puntos
function getBadgeByPoints(points) {
    const badges = Object.values(BADGES);
    for (let badge of badges) {
        if (points >= badge.minPoints && points <= badge.maxPoints) {
            return badge;
        }
    }
    return BADGES.NOVATO; // Por defecto
}

// Obtener todas las insignias (para mostrar el progreso)
function getAllBadges() {
    return Object.values(BADGES);
}

// Calcular progreso hacia la siguiente insignia
function getProgressToNextBadge(points) {
    const currentBadge = getBadgeByPoints(points);
    const allBadges = getAllBadges();
    const currentIndex = allBadges.findIndex(b => b.id === currentBadge.id);
    
    // Si es la última insignia, progreso al 100%
    if (currentIndex === allBadges.length - 1) {
        return {
            percentage: 100,
            pointsToNext: 0,
            nextBadge: null,
            currentBadge: currentBadge
        };
    }
    
    const nextBadge = allBadges[currentIndex + 1];
    const pointsInCurrentRange = points - currentBadge.minPoints;
    const rangeSize = nextBadge.minPoints - currentBadge.minPoints;
    const percentage = Math.min(100, (pointsInCurrentRange / rangeSize) * 100);
    const pointsToNext = nextBadge.minPoints - points;
    
    return {
        percentage: Math.round(percentage),
        pointsToNext: Math.max(0, pointsToNext),
        nextBadge: nextBadge,
        currentBadge: currentBadge
    };
}

// Exportar funciones (si usas módulos, sino están disponibles globalmente)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BADGES,
        getBadgeByPoints,
        getAllBadges,
        getProgressToNextBadge
    };
}
