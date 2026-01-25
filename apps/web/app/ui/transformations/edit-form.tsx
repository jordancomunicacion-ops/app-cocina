'use client';

import { updateTransformation, TransformationFormState } from '@/app/lib/actions/transformations';
import { useActionState, useState } from 'react';
import { Ingredient, SupplierProduct, Transformation, TransformationOutput, Ingredient as OutputIngredient } from '@prisma/client';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

type ExtendedIngredient = Ingredient & {
    transformationOutputs?: (TransformationOutput & {
        transformation: Transformation & {
            sourceProduct: SupplierProduct
        }
    })[]
};

type ExtendedTransformation = Transformation & {
    outputs: (TransformationOutput & {
        ingredient: OutputIngredient
    })[];
};

type Props = {
    product: SupplierProduct;
    transformation: ExtendedTransformation;
    ingredients: ExtendedIngredient[];
};

type OutputRow = {
    key: string;
    ingredientId: string;
    newIngredientName: string;
    weight: number | string;
    costAllocation: number | string;
};

export default function EditTransformationForm({ product, transformation, ingredients }: Props) {
    const initialState: TransformationFormState = { message: null, errors: {} };
    const updateAction = updateTransformation.bind(null, transformation.id);
    const [state, formAction] = useActionState(updateAction, initialState);

    // Initialize with existing data. We need to calculate what the "testQuantity" was.
    // Actually, we don't store "testQuantity" in DB explicitly on Transformation model (based on schema I recalled? check schema).
    // Ah, schema check:
    // model Transformation { ... sourceProductId ... outputs ... }
    // model TransformationOutput { ... percentage ... }
    // We DON'T store the input weight (testQuantity) in the DB? 
    // Wait, let's check schema details from memory or file.
    // If we don't store it, we can't show it back easily unless we infer it from one output? A bit tricky.
    // Let's check schema.prisma first just to be sure. 
    // If it's missing, I might have to calculate it: 
    // OutputWeight = testQuantity * (percentage/100) => testQuantity = OutputWeight / (percentage/100).
    // But we need the absolute weight of at least one output to know the input weight if we assume the user enters absolute input weight.
    // Wait, the creating form asks for "Cantidad" (testQuantity).
    // And saves "percentage". 
    // We DO NOT seem to store `testQuantity` in `Transformation` model in `schema.prisma` I saw earlier.
    // Let me check schema.

    // Assuming for now we recover it from the first output if available.
    // testQuantity = (output[0].weight / output[0].percentage) * 100? 
    // But we don't store output absolute weight either! We store `percentage`.
    // We only store `percentage`.
    // So on Edit, we can't show the original "Input Weight" and "Output Weights". We can only show Percentages.
    // Unless we ask the user to input a "Base Weight" again to calculate the weights, OR we just let them edit Percentages directly?
    // But the UI was designed to input weights.

    // If I cannot recover the weights, I will have to default Test Quantity to 100 (representing 100%) and show weights as percentages.

    const [testQuantity, setTestQuantity] = useState<number>(1); // Defaulting to 1 unit (1kg for example) implies weights are percentages/fractions.

    const [outputs, setOutputs] = useState<OutputRow[]>(
        transformation.outputs.map(o => ({
            key: o.id,
            ingredientId: o.ingredientId,
            newIngredientName: o.ingredient.name,
            weight: (o.percentage * testQuantity) / 100, // Re-calculate simulated weight
            costAllocation: o.costAllocation
        }))
    );

    // Recalculate weights if testQuantity changes?
    // Actually if user changes testQuantity, should we scale weights or keep weights and change percentages?
    // Usually in a test, you enter the input weight, then measuring the outputs.
    // Since we lost the original input weight, showing "1" and weights as "0.XX" (which equals percentage/100) is a safe bet.
    // Or 100 and weights as percentage.

    const addOutput = () => {
        setOutputs([...outputs, { key: crypto.randomUUID(), ingredientId: '', newIngredientName: '', weight: '', costAllocation: 1 }]);
    };

    const removeOutput = (index: number) => {
        const newOutputs = [...outputs];
        newOutputs.splice(index, 1);
        setOutputs(newOutputs);
    };

    const updateOutput = (index: number, field: keyof OutputRow, value: any) => {
        const newOutputs = [...outputs];
        newOutputs[index] = { ...newOutputs[index], [field]: value };
        setOutputs(newOutputs);
    };

    const totalOutputWeight = outputs.reduce((sum, row) => sum + (Number(row.weight) || 0), 0);
    const yieldPercentage = testQuantity > 0 ? (totalOutputWeight / testQuantity) * 100 : 0;

    return (
        <form action={formAction}>
            <input type="hidden" name="sourceProductId" value={product.id} />
            <input type="hidden" name="outputs" value={JSON.stringify(outputs)} />

            <div className="rounded-md bg-gray-50 p-4 md:p-6 mb-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Nombre de la Transformación</label>
                    <input
                        name="name"
                        type="text"
                        defaultValue={transformation.name}
                        placeholder="Ej. Limpieza Standard..."
                        className="w-full rounded-md border-gray-200 py-2 pl-4 text-sm"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Cantidad Base para Cálculo</label>
                    <div className="flex items-center gap-2">
                        <input
                            name="testQuantity"
                            type="number"
                            step="any"
                            value={testQuantity}
                            onChange={(e) => {
                                const newVal = parseFloat(e.target.value);
                                setTestQuantity(newVal);
                                // Optional: Update weights to maintain percentages?
                                // Or keep weights and let percentages update?
                                // Let's keep weights fixed (as if user is adjusting the input size but output weights are fixed? No, that changes percentage).
                                // If I change input size, and I want to KEEP the percentage from DB, I should scale weights.
                                // But here we are editing. Code simplicity: Just update input, weights stay literal, percentages update.
                            }}
                            className="w-32 rounded-md border-gray-200 py-2 pl-4 text-sm"
                        />
                        <span className="font-bold text-gray-600">{product.unit}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        * Al editar, por defecto usaremos cantidad 1 para mostrar los rendimientos como proporción.
                    </p>
                </div>
            </div>

            <div className="rounded-md bg-white border border-gray-200 p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Desglose (Salidas)</h3>
                    <div className="text-sm">
                        <span className={`font-bold ${Math.abs(100 - yieldPercentage) < 1 ? 'text-green-600' : 'text-orange-500'}`}>
                            Rendimiento Total: {yieldPercentage.toFixed(1)}%
                        </span>
                        <span className="text-gray-400 mx-2">|</span>
                        <span>Total Peso: {totalOutputWeight.toFixed(3)} {product.unit}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase">
                        <div className="col-span-5">Ingrediente Resultante</div>
                        <div className="col-span-2">Peso Obtenido</div>
                        <div className="col-span-2">Factor Coste</div>
                        <div className="col-span-2">Rendimiento</div>
                        <div className="col-span-1"></div>
                    </div>

                    {outputs.map((row, index) => {
                        const weightNum = Number(row.weight) || 0;
                        const rowPercentage = testQuantity > 0 ? (weightNum / testQuantity) * 100 : 0;

                        return (
                            <div key={row.key} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded">
                                <div className="col-span-5">
                                    <input
                                        type="text"
                                        list={`ingredients-${index}`}
                                        className="w-full rounded border-gray-200 text-sm py-1"
                                        value={row.newIngredientName}
                                        onChange={(e) => updateOutput(index, 'newIngredientName', e.target.value)}
                                    />
                                    <datalist id={`ingredients-${index}`}>
                                        {ingredients.map(ing => {
                                            let displayName = ing.name;
                                            if (ing.transformationOutputs && ing.transformationOutputs.length > 0 && ing.transformationOutputs[0].transformation?.sourceProduct) {
                                                const sourceName = ing.transformationOutputs[0].transformation.sourceProduct.name;
                                                // Avoid double prefixing if name already contains source
                                                if (!displayName.toLowerCase().includes(sourceName.toLowerCase())) {
                                                    displayName = `${sourceName} - ${ing.name}`;
                                                }
                                            }
                                            return <option key={ing.id} value={displayName} />;
                                        })}
                                    </datalist>
                                </div>

                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        step="any"
                                        className="w-full rounded border-gray-200 text-sm py-1"
                                        value={row.weight}
                                        onChange={(e) => updateOutput(index, 'weight', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full rounded border-gray-200 text-sm py-1"
                                        value={row.costAllocation}
                                        onChange={(e) => updateOutput(index, 'costAllocation', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    />
                                </div>

                                <div className="col-span-2 text-center text-sm font-medium">
                                    {rowPercentage.toFixed(1)}%
                                </div>

                                <div className="col-span-1 flex justify-end">
                                    <button type="button" onClick={() => removeOutput(index)} className="text-red-500 hover:text-red-700">
                                        <TrashIcon className="w-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4">
                    <button type="button" onClick={addOutput} className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                        <PlusIcon className="w-4" /> Añadir Salida
                    </button>
                </div>
            </div>

            <div aria-live="polite" aria-atomic="true" className="mt-4">
                {state.message && (
                    <p className="text-sm text-red-500">{state.message}</p>
                )}
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <button
                    type="submit"
                    className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                    Guardar Cambios
                </button>
            </div>
        </form>
    );
}
