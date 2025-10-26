// ============================================
// CONTROLADOR DE ESTADÍSTICAS
// ============================================

const db = require('../config/database');

// Obtener estadísticas generales de la plataforma
function getStats(req, res) {
    // Contar usuarios
    const countUsersQuery = 'SELECT COUNT(*) as count FROM users';
    
    // Contar ubicaciones
    const countLocationsQuery = 'SELECT COUNT(*) as count FROM locations';
    
    // Contar bonos canjeados
    const countBonusesQuery = 'SELECT COUNT(*) as count FROM redeemed_bonuses';
    
    // Ejecutar las consultas en paralelo
    db.get(countUsersQuery, [], (err, usersResult) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener usuarios: ' + err.message });
        }
        
        db.get(countLocationsQuery, [], (err, locationsResult) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener ubicaciones: ' + err.message });
            }
            
            db.get(countBonusesQuery, [], (err, bonusesResult) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al obtener bonos: ' + err.message });
                }
                
                // Enviar respuesta con todas las estadísticas
                res.json({
                    success: true,
                    stats: {
                        locations: locationsResult.count || 0,
                        users: usersResult.count || 0,
                        bonuses: bonusesResult.count || 0
                    }
                });
            });
        });
    });
}

module.exports = {
    getStats
};
