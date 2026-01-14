const { PrismaClient } = require('@prisma/client');

console.log('Script started.');
const prisma = new PrismaClient();

async function main() {
    const email = 'gerencia@sotodelprior.com';
    const hash123456 = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

    console.log('Restoring password for:', email);

    try {
        // Use Fully Qualified Name
        const query = `UPDATE "public"."User" SET "passwordHash" = '${hash123456}', "name" = 'Gerencia' WHERE "email" = '${email}'`;
        console.log('Executing query:', query);

        const result = await prisma.$executeRawUnsafe(query);

        console.log('Update result:', result);
        console.log('Successfully updated user password to 123456');

    } catch (err) {
        console.error('ERROR during Prisma operation:');
        console.error(err);
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
