// ============================================
// CONTROLADOR DE BONOS
// ============================================

const db = require('../config/database');

// Guardar un bono canjeado
function redeemBonus(req, res) {
    const { 
        userId, 
        bonusId, 
        bonusBrand, 
        bonusValue, 
        bonusIcon, 
        bonusCategory, 
        pointsCost, 
        bonusCode 
    } = req.body;
    
    console.log('🎁 Solicitud de canje de bono:');
    console.log('   - Usuario ID:', userId);
    console.log('   - Bono:', bonusBrand);
    console.log('   - Costo:', pointsCost);
    
    if (!userId || !bonusId || !pointsCost) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }
    
    const sql = `
        INSERT INTO redeemed_bonuses 
        (user_id, bonus_id, bonus_brand, bonus_value, bonus_icon, bonus_category, points_cost, bonus_code) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [userId, bonusId, bonusBrand, bonusValue, bonusIcon, bonusCategory, pointsCost, bonusCode], function(err) {
        if (err) {
            console.error('❌ Error al guardar bono canjeado:', err.message);
            return res.status(500).json({ error: 'Error al guardar el bono' });
        }
        
        console.log('✅ Bono canjeado guardado exitosamente!');
        console.log('   - ID del registro:', this.lastID);
        
        res.json({
            mensaje: 'Bono canjeado exitosamente',
            bonusRecordId: this.lastID
        });
    });
}

// Obtener bonos canjeados por un usuario
function getUserRedeemedBonuses(req, res) {
    const userId = req.params.userId;
    
    const sql = `
        SELECT * FROM redeemed_bonuses 
        WHERE user_id = ? 
        ORDER BY redeemed_at DESC
    `;
    
    db.all(sql, [userId], (err, bonuses) => {
        if (err) {
            console.error('❌ Error al obtener bonos canjeados:', err.message);
            return res.status(500).json({ error: 'Error al obtener bonos' });
        }
        
        // Calcular total de puntos canjeados
        const totalRedeemed = bonuses.reduce((sum, bonus) => sum + bonus.points_cost, 0);
        
        res.json({
            bonuses: bonuses,
            totalRedeemed: totalRedeemed,
            count: bonuses.length
        });
    });
}

// Obtener estadísticas de bonos de un usuario
function getUserBonusStats(req, res) {
    const userId = req.params.userId;
    
    const sql = `
        SELECT 
            COUNT(*) as total_bonuses,
            SUM(points_cost) as total_points_redeemed,
            MAX(redeemed_at) as last_redemption
        FROM redeemed_bonuses 
        WHERE user_id = ?
    `;
    
    db.get(sql, [userId], (err, stats) => {
        if (err) {
            console.error('❌ Error al obtener estadísticas:', err.message);
            return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
        
        res.json({
            totalBonuses: stats.total_bonuses || 0,
            totalPointsRedeemed: stats.total_points_redeemed || 0,
            lastRedemption: stats.last_redemption
        });
    });
}

module.exports = {
    redeemBonus,
    getUserRedeemedBonuses,
    getUserBonusStats
};
