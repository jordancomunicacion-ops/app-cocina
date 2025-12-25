const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'gerencia@sotodelprior.com';
    const password = '123456';

    console.log(`Updating App Cocina password for user: ${email}...`);

    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert to ensure user exists
    const user = await prisma.user.upsert({
        where: { email },
        update: { passwordHash: hashedPassword },
        create: {
            email,
            name: 'Gerencia',
            passwordHash: hashedPassword,
            role: 'ADMIN' // Assuming ADMIN role exists in enum
        }
    });

    console.log('App Cocina Password updated successfully to 123456');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
