// ============================================
// SCRIPT DE INICIALIZACIÓN DE UBICACIONES
// Se ejecuta automáticamente al iniciar la app
// ============================================

const db = require('../config/database');

// Ubicaciones predefinidas de Bogotá, Colombia
// SOLO en las localidades de Chapinero y Santa Fe
const defaultLocations = [
    // ==========================================
    // LOCALIDAD DE CHAPINERO
    // ==========================================
    
    // Centros de Reciclaje VerdeGo - Chapinero
    {
        name: 'VerdeGo Centro Chapinero',
        address: 'Carrera 13 #53-45, Chapinero, Bogotá',
        latitude: 4.6533,
        longitude: -74.0621,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Chapinero Alto',
        address: 'Carrera 7 #62-30, Chapinero, Bogotá',
        latitude: 4.6589,
        longitude: -74.0602,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Zona T',
        address: 'Carrera 14 #83-20, Chapinero, Bogotá',
        latitude: 4.6678,
        longitude: -74.0554,
        type: 'verdego'
    },
    
    // Universidades en Chapinero
    {
        name: 'VerdeGo Universidad Piloto de Colombia',
        address: 'Carrera 9 #45A-44, Chapinero, Bogotá',
        latitude: 4.6389,
        longitude: -74.0658,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad Javeriana',
        address: 'Carrera 7 #40-62, Chapinero, Bogotá',
        latitude: 4.6283,
        longitude: -74.0638,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad Santo Tomás',
        address: 'Carrera 9 #51-11, Chapinero, Bogotá',
        latitude: 4.6412,
        longitude: -74.0625,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad EAN',
        address: 'Calle 79 #11-45, Chapinero, Bogotá',
        latitude: 4.6612,
        longitude: -74.0545,
        type: 'verdego'
    },
    
    // Tiendas Aliadas - Chapinero
    {
        name: 'Tienda Aliada Carulla Zona Rosa',
        address: 'Carrera 13 #82-71, Chapinero, Bogotá',
        latitude: 4.6671,
        longitude: -74.0547,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Éxito Av Chile',
        address: 'Carrera 13 #54-80, Chapinero, Bogotá',
        latitude: 4.6489,
        longitude: -74.0612,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Carulla Andino',
        address: 'Carrera 11 #82-71, Chapinero, Bogotá',
        latitude: 4.6623,
        longitude: -74.0523,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Jumbo Calle 53',
        address: 'Carrera 13 #52-55, Chapinero, Bogotá',
        latitude: 4.6520,
        longitude: -74.0618,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Carulla Calle 63',
        address: 'Carrera 7 #63-42, Chapinero, Bogotá',
        latitude: 4.6595,
        longitude: -74.0598,
        type: 'aliada'
    },
    
    // ==========================================
    // LOCALIDAD DE SANTA FE
    // ==========================================
    
    // Centros de Reciclaje VerdeGo - Santa Fe
    {
        name: 'VerdeGo Santa Fe Centro',
        address: 'Carrera 5 #15-20, Santa Fe, Bogotá',
        latitude: 4.6025,
        longitude: -74.0712,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Las Aguas',
        address: 'Carrera 3 #19-70, Santa Fe, Bogotá',
        latitude: 4.6058,
        longitude: -74.0689,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Egipto',
        address: 'Carrera 4 #24-35, Santa Fe, Bogotá',
        latitude: 4.6105,
        longitude: -74.0695,
        type: 'verdego'
    },
    
    // Universidades en Santa Fe
    {
        name: 'VerdeGo Universidad Central',
        address: 'Carrera 5 #21-38, Santa Fe, Bogotá',
        latitude: 4.6089,
        longitude: -74.0698,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad de los Andes',
        address: 'Carrera 1 #18A-12, Santa Fe, Bogotá',
        latitude: 4.6017,
        longitude: -74.0656,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad del Rosario',
        address: 'Calle 12C #6-25, Santa Fe, Bogotá',
        latitude: 4.6012,
        longitude: -74.0728,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad Externado',
        address: 'Calle 12 #1-17 Este, Santa Fe, Bogotá',
        latitude: 4.5978,
        longitude: -74.0689,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad La Salle',
        address: 'Carrera 2 #10-70, Santa Fe, Bogotá',
        latitude: 4.5963,
        longitude: -74.0703,
        type: 'verdego'
    },
    
    // Tiendas Aliadas - Santa Fe
    {
        name: 'Tienda Aliada Carulla La Candelaria',
        address: 'Carrera 7 #12-50, Santa Fe, Bogotá',
        latitude: 4.5989,
        longitude: -74.0732,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Éxito Centro',
        address: 'Carrera 10 #16-22, Santa Fe, Bogotá',
        latitude: 4.6032,
        longitude: -74.0725,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Surtimax Las Aguas',
        address: 'Carrera 3 #18-45, Santa Fe, Bogotá',
        latitude: 4.6048,
        longitude: -74.0692,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Jumbo Av Jiménez',
        address: 'Avenida Jiménez #4-30, Santa Fe, Bogotá',
        latitude: 4.5965,
        longitude: -74.0745,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada D1 Calle 26',
        address: 'Carrera 5 #26-85, Santa Fe, Bogotá',
        latitude: 4.6125,
        longitude: -74.0701,
        type: 'aliada'
    }
];

async function initializeLocations() {
    return new Promise((resolve, reject) => {
        console.log('🔍 Verificando ubicaciones iniciales...');

        // Verificar si ya hay ubicaciones
        db.get('SELECT COUNT(*) as count FROM locations', (err, row) => {
            if (err) {
                console.error('❌ Error al verificar ubicaciones:', err.message);
                reject(err);
                return;
            }

            if (row.count > 0) {
                console.log(`✅ Ya existen ${row.count} ubicaciones. No se insertarán duplicados.`);
                resolve();
                return;
            }

            // Si no hay ubicaciones, insertarlas
            console.log('📍 Tabla de ubicaciones vacía. Insertando ubicaciones predefinidas...');

            const sql = `
                INSERT INTO locations (name, address, latitude, longitude, type) 
                VALUES (?, ?, ?, ?, ?)
            `;

            let insertedCount = 0;
            let errors = 0;

            defaultLocations.forEach((location, index) => {
                db.run(sql, [
                    location.name,
                    location.address,
                    location.latitude,
                    location.longitude,
                    location.type
                ], function(err) {
                    if (err) {
                        console.error(`❌ Error al insertar ${location.name}:`, err.message);
                        errors++;
                    } else {
                        insertedCount++;
                        if (insertedCount % 5 === 0 || insertedCount === defaultLocations.length) {
                            console.log(`✅ Insertadas ${insertedCount}/${defaultLocations.length} ubicaciones`);
                        }
                    }

                    // Si es la última ubicación, mostrar resumen
                    if (index === defaultLocations.length - 1) {
                        setTimeout(() => {
                            console.log('\n📊 Resumen de inicialización:');
                            console.log(`   ✅ Ubicaciones insertadas: ${insertedCount}`);
                            console.log(`   ❌ Errores: ${errors}`);
                            console.log('🎉 ¡Inicialización de ubicaciones completada!\n');
                            resolve();
                        }, 500);
                    }
                });
            });
        });
    });
}

module.exports = { initializeLocations };
