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

// Obtener una ubicación por ID
function getLocationById(req, res) {
    const { id } = req.params;
    const sql = 'SELECT * FROM locations WHERE id = ?';
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Ubicación no encontrada' });
        }
        
        res.json({
            mensaje: 'Ubicación encontrada',
            location: row
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

// Actualizar ubicación
function updateLocation(req, res) {
    const { id } = req.params;
    const { name, address, latitude, longitude, type } = req.body;
    
    if (!name || !address || !type) {
        return res.status(400).json({ 
            error: 'Faltan campos: name, address, type son obligatorios' 
        });
    }
    
    const sql = `
        UPDATE locations 
        SET name = ?, address = ?, latitude = ?, longitude = ?, type = ?
        WHERE id = ?
    `;
    
    db.run(sql, [name, address, latitude, longitude, type, id], function(err) {
        if (err) {
            console.log('❌ Error al actualizar ubicación:', err.message);
            return res.status(500).json({ error: 'Error al actualizar ubicación' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Ubicación no encontrada' });
        }
        
        console.log('✅ Ubicación actualizada con ID:', id);
        
        res.json({
            mensaje: 'Ubicación actualizada exitosamente',
            location: {
                id: parseInt(id),
                name,
                address,
                latitude,
                longitude,
                type
            }
        });
    });
}

// Eliminar ubicación
function deleteLocation(req, res) {
    const { id } = req.params;
    const sql = 'DELETE FROM locations WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            console.log('❌ Error al eliminar ubicación:', err.message);
            return res.status(500).json({ error: 'Error al eliminar ubicación' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Ubicación no encontrada' });
        }
        
        console.log('✅ Ubicación eliminada con ID:', id);
        
        res.json({
            mensaje: 'Ubicación eliminada exitosamente',
            id: parseInt(id)
        });
    });
}

module.exports = {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation
};
