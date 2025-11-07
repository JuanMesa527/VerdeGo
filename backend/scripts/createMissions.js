// ============================================
// SCRIPT PARA CREAR MISIONES SEMANALES DE EJEMPLO
// ============================================

const db = require('../config/database');

// Función para obtener fechas de la semana actual (lunes a domingo)
function getWeekDates() {
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
    
    // Verificar que realmente es domingo (día 0)
    if (sunday.getDay() !== 0) {
        console.error('⚠️ ERROR: La fecha calculada no es domingo:', sunday);
    }
    
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

// Misiones de ejemplo - 3 misiones semanales balanceadas
const sampleMissions = [
    {
        name: 'Reciclador de Papel Semanal',
        description: 'Recicla 1 kilogramo de papel o cartón durante esta semana',
        material_type: 'paper',
        target_weight: 1.0, // 1 kg
        reward_points: 25 // Bono adicional de 25 pts (1kg papel = 10pts base + 25pts misión = 35pts total)
    },
    {
        name: 'Guerrero del Plástico',
        description: 'Recicla 800 gramos de plástico para ayudar al planeta',
        material_type: 'plastic',
        target_weight: 0.8, // 800 gramos
        reward_points: 30 // Bono adicional de 30 pts (0.8kg plástico = 12pts base + 30pts misión = 42pts total)
    },
    {
        name: 'Maestro del Reciclaje Verde',
        description: 'Recicla 1.5 kilogramos de materiales orgánicos esta semana',
        material_type: 'organic',
        target_weight: 1.5, // 1.5 kg
        reward_points: 20 // Bono adicional de 20 pts (1.5kg orgánicos = 12pts base + 20pts misión = 32pts total)
    }
];

// Crear misiones
function createSampleMissions() {
    const dates = getWeekDates();
    console.log('📅 Creando misiones para la semana:');
    console.log(`   Inicio: ${dates.start}`);
    console.log(`   Fin: ${dates.end}`);
    console.log('');
    
    // Primero, desactivar misiones antiguas
    db.run(`UPDATE weekly_missions SET is_active = 0 WHERE date(end_date) < date('now')`, (err) => {
        if (err) {
            console.error('❌ Error al desactivar misiones antiguas:', err.message);
        } else {
            console.log('✅ Misiones antiguas desactivadas');
            
            // Limpiar progreso de misiones antiguas (NO acumulables)
            db.run(`DELETE FROM user_mission_progress WHERE mission_id IN (SELECT id FROM weekly_missions WHERE is_active = 0)`, (err) => {
                if (err) {
                    console.error('❌ Error al limpiar progreso antiguo:', err.message);
                } else {
                    console.log('✅ Progreso de misiones antiguas eliminado (NO acumulables)');
                }
            });
        }
    });
    
    // Insertar nuevas misiones
    const query = `
        INSERT INTO weekly_missions (name, description, material_type, target_weight, reward_points, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    let created = 0;
    sampleMissions.forEach((mission, index) => {
        db.run(query, [
            mission.name,
            mission.description,
            mission.material_type,
            mission.target_weight,
            mission.reward_points,
            dates.start,
            dates.end
        ], function(err) {
            if (err) {
                console.error(`❌ Error al crear misión "${mission.name}":`, err.message);
            } else {
                created++;
                console.log(`✅ Misión creada: "${mission.name}" (ID: ${this.lastID})`);
            }
            
            // Si es la última misión, cerrar la base de datos
            if (index === sampleMissions.length - 1) {
                setTimeout(() => {
                    console.log('');
                    console.log(`🎉 Proceso completado: ${created}/${sampleMissions.length} misiones creadas`);
                    db.close();
                    process.exit(0);
                }, 500);
            }
        });
    });
}

// Ejecutar
console.log('🚀 Iniciando creación de misiones semanales...');
console.log('');
createSampleMissions();
