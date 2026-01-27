const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasourceUrl: 'postgresql://cocina_user:cocina_pass@localhost:5432/cocina'
});

async function testAuth() {
    try {
        console.log('=== Testing Authentication ===');

        // Test 1: Can we connect to DB?
        console.log('\n1. Testing DB connection...');
        const userCount = await prisma.user.count();
        console.log(`   ✓ Connected! Found ${userCount} users`);

        // Test 2: Get user details  
        console.log('\n2. Fetching user...');
        const user = await prisma.user.findUnique({
            where: { email: 'gerencia@sotodelprior.com' }
        });

        if (!user) {
            console.log('   ✗ User not found!');
            return;
        }

        console.log(`   ✓ User found: ${user.email}`);
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Password hash: ${user.password.substring(0, 20)}...`);

        // Test 3: Test password
        console.log('\n3. Testing password comparison...');
        const testPasswords = ['123456', 'password', 'admin', 'gerencia'];

        for (const pwd of testPasswords) {
            const match = await bcrypt.compare(pwd, user.password);
            console.log(`   Password "${pwd}": ${match ? '✓ MATCH' : '✗ no match'}`);
            if (match) {
                console.log(`\n   🎉 FOUND WORKING PASSWORD: "${pwd}"`);
                break;
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testAuth();
