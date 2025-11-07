// ============================================
// MIDDLEWARE PARA ACTUALIZACIÓN AUTOMÁTICA DE MISIONES SEMANALES
// ============================================

const db = require('../config/database');

// Función para obtener fechas de la semana actual (lunes a domingo)
function getCurrentWeekDates() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    
    // Calcular el lunes de la semana actual
    let monday = new Date(now);
    
    if (dayOfWeek === 0) {
        // Si es domingo, retroceder 6 días para obtener el lunes
        monday.setDate(now.getDate() - 6);
    } else {
        // Para cualquier otro día, retroceder hasta el lunes
        monday.setDate(now.getDate() - (dayOfWeek - 1));
    }
    
    monday.setHours(0, 0, 0, 0);
    
    // El domingo es 6 días después del lunes (lunes=día 0, domingo=día 6)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    // Formatear fechas en formato YYYY-MM-DD sin convertir a UTC
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    return {
        start: formatDate(monday),
        end: formatDate(sunday)
    };
}

// Misiones semanales template
const weeklyMissionsTemplate = [
    {
        name: 'Reciclador de Papel Semanal',
        description: 'Recicla 1 kilogramo de papel o cartón durante esta semana',
        material_type: 'paper',
        target_weight: 1.0,
        reward_points: 25
    },
    {
        name: 'Guerrero del Plástico',
        description: 'Recicla 800 gramos de plástico para ayudar al planeta',
        material_type: 'plastic',
        target_weight: 0.8,
        reward_points: 30
    },
    {
        name: 'Maestro del Reciclaje Verde',
        description: 'Recicla 1.5 kilogramos de materiales orgánicos esta semana',
        material_type: 'organic',
        target_weight: 1.5,
        reward_points: 20
    }
];

// Variable para cachear la última verificación
let lastCheckDate = null;
let isUpdating = false;

// Función para verificar y actualizar misiones si es necesario
async function checkAndUpdateMissions() {
    // Evitar múltiples actualizaciones simultáneas
    if (isUpdating) {
        console.log('⏳ Ya hay una actualización en proceso...');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Si ya verificamos hoy, no hacer nada
    if (lastCheckDate === today) {
        console.log('✅ Misiones ya verificadas hoy');
        return;
    }

    isUpdating = true;
    console.log('🔍 Iniciando verificación de misiones...');

    return new Promise((resolve, reject) => {
        try {
            // Verificar si hay misiones activas para la semana actual
            const weekDates = getCurrentWeekDates();
            console.log(`📅 Verificando semana: ${weekDates.start} a ${weekDates.end}`);
            
            const checkQuery = `
                SELECT COUNT(*) as count 
                FROM weekly_missions 
                WHERE is_active = 1 
                AND start_date = ? 
                AND end_date = ?
            `;

            db.get(checkQuery, [weekDates.start, weekDates.end], (err, result) => {
                if (err) {
                    console.error('❌ Error al verificar misiones:', err.message);
                    isUpdating = false;
                    reject(err);
                    return;
                }

                // Si ya existen misiones para esta semana, no hacer nada
                if (result && result.count >= 3) {
                    console.log(`✅ Misiones de la semana actual ya existen (${result.count} misiones)`);
                    lastCheckDate = today;
                    isUpdating = false;
                    resolve();
                    return;
                }

                // Si no existen, crear nuevas misiones
                console.log('🔄 Detectada nueva semana, actualizando misiones...');
                
                // 1. Desactivar misiones antiguas
                db.run(`UPDATE weekly_missions SET is_active = 0 WHERE date(end_date) < date('now')`, (err) => {
                    if (err) {
                        console.error('❌ Error al desactivar misiones antiguas:', err.message);
                        isUpdating = false;
                        reject(err);
                        return;
                    }
                    console.log('✅ Misiones antiguas desactivadas');

                    // 2. Limpiar progreso de misiones antiguas (NO acumulables)
                    db.run(`DELETE FROM user_mission_progress WHERE mission_id IN (SELECT id FROM weekly_missions WHERE is_active = 0)`, (err) => {
                        if (err) {
                            console.error('❌ Error al limpiar progreso antiguo:', err.message);
                        } else {
                            console.log('✅ Progreso de misiones antiguas eliminado');
                        }

                        // 3. Crear nuevas misiones para la semana actual
                        const insertQuery = `
                            INSERT INTO weekly_missions (name, description, material_type, target_weight, reward_points, start_date, end_date)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        `;

                        let createdCount = 0;
                        let hasError = false;
                        
                        weeklyMissionsTemplate.forEach((mission, index) => {
                            db.run(insertQuery, [
                                mission.name,
                                mission.description,
                                mission.material_type,
                                mission.target_weight,
                                mission.reward_points,
                                weekDates.start,
                                weekDates.end
                            ], function(err) {
                                if (err) {
                                    console.error(`❌ Error al crear misión "${mission.name}":`, err.message);
                                    hasError = true;
                                } else {
                                    createdCount++;
                                    console.log(`✅ Misión creada: "${mission.name}" (ID: ${this.lastID})`);
                                }

                                // Si es la última misión
                                if (index === weeklyMissionsTemplate.length - 1) {
                                    console.log(`🎉 Misiones semanales actualizadas: ${createdCount}/${weeklyMissionsTemplate.length}`);
                                    console.log(`📅 Semana: ${weekDates.start} a ${weekDates.end}`);
                                    lastCheckDate = today;
                                    isUpdating = false;
                                    
                                    if (hasError) {
                                        reject(new Error('Algunas misiones no se pudieron crear'));
                                    } else {
                                        resolve();
                                    }
                                }
                            });
                        });
                    });
                });
            });
        } catch (error) {
            console.error('❌ Error en actualización automática de misiones:', error.message);
            isUpdating = false;
            reject(error);
        }
    });
}

// Middleware para verificar en cada request relacionado con misiones
function autoUpdateMissions(req, res, next) {
    // Verificar y actualizar misiones de forma asíncrona
    checkAndUpdateMissions().catch(err => {
        console.error('❌ Error en auto-actualización:', err);
    });
    
    // Continuar con la petición sin esperar
    next();
}

module.exports = { autoUpdateMissions, checkAndUpdateMissions };
