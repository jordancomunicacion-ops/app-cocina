'use client';

import { updateRecipe, RecipeFormState } from '@/app/lib/actions/recipes';
import Link from 'next/link';
import {
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { useActionState, useState } from 'react';
import { Ingredient, Recipe, RecipeItem } from '@prisma/client';

type RecipeItemInput = {
    key: string;
    id?: string;
    type: 'INGREDIENT' | 'SUB_RECIPE';
    ingredientId: string;
    subRecipeId: string;
    quantityGross: number;
    unit: string;
};

export default function EditForm({
    recipe,
    ingredients
}: {
    recipe: Recipe & { items: RecipeItem[] },
    ingredients: Ingredient[]
}) {
    const initialState: RecipeFormState = { message: null, errors: {} };
    const updateRecipeWithId = updateRecipe.bind(null, recipe.id);
    const [state, formAction] = useActionState(updateRecipeWithId, initialState);

    // Transform DB items to state items
    const [items, setItems] = useState<RecipeItemInput[]>(
        recipe.items.map((item: RecipeItem) => ({
            key: item.id, // use DB id as key for existing
            id: item.id,
            type: item.type as 'INGREDIENT' | 'SUB_RECIPE', // Cast from string
            ingredientId: item.ingredientId || '',
            subRecipeId: item.subRecipeId || '',
            quantityGross: item.quantityGross,
            unit: item.unit
        }))
    );

    const addItem = () => {
        setItems([
            ...items,
            {
                key: crypto.randomUUID(),
                type: 'INGREDIENT',
                ingredientId: '',
                subRecipeId: '',
                quantityGross: 0,
                unit: 'KG',
            },
        ]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateItem = (index: number, field: keyof RecipeItemInput, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    // Calculate cost on the fly
    const totalCost = items.reduce((sum, item) => {
        if (item.type === 'INGREDIENT' && item.ingredientId) {
            const ingredient = ingredients.find(i => i.id === item.ingredientId);
            if (ingredient) {
                const quantityInPricingUnit = convertTo(item.quantityGross, item.unit as UnitType, ingredient.pricingUnit as UnitType);
                if (quantityInPricingUnit !== null) {
                    return sum + (quantityInPricingUnit * ingredient.pricePerUnit);
                }
            }
        }
        return sum;
    }, 0);

    const costPerUnit = yieldVal > 0 ? totalCost / yieldVal : 0;

    return (
        <form action={formAction}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">

                {/* Cost Summary Card */}
                <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-blue-50 p-4 border border-blue-100">
                    <div>
                        <p className="text-sm text-blue-600 font-semibold">Coste Total Receta</p>
                        <p className="text-2xl font-bold text-blue-800">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalCost)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-green-600 font-semibold">Coste por Ración/Unidad</p>
                        <p className="text-2xl font-bold text-green-800">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(costPerUnit)}</p>
                    </div>
                </div>

                <input type="hidden" name="items" value={JSON.stringify(items)} />

                {/* Recipe Name */}
                <div className="mb-4">
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">
                        Nombre de la Receta
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <input
                            id="name"
                            name="name"
                            type="text"
                            defaultValue={recipe.name}
                            placeholder="Ej. Salsa Boloñesa"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                            aria-describedby="name-error"
                        />
                        <div id="name-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.name &&
                                state.errors.name.map((error: string) => (
                                    <p key={error} className="mt-2 text-sm text-red-500">
                                        {error}
                                    </p>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Yield Info */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="yieldQuantity" className="mb-2 block text-sm font-medium">
                            Rendimiento (Cantidad)
                        </label>
                        <input
                            id="yieldQuantity"
                            name="yieldQuantity"
                            type="number"
                            step="0.01"
                            defaultValue={recipe.yieldQuantity}
                            onChange={(e) => setYieldVal(parseFloat(e.target.value) || 0)}
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="yieldUnit" className="mb-2 block text-sm font-medium">
                            Unidad
                        </label>
                        <select
                            id="yieldUnit"
                            name="yieldUnit"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                            defaultValue={recipe.yieldUnit || 'KG'}
                        >
                            <option value="KG">KG</option>
                            <option value="L">L</option>
                            <option value="UD">Raciones / Unidades</option>
                        </select>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mb-4">
                    <label htmlFor="instructions" className="mb-2 block text-sm font-medium">
                        Instrucciones
                    </label>
                    <textarea
                        id="instructions"
                        name="instructions"
                        rows={3}
                        defaultValue={recipe.instructions || ''}
                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                    ></textarea>
                </div>

                {/* Dynamic Items List */}
                <div className="mb-4 mt-8">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold">Ingredientes</h3>
                        <button type="button" onClick={addItem} className="flex items-center gap-1 rounded bg-blue-100 px-3 py-1 text-sm text-blue-600 hover:bg-blue-200">
                            <PlusIcon className="w-4" /> Añadir Item
                        </button>
                    </div>

                    {items.length === 0 && <p className="text-gray-500 italic text-sm">No hay ingredientes añadidos.</p>}

                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={item.key} className="flex flex-col md:flex-row gap-2 items-start md:items-center p-3 bg-white rounded border border-gray-200">
                                {/* Ingredient Selection */}
                                <div className="flex-grow w-full md:w-auto">
                                    <select
                                        className="block w-full rounded-md border-gray-200 text-sm"
                                        value={item.ingredientId}
                                        onChange={(e) => updateItem(index, 'ingredientId', e.target.value)}
                                    >
                                        <option value="">Seleccionar Ingrediente...</option>
                                        {ingredients.map(ing => (
                                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.pricingUnit})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quantity */}
                                <div className="w-full md:w-24">
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Cant."
                                        className="block w-full rounded-md border-gray-200 text-sm"
                                        value={item.quantityGross}
                                        onChange={(e) => updateItem(index, 'quantityGross', parseFloat(e.target.value))}
                                    />
                                </div>

                                {/* Unit */}
                                <div className="w-full md:w-24">
                                    <select
                                        className="block w-full rounded-md border-gray-200 text-sm"
                                        value={item.unit}
                                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                    >
                                        <option value="KG">KG</option>
                                        <option value="G">G</option>
                                        <option value="L">L</option>
                                        <option value="ML">ML</option>
                                        <option value="UD">UD</option>
                                    </select>
                                </div>

                                {/* Remove Action */}
                                <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-1">
                                    <TrashIcon className="w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div aria-live="polite" aria-atomic="true">
                    {state.message && (
                        <p className="mt-2 text-sm text-red-500">{state.message}</p>
                    )}
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/dashboard/recipes"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    Cancelar
                </Link>
                <button
                    type="submit"
                    className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                    Actualizar Receta
                </button>
            </div>
        </form>
    );
}
