const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Intento de conexión a DB...');
        const userCount = await prisma.user.count();
        console.log('Conexión EXITOSA. Usuarios encontrados:', userCount);

        const user = await prisma.user.findUnique({ where: { email: 'gerencia@sotodelprior.com' } });
        if (user) console.log('Usuario admin encontrado.');
        else console.log('Usuario admin NO encontrado.');

    } catch (e) {
        console.error('ERROR DE CONEXIÓN:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
