import { z } from 'zod';

export const IngredientSchema = z.object({
    id: z.string(),
    name: z.string().min(1, { message: 'El nombre es obligatorio.' }),
    category: z.string().optional(),
    pricingUnit: z.enum(['KG', 'G', 'L', 'ML', 'UD']),
    pricePerUnit: z.coerce
        .number()
        .gt(0, { message: 'El precio debe ser mayor a 0.' }),
    yieldPercent: z.coerce
        .number()
        .min(0)
        .max(100, { message: 'El rendimiento debe estar entre 0 y 100.' }),
    allergens: z.string().optional(),
    supplierId: z.string().optional(),
});

export const CreateIngredientSchema = IngredientSchema.omit({ id: true });
export const UpdateIngredientSchema = IngredientSchema;

export type IngredientFormState = {
    errors?: {
        name?: string[];
        category?: string[];
        pricingUnit?: string[];
        pricePerUnit?: string[];
        yieldPercent?: string[];
        allergens?: string[];
    };
    message?: string | null;
};

// --- RECIPES ---

export const RecipeItemSchema = z.object({
    id: z.string().optional(),
    ingredientId: z.string().optional().nullable(),
    subRecipeId: z.string().optional().nullable(),
    type: z.enum(['INGREDIENT', 'SUB_RECIPE']),
    quantityGross: z.coerce.number().gt(0, { message: 'La cantidad debe ser mayor a 0.' }),
    unit: z.enum(['KG', 'G', 'L', 'ML', 'UD']),
});

export const RecipeSchema = z.object({
    id: z.string(),
    name: z.string().min(1, { message: 'El nombre es obligatorio.' }),
    yieldQuantity: z.coerce.number().gt(0, { message: 'El rendimiento debe ser mayor a 0.' }),
    yieldUnit: z.enum(['KG', 'G', 'L', 'ML', 'UD']).optional(),
    instructions: z.string().optional(),
    items: z.array(RecipeItemSchema).optional(),
});

export const CreateRecipeSchema = RecipeSchema.omit({ id: true });
export const UpdateRecipeSchema = RecipeSchema;

export type RecipeFormState = {
    errors?: {
        name?: string[];
        yieldQuantity?: string[];
        yieldUnit?: string[];
        instructions?: string[];
        items?: string[];
    };
    message?: string | null;
};

// --- EVENTS ---

export const EventMenuItemSchema = z.object({
    id: z.string().optional(),
    recipeId: z.string().min(1, { message: 'Debe seleccionar una receta.' }),
    servingsOverride: z.coerce.number().optional().nullable(),
});

export const EventSchema = z.object({
    id: z.string(),
    name: z.string().min(1, { message: 'El nombre del evento es obligatorio.' }),
    date: z.string().transform((str) => new Date(str)),
    pax: z.coerce.number().gt(0, { message: 'El número de personas debe ser mayor a 0.' }),
    safetyMargin: z.coerce.number().min(1, { message: 'El margen debe ser al menos 1.0 (100%).' }),
    status: z.enum(['DRAFT', 'CONFIRMED', 'COMPLETED']).optional(),
    menuItems: z.array(EventMenuItemSchema).optional(),
});

export const CreateEventSchema = EventSchema.omit({ id: true });
export const UpdateEventSchema = EventSchema;

export type EventFormState = {
    errors?: {
        name?: string[];
        date?: string[];
        pax?: string[];
        safetyMargin?: string[];
        status?: string[];
        menuItems?: string[];
    };
    message?: string | null;
};

// --- EMPLOYEES (USERS) ---

export const UserSchema = z.object({
    id: z.string(),
    name: z.string().min(1, { message: 'El nombre es obligatorio.' }),
    email: z.string().email({ message: 'Email inválido.' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }).optional(),
    role: z.enum(['ADMIN', 'CHEF', 'EMPLOYEE']),
});

export const CreateUserSchema = UserSchema.omit({ id: true }).extend({
    password: z.string().min(6, { message: 'La contraseña es obligatoria.' }),
});
export const UpdateUserSchema = UserSchema;

export type UserFormState = {
    errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        role?: string[];
    };
    message?: string | null;
};

// --- TASKS ---

export const TaskSchema = z.object({
    id: z.string(),
    title: z.string().min(1, { message: 'El título es obligatorio.' }),
    description: z.string().optional(),
    assignedToUserId: z.string().optional().nullable(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'ISSUE']),
    recipeId: z.string().optional().nullable(),
    targetQuantity: z.coerce.number().optional().nullable(),
    plannedStart: z.string().optional().nullable(),
    plannedEnd: z.string().optional().nullable(),
});

export const CreateTaskSchema = TaskSchema.omit({ id: true, status: true });
export const UpdateTaskSchema = TaskSchema;

export type TaskFormState = {
    errors?: {
        title?: string[];
        assignedToUserId?: string[];
        recipeId?: string[];
        targetQuantity?: string[];
        plannedStart?: string[];
        plannedEnd?: string[];
    };
    message?: string | null;
};
