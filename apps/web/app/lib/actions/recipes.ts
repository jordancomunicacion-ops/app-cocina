'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CreateRecipeSchema, UpdateRecipeSchema } from '@/app/lib/definitions';
import type { RecipeFormState } from '@/app/lib/definitions';

// --- RECIPES ---

export async function createRecipe(prevState: RecipeFormState, formData: FormData) {
    // Complex form data handling might be needed here if items are passed as JSON string or multiple fields
    // For simplicity MVP: We'll assume Items are managed via client-side state and passed maybe as a hidden JSON input 
    // or we parse specific naming conventions (items[0].id, etc).
    // Let's try to parse a hidden JSON field for 'items' to keep it clean.

    const itemsJson = formData.get('items') as string;
    const itemsRaw = itemsJson ? JSON.parse(itemsJson) : [];

    const validatedFields = CreateRecipeSchema.safeParse({
        name: formData.get('name'),
        yieldQuantity: formData.get('yieldQuantity'),
        yieldUnit: formData.get('yieldUnit'),
        instructions: formData.get('instructions'),
        items: itemsRaw,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan campos obligatorios o datos inválidos.',
        };
    }

    const { name, yieldQuantity, yieldUnit, instructions, items } = validatedFields.data;

    try {
        await prisma.recipe.create({
            data: {
                name,
                yieldQuantity,
                yieldUnit: yieldUnit as any,
                instructions,
                items: {
                    create: items?.map(item => ({
                        type: item.type,
                        ingredientId: item.ingredientId || undefined,
                        subRecipeId: item.subRecipeId || undefined,
                        quantityGross: item.quantityGross,
                        unit: item.unit
                    }))
                }
            },
        });
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Error de base de datos: No se pudo crear la receta.',
        };
    }

    revalidatePath('/dashboard/recipes');
    redirect('/dashboard/recipes');
}

export async function updateRecipe(
    id: string,
    prevState: RecipeFormState,
    formData: FormData,
) {
    const itemsJson = formData.get('items') as string;
    const itemsRaw = itemsJson ? JSON.parse(itemsJson) : [];

    const validatedFields = UpdateRecipeSchema.safeParse({
        id: id,
        name: formData.get('name'),
        yieldQuantity: formData.get('yieldQuantity'),
        yieldUnit: formData.get('yieldUnit'),
        instructions: formData.get('instructions'),
        items: itemsRaw,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan campos obligatorios.',
        };
    }

    const { name, yieldQuantity, yieldUnit, instructions, items } = validatedFields.data;

    try {
        // Transactional update: Delete old items and create new ones is simplest for MVP
        // Better strategy: upsert/delete difference.
        await prisma.$transaction(async (tx) => {
            // Update basic info
            await tx.recipe.update({
                where: { id },
                data: {
                    name,
                    yieldQuantity,
                    yieldUnit: yieldUnit as any,
                    instructions,
                }
            });

            // Delete existing items
            await tx.recipeItem.deleteMany({
                where: { recipeId: id }
            });

            // Create new items
            if (items && items.length > 0) {
                await tx.recipeItem.createMany({
                    data: items.map(item => ({
                        recipeId: id,
                        type: item.type,
                        ingredientId: item.ingredientId || null,
                        subRecipeId: item.subRecipeId || null,
                        quantityGross: item.quantityGross,
                        unit: item.unit
                    }))
                });
            }
        });

    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Error de base de datos: No se pudo actualizar la receta.',
        };
    }

    revalidatePath('/dashboard/recipes');
    redirect('/dashboard/recipes');
}

export async function deleteRecipe(id: string) {
    try {
        await prisma.recipe.delete({
            where: { id },
        });
        revalidatePath('/dashboard/recipes');
        return { message: 'Receta eliminada.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Error de base de datos: No se pudo eliminar la receta.' };
    }
}
