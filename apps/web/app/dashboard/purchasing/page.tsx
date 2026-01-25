import { Suspense } from 'react';
import { calculateSmartShoppingList } from '@/app/lib/smart-shopping';
import { CalendarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default async function Page({
    searchParams,
}: {
    searchParams?: Promise<{
        start?: string;
        end?: string;
    }>;
}) {
    const params = await searchParams;
    // Default to next 30 days if not specified
    const startDate = params?.start ? new Date(params.start) : new Date();
    const endDate = params?.end ? new Date(params.end) : new Date(new Date().setDate(new Date().getDate() + 30));

    const recommendations = await calculateSmartShoppingList(startDate, endDate);

    return (
        <main>
            <h1 className="mb-4 text-2xl font-bold">Planificación de Compras</h1>
            <p className="mb-8 text-gray-500">
                Análisis de necesidades basado en eventos confirmados ({startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}).
            </p>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recommendations List */}
                <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Recomendaciones de Compra</h3>
                        </div>
                        <ul role="list" className="divide-y divide-gray-100">
                            {recommendations.length === 0 && (
                                <li className="p-6 text-center text-gray-500 italic">No hay necesidades detectadas para este periodo.</li>
                            )}
                            {recommendations.map((rec, idx) => (
                                <li key={idx} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 sm:flex-nowrap px-6 hover:bg-gray-50">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-x-2">
                                            <p className="text-sm font-semibold leading-6 text-gray-900">
                                                {rec.productName}
                                            </p>
                                            {rec.type === 'TRANSFORMATION' && (
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    Optimización ({rec.score.toFixed(0)}%)
                                                </span>
                                            )}
                                            {rec.type === 'DIRECT' && (
                                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                    Directo
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                                            <p>{rec.reason}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-none items-center gap-x-4">
                                        <div className="flex flex-col items-end">
                                            <p className="text-sm font-bold text-gray-900">{rec.quantityToBuy.toFixed(2)} KG</p> {/* Assuming KG for now */}
                                            {rec.supplier && <p className="text-xs text-gray-500">{rec.supplier}</p>}
                                        </div>
                                        <button className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                            Añadir
                                        </button>
                                    </div>
                                    {/* Breakdown details */}
                                    <div className="w-full mt-2 pl-4 border-l-2 border-gray-100">
                                        <details className="group">
                                            <summary className="flex cursor-pointer items-center text-xs font-medium text-blue-600 hover:text-blue-800">
                                                Ver detalle de uso
                                            </summary>
                                            <div className="mt-2 space-y-1 text-xs text-gray-600">
                                                <p className="font-semibold text-gray-900">Cubierto:</p>
                                                {rec.coveredIngredients.map((cov, i) => (
                                                    <p key={i}>- {cov.name}: {cov.quantity.toFixed(2)} ({cov.percentage}%)</p>
                                                ))}
                                                {rec.wasteOrSurplus.length > 0 && (
                                                    <>
                                                        <p className="font-semibold text-gray-900 mt-2">Excedente / Merma:</p>
                                                        {rec.wasteOrSurplus.map((waste, i) => (
                                                            <p key={i} className="text-orange-600">- {waste.name}: {waste.quantity.toFixed(2)}</p>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        </details>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
