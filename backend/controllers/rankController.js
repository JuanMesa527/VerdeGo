// ============================================
// CONTROLADOR DE RANGOS
// ============================================

const db = require('../config/database');

// Obtener todos los rangos
function getAllRanks(req, res) {
    const sql = 'SELECT * FROM ranks ORDER BY min_credits ASC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json({
            mensaje: 'Rangos obtenidos',
            total: rows.length,
            ranks: rows
        });
    });
}

// Crear nuevo rango
function createRank(req, res) {
    const { name, min_credits, max_credits } = req.body;
    
    if (!name || min_credits === undefined || max_credits === undefined) {
        return res.status(400).json({ 
            error: 'Faltan campos: name, min_credits, max_credits son obligatorios' 
        });
    }
    
    const sql = `
        INSERT INTO ranks (name, min_credits, max_credits) 
        VALUES (?, ?, ?)
    `;
    
    db.run(sql, [name, min_credits, max_credits], function(err) {
        if (err) {
            console.log('❌ Error al crear rango:', err.message);
            return res.status(500).json({ error: 'Error al crear rango' });
        }
        
        console.log('✅ Rango creado con ID:', this.lastID);
        
        res.status(201).json({
            mensaje: 'Rango creado exitosamente',
            rank: {
                id: this.lastID,
                name,
                min_credits,
                max_credits
            }
        });
    });
}

module.exports = {
    getAllRanks,
    createRank
};
