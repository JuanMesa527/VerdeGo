// ============================================
// SCRIPT DE INICIALIZACIÓN DE UBICACIONES
// Se ejecuta automáticamente al iniciar la app
// ============================================

const db = require('../config/database');

// Ubicaciones predefinidas de Bogotá, Colombia
const defaultLocations = [
    // Ubicaciones VerdeGo - Centros de reciclaje
    {
        name: 'VerdeGo Centro Chapinero',
        address: 'Carrera 13 #53-45, Chapinero, Bogotá',
        latitude: 4.6533,
        longitude: -74.0621,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Usaquén',
        address: 'Calle 119 #6-20, Usaquén, Bogotá',
        latitude: 4.7001,
        longitude: -74.0309,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Kennedy',
        address: 'Avenida Américas #68-55, Kennedy, Bogotá',
        latitude: 4.6363,
        longitude: -74.1456,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Fontibón',
        address: 'Calle 17 #99-32, Fontibón, Bogotá',
        latitude: 4.6831,
        longitude: -74.1428,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Engativá',
        address: 'Avenida Boyacá #72-81, Engativá, Bogotá',
        latitude: 4.7145,
        longitude: -74.1121,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Teusaquillo',
        address: 'Carrera 24 #39-42, Teusaquillo, Bogotá',
        latitude: 4.6365,
        longitude: -74.0799,
        type: 'verdego'
    },
    {
        name: 'VerdeGo San Cristóbal',
        address: 'Carrera 5 Este #4-20 Sur, San Cristóbal, Bogotá',
        latitude: 4.5691,
        longitude: -74.0876,
        type: 'verdego'
    },
    
    // Ubicaciones VerdeGo - Universidades
    {
        name: 'VerdeGo Universidad Piloto de Colombia',
        address: 'Carrera 9 #45A-44, Chapinero, Bogotá',
        latitude: 4.6389,
        longitude: -74.0658,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad Nacional de Colombia',
        address: 'Carrera 30 #45-03, Ciudad Universitaria, Bogotá',
        latitude: 4.6382,
        longitude: -74.0836,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad de los Andes',
        address: 'Carrera 1 #18A-12, La Candelaria, Bogotá',
        latitude: 4.6017,
        longitude: -74.0656,
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
        name: 'VerdeGo Universidad del Rosario',
        address: 'Calle 12C #6-25, La Candelaria, Bogotá',
        latitude: 4.6012,
        longitude: -74.0728,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad Externado de Colombia',
        address: 'Calle 12 #1-17 Este, La Candelaria, Bogotá',
        latitude: 4.5978,
        longitude: -74.0689,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad Distrital',
        address: 'Carrera 7 #40B-53, Teusaquillo, Bogotá',
        latitude: 4.6281,
        longitude: -74.0654,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad La Salle',
        address: 'Carrera 2 #10-70, La Candelaria, Bogotá',
        latitude: 4.5963,
        longitude: -74.0703,
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
        name: 'VerdeGo Universidad Central',
        address: 'Carrera 5 #21-38, Santa Fe, Bogotá',
        latitude: 4.6089,
        longitude: -74.0698,
        type: 'verdego'
    },
    {
        name: 'VerdeGo Universidad EAN',
        address: 'Calle 79 #11-45, Chapinero, Bogotá',
        latitude: 4.6612,
        longitude: -74.0545,
        type: 'verdego'
    },
    
    // Tiendas Aliadas - Supermercados
    {
        name: 'Tienda Aliada Éxito Suba',
        address: 'Avenida Suba #95-85, Suba, Bogotá',
        latitude: 4.7556,
        longitude: -74.0854,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Carulla Zona Rosa',
        address: 'Carrera 13 #82-71, Zona Rosa, Bogotá',
        latitude: 4.6671,
        longitude: -74.0547,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Jumbo Calle 80',
        address: 'Avenida Calle 80 #69C-55, Bogotá',
        latitude: 4.7201,
        longitude: -74.0984,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Olímpica Bosa',
        address: 'Transversal 78K #38A Sur-35, Bosa, Bogotá',
        latitude: 4.6134,
        longitude: -74.1894,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada PriceSmart Soacha',
        address: 'Autopista Sur #46-85, Soacha, Bogotá',
        latitude: 4.5824,
        longitude: -74.2116,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Éxito Américas',
        address: 'Avenida Américas #39C-95, Puente Aranda, Bogotá',
        latitude: 4.6312,
        longitude: -74.1234,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Carulla Unicentro',
        address: 'Avenida 15 #123-30, Usaquén, Bogotá',
        latitude: 4.7012,
        longitude: -74.0398,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Jumbo Calle 170',
        address: 'Autopista Norte #169-85, Suba, Bogotá',
        latitude: 4.7523,
        longitude: -74.0456,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Éxito Titan Plaza',
        address: 'Autopista Sur #133-00, Kennedy, Bogotá',
        latitude: 4.6045,
        longitude: -74.1567,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Carulla Parque 93',
        address: 'Carrera 11A #93A-10, Chicó, Bogotá',
        latitude: 4.6756,
        longitude: -74.0398,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Jumbo Hayuelos',
        address: 'Avenida Agoberto Mejía #36-61, Fontibón, Bogotá',
        latitude: 4.6721,
        longitude: -74.1389,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Makro Calle 13',
        address: 'Calle 13 #68-98, Fontibón, Bogotá',
        latitude: 4.6534,
        longitude: -74.1178,
        type: 'aliada'
    },
    {
        name: 'Tienda Aliada Alkosto Calle 80',
        address: 'Calle 80 #108-70, Engativá, Bogotá',
        latitude: 4.7234,
        longitude: -74.1245,
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
        address: 'Carrera 11 #82-71, Centro Andino, Bogotá',
        latitude: 4.6623,
        longitude: -74.0523,
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
