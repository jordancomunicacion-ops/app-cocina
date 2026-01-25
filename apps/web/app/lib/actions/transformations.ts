'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Schema Validation
const OutputSchema = z.object({
    ingredientId: z.string().optional(), // Existing IG
    newIngredientName: z.string().optional(), // Or create new
    weight: z.coerce.number().min(0), // Weight obtained from test
    costAllocation: z.coerce.number().min(0).default(1), // 1 = Proportional, >1 = Premium, <1 = Byproduct
}).refine(data => data.ingredientId || (data.newIngredientName && data.newIngredientName.trim() !== ''), {
    message: "Debe seleccionar un ingrediente o escribir un nombre nuevo."
});

const TransformationSchema = z.object({
    sourceProductId: z.string(),
    name: z.string().min(1, "El nombre es obligatorio"),
    testQuantity: z.coerce.number().gt(0, "La cantidad del test debe ser mayor a 0"), // Changed min(0.01) to gt(0) for consistency
    outputs: z.array(OutputSchema).min(1, "Debe haber al menos una salida (aunque sea merma)"),
});

const UpdateTransformationSchema = TransformationSchema.extend({
    id: z.string(),
});

export type TransformationFormState = {
    message?: string | null;
    errors?: Record<string, string[]>;
};

export async function createTransformation(prevState: TransformationFormState, formData: FormData) {
    const rawOutputs = formData.get('outputs') as string;
    const outputsData = rawOutputs ? JSON.parse(rawOutputs) : [];

    const validatedFields = TransformationSchema.safeParse({
        sourceProductId: formData.get('sourceProductId'),
        name: formData.get('name'),
        testQuantity: Number(formData.get('testQuantity')),
        outputs: outputsData
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>,
            message: 'Error de validación. Revise los datos.',
        };
    }

    const { sourceProductId, name, testQuantity, outputs } = validatedFields.data;

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create the Transformation Header
            const transformation = await tx.transformation.create({
                data: {
                    name,
                    sourceProductId,
                }
            });

            // 2. Process outputs
            for (const output of outputs) {
                let ingredientId = output.ingredientId;

                // Handle Name-based Resolution (UI sends names now)
                if (!ingredientId && output.newIngredientName) {
                    const normalizedName = output.newIngredientName.trim();

                    // 1. Try to find existing
                    const existingIng = await tx.ingredient.findFirst({
                        where: { name: { equals: normalizedName, mode: 'insensitive' } } // Case insensitive match
                    });

                    if (existingIng) {
                        ingredientId = existingIng.id;
                    } else {
                        // 2. Create new if not found
                        const newIng = await tx.ingredient.create({
                            data: {
                                name: normalizedName, // Store as provided
                                pricePerUnit: 0,
                            }
                        });
                        ingredientId = newIng.id;
                    }
                }

                if (ingredientId) {
                    // Calculate percentage yield
                    // Yield % = OutputWeight / InputWeight * 100
                    const percentage = (output.weight / testQuantity) * 100;

                    await tx.transformationOutput.create({
                        data: {
                            transformationId: transformation.id,
                            ingredientId: ingredientId,
                            percentage: percentage,
                            costAllocation: output.costAllocation
                        }
                    });
                }
            }
        });

    } catch (error) {
        console.error(error);
        return { message: 'Error al guardar la transformación.' };
    }

    revalidatePath(`/dashboard/products/${sourceProductId}`);
    redirect(`/dashboard/products/${sourceProductId}`);
}

export async function updateTransformation(id: string, prevState: TransformationFormState, formData: FormData) {
    const rawOutputs = formData.get('outputs') as string;
    const outputsData = rawOutputs ? JSON.parse(rawOutputs) : [];

    // Parse the form data using the Schema
    const validatedFields = UpdateTransformationSchema.safeParse({
        id: id,
        sourceProductId: formData.get('sourceProductId'),
        name: formData.get('name'),
        testQuantity: Number(formData.get('testQuantity')),
        outputs: outputsData
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>,
            message: 'Error de validación. Revise los datos.',
        };
    }

    const { sourceProductId, name, testQuantity, outputs } = validatedFields.data;

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update Transformation Header
            await tx.transformation.update({
                where: { id },
                data: { name }
            });

            // 2. Clear old outputs (easier than diffing for now)
            await tx.transformationOutput.deleteMany({
                where: { transformationId: id }
            });

            // 3. Re-create outputs
            for (const output of outputs) {
                let ingredientId = output.ingredientId;

                if (!ingredientId && output.newIngredientName) {
                    const normalizedName = output.newIngredientName.trim();
                    const existingIng = await tx.ingredient.findFirst({
                        where: { name: { equals: normalizedName, mode: 'insensitive' } }
                    });

                    if (existingIng) {
                        ingredientId = existingIng.id;
                    } else {
                        const newIng = await tx.ingredient.create({
                            data: { name: normalizedName, pricePerUnit: 0 }
                        });
                        ingredientId = newIng.id;
                    }
                }

                if (ingredientId) {
                    const percentage = (output.weight / testQuantity) * 100;

                    await tx.transformationOutput.create({
                        data: {
                            transformationId: id,
                            ingredientId: ingredientId,
                            percentage: percentage,
                            costAllocation: output.costAllocation
                        }
                    });
                }
            }
        });

    } catch (error) {
        console.error(error);
        return { message: 'Error al actualizar la transformación.' };
    }

    revalidatePath(`/dashboard/products/${sourceProductId}`);
    redirect(`/dashboard/products/${sourceProductId}`);
}

export async function deleteTransformation(id: string) {
    try {
        await prisma.transformation.delete({
            where: { id },
        });
    } catch (error) {
        return { message: 'Error de base de datos: No se pudo borrar la transformación.' };
    }
    revalidatePath('/dashboard/products');
    return { message: 'Transformación eliminada correctamente' };
}
