const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting simplified seed...');
        const email = 'gerencia@sotodelprior.com';
        // Pre-calculated hash for '123456'
        const hashedPassword = '$2b$10$E.CUictZ/IlUL5c7vqZfMuHDgrXlSXj9yINmj7m3WAj377eXrVJm6';

        console.log(`Creating user: ${email}`);

        await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN'
            },
            create: {
                email,
                name: 'Gerencia',
                password: hashedPassword,
                role: 'ADMIN'
            }
        });
        console.log('✅ User created successfully');
    } catch (e) {
        console.error('❌ Error creating user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
