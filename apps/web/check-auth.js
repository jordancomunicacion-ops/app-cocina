const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to DB...');
        const users = await prisma.user.findMany();
        console.log('Users found:', users.length);
        users.forEach(u => console.log('User:', u.email, u.role, u.password ? 'Has Password' : 'No Password'));

        const target = await prisma.user.findUnique({ where: { email: 'gerencia@sotodelprior.com' } });
        if (target) {
            console.log('Target user found:', target.email);
        } else {
            console.log('Target user NOT found');
        }
    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
