'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ProductSchema = z.object({
    id: z.string(),
    name: z.string().min(1, { message: 'El nombre es obligatorio.' }),
    supplier: z.string().optional(),
    price: z.coerce.number().min(0, { message: 'El precio debe ser mayor o igual a 0.' }),
    unit: z.string().min(1, { message: 'La unidad es obligatoria.' }),
    sapiensWorld: z.string().optional(),
});

const CreateProduct = ProductSchema.omit({ id: true });
const UpdateProduct = ProductSchema;

export type ProductFormState = {
    errors?: {
        name?: string[];
        supplier?: string[];
        price?: string[];
        unit?: string[];
    };
    message?: string | null;
};

export async function createProduct(prevState: ProductFormState, formData: FormData) {
    const validatedFields = CreateProduct.safeParse({
        name: formData.get('name'),
        supplier: formData.get('supplier'),
        price: formData.get('price'),
        unit: formData.get('unit'),
        sapiensWorld: formData.get('sapiensWorld'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan campos obligatorios. Error al crear producto.',
        };
    }

    const { name, supplier, price, unit, sapiensWorld } = validatedFields.data;

    try {
        await prisma.supplierProduct.create({
            data: {
                name,
                supplier,
                price,
                unit,
                sapiensWorld,
            },
        });
    } catch (error) {
        return {
            message: 'Error de base de datos: No se pudo crear el producto.',
        };
    }

    revalidatePath('/dashboard/products');
    redirect('/dashboard/products');
}

export async function updateProduct(id: string, prevState: ProductFormState, formData: FormData) {
    const validatedFields = UpdateProduct.safeParse({
        id: id,
        name: formData.get('name'),
        supplier: formData.get('supplier'),
        price: formData.get('price'),
        unit: formData.get('unit'),
        sapiensWorld: formData.get('sapiensWorld'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Faltan campos obligatorios. Error al actualizar producto.',
        };
    }

    const { name, supplier, price, unit, sapiensWorld } = validatedFields.data;

    try {
        await prisma.supplierProduct.update({
            where: { id },
            data: {
                name,
                supplier,
                price,
                unit,
                sapiensWorld,
            },
        });
    } catch (error) {
        return {
            message: 'Error de base de datos: No se pudo actualizar el producto.',
        };
    }

    revalidatePath('/dashboard/products');
    redirect('/dashboard/products');
}

export async function deleteProduct(id: string) {
    try {
        await prisma.supplierProduct.delete({
            where: { id },
        });
        revalidatePath('/dashboard/products');
    } catch (error) {
        return { message: 'Error de base de datos: No se pudo borrar el producto.' };
    }
}
