import bcrypt from 'bcrypt';

/**
 * Script to create the first Super Admin user
 * Run with: tsx src/scripts/create-super-admin.ts
 */

async function createSuperAdmin() {
    const { MikroORM } = await import('@mikro-orm/core');
    const config = await import('../mikro-orm.config');

    const orm = await MikroORM.init(config.default);
    const em = orm.em.fork();

    try {
        const { User, GlobalRole } = await import('../features/auth/entities/User');

        // Check if Super Admin already exists
        const existing = await em.findOne(User, { globalRole: GlobalRole.SUPER_ADMIN });
        if (existing) {
            console.log('✅ Super Admin ya existe:', existing.email);
            await orm.close();
            return;
        }

        // Prompt for email and password (or use defaults for demo)
        const email = process.env.SUPER_ADMIN_EMAIL || 'admin@rentmanager.com';
        const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';

        const passwordHash = await bcrypt.hash(password, 10);

        const superAdmin = new User({
            email,
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            globalRole: GlobalRole.SUPER_ADMIN
        });

        await em.persistAndFlush(superAdmin);

        console.log('✅ Super Admin creado exitosamente!');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

    } catch (error) {
        console.error('❌ Error creando Super Admin:', error);
    } finally {
        await orm.close();
    }
}

createSuperAdmin();
