import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    // Use process.cwd() to resolve path relevant to where command is run
    const filePath = path.join(process.cwd(), 'inventario_simplificado.csv');
    console.log(`Reading CSV from: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error('File not found!');
        process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Split lines and remove empty lines
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');

    // Skip header
    const dataLines = lines.slice(1);

    console.log(`Found ${dataLines.length} lines to process.`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const line of dataLines) {
        const row = parseCSVLine(line);

        // Expect at least 5 columns
        // Header: Nombre,Categoria,Unidad (KG/L/UD),Precio,Merma (%),Alergenos (Separados por coma)
        if (row.length < 5) {
            console.warn('Skipping invalid line (too few columns):', line);
            skippedCount++;
            continue;
        }

        // Mapping
        // 0: Name
        // 1: Category
        // 2: Unit
        // 3: Price
        // 4: Waste (Merma)
        // 5: Allergens (Optional)

        const name = row[0]?.trim();
        const category = row[1]?.trim();
        const unitStr = row[2]?.trim();
        const priceStr = row[3]?.trim();
        const wasteStr = row[4]?.trim();
        const allergens = row[5]?.trim() || '';

        if (!name) {
            skippedCount++;
            continue;
        }

        // Convert Numeric Types
        // Handle potential comma decimals
        const priceVal = parseFloat(priceStr.replace(',', '.'));
        const wasteVal = parseFloat(wasteStr.replace(',', '.'));

        const pricePerUnit = isNaN(priceVal) ? 0 : priceVal;
        const wastePercent = isNaN(wasteVal) ? 0 : wasteVal;

        // Yield = 100 - Waste
        const yieldPercent = 100 - wastePercent;

        // Normalize Unit
        // Schema default is "KG"
        let pricingUnit = 'KG';
        const u = unitStr.toUpperCase();
        if (u === 'UD') pricingUnit = 'UD';
        else if (u === 'L') pricingUnit = 'L';
        else if (u === 'G') pricingUnit = 'G';
        else if (u === 'ML') pricingUnit = 'ML';
        // If it's something else, keep default 'KG' or use what is there if supported?
        // Schema comment says: // KG, G, L, ML, UD
        // If unknown, let's stick to KG or UD? 
        // CSV validation is key. Let's assume the CSV is mostly correct on units (KG/UD seen in file).

        // Check if ingredient exists by name
        const existing = await prisma.ingredient.findFirst({
            where: { name: name }
        });

        if (existing) {
            // Update
            await prisma.ingredient.update({
                where: { id: existing.id },
                data: {
                    category,
                    pricingUnit,
                    pricePerUnit,
                    yieldPercent,
                    allergens
                }
            });
            // console.log(`Updated: ${name}`);
            updatedCount++;
        } else {
            // Create
            await prisma.ingredient.create({
                data: {
                    name,
                    category,
                    pricingUnit,
                    pricePerUnit,
                    yieldPercent,
                    allergens
                }
            });
            // console.log(`Created: ${name}`);
            createdCount++;
        }
    }

    console.log('------------------------------------------------');
    console.log(`Import Finished.`);
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log('------------------------------------------------');
}

function parseCSVLine(text: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(cur);
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur);
    return result;
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
