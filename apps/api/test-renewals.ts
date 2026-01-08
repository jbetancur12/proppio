import { MikroORM } from '@mikro-orm/core';
import config from './src/mikro-orm.config';
import { processLeaseRenewals } from './src/jobs/lease-renewal.job';

async function testLeaseRenewals() {
    console.log('🔄 Iniciando prueba de renovación automática...\n');

    let orm: MikroORM | undefined;

    try {
        // Inicializar ORM
        console.log('📦 Conectando a la base de datos...');
        orm = await MikroORM.init(config);
        console.log('✅ Conectado exitosamente\n');

        // Crear EntityManager
        const em = orm.em.fork();

        // Ejecutar proceso de renovación
        console.log('🔄 Ejecutando proceso de renovación...');
        const result = await processLeaseRenewals(em);

        // Mostrar resultados
        console.log('\n✅ Proceso completado!\n');
        console.log('📊 Resultados:');
        console.log(`   - Contratos renovados: ${result.renewed}`);

        if (result.errors.length > 0) {
            console.log(`   - Errores: ${result.errors.length}`);
            result.errors.forEach((error, index) => {
                console.log(`     ${index + 1}. ${error}`);
            });
        } else {
            console.log('   - Sin errores ✓');
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    } finally {
        if (orm) {
            await orm.close();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

// Ejecutar
testLeaseRenewals()
    .then(() => {
        console.log('\n✨ Script completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error fatal:', error);
        process.exit(1);
    });
