'use client';

import { createRecipe, RecipeFormState } from '@/app/lib/actions/recipes';
import Link from 'next/link';
import {
    UserCircleIcon,
    TagIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { useActionState, useState } from 'react';
import { Ingredient, TransformationOutput, SupplierProduct, RecipeCategory, RecipePackaging, Recipe } from '@prisma/client';

// Type definitions
type IngredientWithSources = Ingredient & {
    transformationOutputs: (TransformationOutput & {
        transformation: {
            sourceProduct: SupplierProduct
        }
    })[]
};

type RecipeItemInput = {
    key: string;
    type: 'INGREDIENT' | 'SUB_RECIPE';
    ingredientId: string;
    subRecipeId: string;
    sourceProductId?: string; // Selected provider
    quantityGross: number;
    unit: string;
};

type StepInput = {
    key: string;
    order: number;
    description: string;
    action?: string;
    subAction?: string;
    ingredientId?: string;
};

export default function Form({
    ingredients,
    categories,
    packaging,
    availableSubRecipes = []
}: {
    ingredients: IngredientWithSources[];
    categories: RecipeCategory[];
    packaging: RecipePackaging[];
    availableSubRecipes?: Recipe[];
}) {
    const initialState: RecipeFormState = { message: null, errors: {} };
    const [state, formAction] = useActionState(createRecipe, initialState);

    const [items, setItems] = useState<RecipeItemInput[]>([]);

    const addItem = () => {
        setItems([
            ...items,
            {
                key: crypto.randomUUID(),
                type: 'INGREDIENT',
                ingredientId: '',
                subRecipeId: '',
                sourceProductId: '',
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

        // Reset source if ingredient changes
        if (field === 'ingredientId') {
            newItems[index].sourceProductId = '';
        }

        setItems(newItems);
    };

    // Steps Logic
    type StepInput = {
        key: string;
        order: number;
        description: string;
        action?: string;
        subAction?: string;
        ingredientId?: string;
    };
    const [steps, setSteps] = useState<StepInput[]>([]);

    const ACTIONS: Record<string, string[]> = {
        'CORTAR': ['Brunoisse', 'Juliana', 'Mirepoix', 'Rodajas', 'Gajos'],
        'DESPIEZAR': ['Filetear', 'Picar', 'Limpiar', 'Deshuesar'],
        'COCCION': ['Directa', 'Indirecta', 'Al vacío', 'Hervir', 'Sofreír', 'Asar'],
        'MEZCLAR': ['Batir', 'Remover', 'Amasar'],
        'OTROS': ['Marinar', 'Reposar', 'Emplatar']
    };

    const addStep = () => {
        setSteps([...steps, { key: crypto.randomUUID(), order: steps.length + 1, description: '', action: '', subAction: '', ingredientId: '' }]);
    };

    const removeStep = (index: number) => {
        const newSteps = [...steps];
        newSteps.splice(index, 1);
        const reordered = newSteps.map((s, i) => ({ ...s, order: i + 1 }));
        setSteps(reordered);
    };

    const updateStep = (index: number, field: keyof StepInput, value: any) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };

        // Reset subAction if action changes
        if (field === 'action') {
            newSteps[index].subAction = '';
        }

        setSteps(newSteps);
    };

    // Helper to get ingredient name from ID (using items array which has the selected ingredients)
    const getIngredientOptions = () => {
        // We need to match items (RecipeItemInput) to the full Ingredient object passed in props
        return items.map(item => {
            const ing = ingredients.find(i => i.id === item.ingredientId);
            return ing ? { id: ing.id, name: ing.name } : null;
        }).filter(Boolean) as { id: string, name: string }[];
    };

    const availableIngredients = getIngredientOptions();

    return (
        <form action={formAction}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                {/* Helper to pass items to server action */}
                <input type="hidden" name="items" value={JSON.stringify(items)} />
                <input type="hidden" name="steps" value={JSON.stringify(steps)} />

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

                {/* Technical Info Grid */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6 border-gray-200">
                    {/* Classification (Old Category) */}
                    <div>
                        <label htmlFor="classification" className="mb-2 block text-sm font-medium">Clasificación</label>
                        <select
                            id="classification"
                            name="classification"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                            defaultValue=""
                        >
                            <option value="" disabled>Seleccionar Clasificación...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <div id="classification-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.classification && state.errors.classification.map((error: string) => (
                                <p key={error} className="mt-2 text-sm text-red-500">{error}</p>
                            ))}
                        </div>
                    </div>

                    {/* New fixed Category (Type) */}
                    <div>
                        <label htmlFor="category" className="mb-2 block text-sm font-medium">Tipo de Receta</label>
                        <select
                            id="category"
                            name="category"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                            defaultValue="ELABORACION_FINAL"
                        >
                            <option value="PRODUCTO_NO_ELABORADO">Producto No Elaborado</option>
                            <option value="ELABORACION_INTERMEDIA">Elaboración Intermedia</option>
                            <option value="ELABORACION_FINAL">Elaboración Final</option>
                        </select>
                        <div id="category-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.category && state.errors.category.map((error: string) => (
                                <p key={error} className="mt-2 text-sm text-red-500">{error}</p>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="packaging" className="mb-2 block text-sm font-medium">Envasado / Molde</label>
                        <select
                            id="packaging"
                            name="packaging"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                            defaultValue=""
                        >
                            <option value="">Seleccionar Envase...</option>
                            {packaging.map((pkg) => (
                                <option key={pkg.id} value={pkg.name}>{pkg.name}</option>
                            ))}
                        </select>
                        <div id="packaging-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.packaging && state.errors.packaging.map((error: string) => (
                                <p key={error} className="mt-2 text-sm text-red-500">{error}</p>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="portions" className="mb-2 block text-sm font-medium">Nº Raciones</label>
                        <input id="portions" name="portions" type="number" placeholder="Ej. 36" className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm placeholder:text-gray-500" />
                        <div id="portions-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.portions && state.errors.portions.map((error: string) => (
                                <p key={error} className="mt-2 text-sm text-red-500">{error}</p>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="prepTime" className="mb-2 block text-sm font-medium">Tiempo Preparación (mins)</label>
                        <input id="prepTime" name="prepTime" type="number" placeholder="15" className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm placeholder:text-gray-500" />
                        <div id="prepTime-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.prepTime && state.errors.prepTime.map((error: string) => (
                                <p key={error} className="mt-2 text-sm text-red-500">{error}</p>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="cookTime" className="mb-2 block text-sm font-medium">Tiempo Cocción (mins)</label>
                        <input id="cookTime" name="cookTime" type="number" placeholder="27" className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm placeholder:text-gray-500" />
                        <div id="cookTime-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.cookTime && state.errors.cookTime.map((error: string) => (
                                <p key={error} className="mt-2 text-sm text-red-500">{error}</p>
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
                            placeholder="Ej. 2.5"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                        />
                        <div id="yieldQuantity-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.yieldQuantity && state.errors.yieldQuantity.map((error: string) => (
                                <p key={error} className="mt-2 text-sm text-red-500">{error}</p>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="yieldUnit" className="mb-2 block text-sm font-medium">
                            Unidad
                        </label>
                        <select
                            id="yieldUnit"
                            name="yieldUnit"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                            defaultValue="KG"
                        >
                            <option value="KG">KG</option>
                            <option value="L">L</option>
                            <option value="UD">Raciones / Unidades</option>
                        </select>
                        <div id="yieldUnit-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.yieldUnit && state.errors.yieldUnit.map((error: string) => (
                                <p key={error} className="mt-2 text-sm text-red-500">{error}</p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Instructions Summary */}
                <div className="mb-4">
                    <label htmlFor="instructions" className="mb-2 block text-sm font-medium">
                        Notas
                    </label>
                    <textarea
                        id="instructions"
                        name="instructions"
                        rows={2}
                        placeholder="Resumen general..."
                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500"
                    ></textarea>
                </div>

                {/* Dynamic Items List */}
                <div className="mb-4 mt-8">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold">Ingredientes</h3>
                        <button type="button" onClick={addItem} className="flex items-center gap-1 rounded bg-blue-100 px-3 py-1 text-sm text-blue-600 hover:bg-blue-200">
                            <PlusIcon className="w-4" /> Añadir Ingrediente
                        </button>
                    </div>

                    {items.length === 0 && <p className="text-gray-500 italic text-sm">No hay ingredientes añadidos.</p>}

                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={item.key} className="flex flex-col md:flex-row gap-2 items-start md:items-center p-3 bg-white rounded border border-gray-200">
                                {/* Type Selection */}
                                <div className="w-full md:w-32">
                                    <select
                                        className="block w-full rounded-md border-gray-200 text-sm font-medium"
                                        value={item.type}
                                        onChange={(e) => {
                                            const newType = e.target.value as 'INGREDIENT' | 'SUB_RECIPE';
                                            // Reset IDs when type changes to prevent invalid state
                                            const newItems = [...items];
                                            newItems[index] = {
                                                ...newItems[index],
                                                type: newType,
                                                ingredientId: '',
                                                subRecipeId: '',
                                                sourceProductId: ''
                                            };
                                            setItems(newItems);
                                        }}
                                    >
                                        <option value="INGREDIENT">Ingrediente</option>
                                        <option value="SUB_RECIPE">Sub-Receta</option>
                                    </select>
                                </div>

                                {/* Item Selection */}
                                <div className="flex-grow w-full md:w-auto">
                                    {item.type === 'INGREDIENT' ? (
                                        <select
                                            className="block w-full rounded-md border-gray-200 text-sm"
                                            value={item.ingredientId}
                                            onChange={(e) => updateItem(index, 'ingredientId', e.target.value)}
                                        >
                                            <option value="">Seleccionar Ingrediente...</option>
                                            {ingredients.map(ing => {
                                                let displayName = ing.name;
                                                const sources = ing.transformationOutputs?.map(o => o.transformation.sourceProduct.name);
                                                if (sources && sources.length > 0) {
                                                    // Deduplicate names
                                                    const uniqueSources = Array.from(new Set(sources));
                                                    displayName = `${uniqueSources.join(' / ')} - ${ing.name}`;
                                                }
                                                return (
                                                    <option key={ing.id} value={ing.id}>{displayName}</option>
                                                );
                                            })}
                                        </select>
                                    ) : (
                                        <select
                                            className="block w-full rounded-md border-gray-200 text-sm"
                                            value={item.subRecipeId}
                                            onChange={(e) => updateItem(index, 'subRecipeId', e.target.value)}
                                        >
                                            <option value="">Seleccionar Sub-Receta...</option>
                                            {availableSubRecipes.map(recipe => (
                                                <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Source/Provider Selection (if available for this ingredient) */}
                                {(() => {
                                    const selectedIng = ingredients.find(i => i.id === item.ingredientId);
                                    if (selectedIng && selectedIng.transformationOutputs && selectedIng.transformationOutputs.length > 0) {
                                        return (
                                            <div className="flex-grow w-full md:w-auto">
                                                <select
                                                    className="block w-full rounded-md border-gray-200 text-sm text-gray-600"
                                                    value={item.sourceProductId || ''}
                                                    onChange={(e) => updateItem(index, 'sourceProductId', e.target.value)}
                                                >
                                                    <option value="">-- Origen Genérico --</option>
                                                    {selectedIng.transformationOutputs.map(output => (
                                                        <option key={output.transformation.sourceProduct.id} value={output.transformation.sourceProduct.id}>
                                                            {output.transformation.sourceProduct.supplier ? (
                                                                `${output.transformation.sourceProduct.supplier} - `
                                                            ) : ''}
                                                            {output.transformation.sourceProduct.name} ({output.percentage.toFixed(0)}%)
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

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

                {/* ... Skipping to Steps List for replacement ... */}

                {/* Steps List */}
                <div className="mb-6 mt-8">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold">Método de elaboración (Pasos)</h3>
                        <button type="button" onClick={addStep} className="flex items-center gap-1 rounded bg-blue-100 px-3 py-1 text-sm text-blue-600 hover:bg-blue-200">
                            <PlusIcon className="w-4" /> Añadir Paso
                        </button>
                    </div>
                    {steps.length === 0 && <p className="text-gray-500 italic text-sm">No hay pasos definidos.</p>}
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={step.key} className="flex flex-col gap-2 p-3 bg-white rounded border border-gray-200 shadow-sm">
                                <div className="flex gap-2 items-start">
                                    <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 font-bold text-xs text-gray-600 mt-1">
                                        {step.order}
                                    </span>
                                    <textarea
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        rows={2}
                                        placeholder=""
                                        value={step.description}
                                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                                    ></textarea>
                                    <button type="button" onClick={() => removeStep(index)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-5" /></button>
                                </div>

                                {/* Structured Data / Tags */}
                                <div className="ml-8 flex flex-wrap gap-2 items-center">
                                    <select
                                        className="text-xs rounded border-gray-200 py-1 pl-2 pr-6"
                                        value={step.action || ''}
                                        onChange={(e) => updateStep(index, 'action', e.target.value)}
                                    >
                                        <option value="">-- Acción --</option>
                                        {Object.keys(ACTIONS).map(act => <option key={act} value={act}>{act}</option>)}
                                    </select>

                                    {step.action && ACTIONS[step.action] && (
                                        <select
                                            className="text-xs rounded border-gray-200 py-1 pl-2 pr-6"
                                            value={step.subAction || ''}
                                            onChange={(e) => updateStep(index, 'subAction', e.target.value)}
                                        >
                                            <option value="">-- Técnica --</option>
                                            {ACTIONS[step.action].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                        </select>
                                    )}

                                    <select
                                        className="text-xs rounded border-gray-200 py-1 pl-2 pr-6 max-w-[150px]"
                                        value={step.ingredientId || ''}
                                        onChange={(e) => updateStep(index, 'ingredientId', e.target.value)}
                                    >
                                        <option value="">-- Ingrediente Relacionado --</option>
                                        {availableIngredients.map(ing => (
                                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                                        ))}
                                    </select>
                                </div>
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
                    Guardar Receta
                </button>
            </div>
        </form >
    );
}
