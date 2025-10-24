// ============================================
// CONTROLADOR DE UBICACIONES
// ============================================

const db = require('../config/database');

// Obtener todas las ubicaciones
function getAllLocations(req, res) {
    const sql = 'SELECT * FROM locations ORDER BY created_at DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        res.json({
            mensaje: 'Ubicaciones obtenidas',
            total: rows.length,
            locations: rows
        });
    });
}

// Crear nueva ubicación
function createLocation(req, res) {
    const { name, address, latitude, longitude, type } = req.body;
    
    if (!name || !address || !type) {
        return res.status(400).json({ 
            error: 'Faltan campos: name, address, type son obligatorios' 
        });
    }
    
    const sql = `
        INSERT INTO locations (name, address, latitude, longitude, type) 
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [name, address, latitude, longitude, type], function(err) {
        if (err) {
            console.log('❌ Error al crear ubicación:', err.message);
            return res.status(500).json({ error: 'Error al crear ubicación' });
        }
        
        console.log('✅ Ubicación creada con ID:', this.lastID);
        
        res.status(201).json({
            mensaje: 'Ubicación creada exitosamente',
            location: {
                id: this.lastID,
                name,
                address,
                latitude,
                longitude,
                type
            }
        });
    });
}

module.exports = {
    getAllLocations,
    createLocation
};
