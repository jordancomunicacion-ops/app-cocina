import { generateShoppingList } from '@/app/lib/shopping-list';
import { prisma } from '@/lib/prisma';
import { formatUnit } from '@/app/lib/units';
import { formatCurrency } from '@/app/lib/costing';
import Link from 'next/link';
import { HomeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) notFound();

    const shoppingList = await generateShoppingList(id);
    const totalEstimatedCost = shoppingList.reduce((acc, item) => acc + item.estimatedCost, 0);

    return (
        <main>
            <div className="flex w-full items-center justify-between">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-4">
                        <li>
                            <div>
                                <Link href="/dashboard" className="text-gray-400 hover:text-gray-500">
                                    <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                                    <span className="sr-only">Home</span>
                                </Link>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="text-gray-300">/</span>
                                <Link href="/dashboard/events" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                    Eventos
                                </Link>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="text-gray-300">/</span>
                                <span className="ml-4 text-sm font-medium text-gray-500" aria-current="page">Lista de Compra</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="md:flex md:items-center md:justify-between my-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Lista de Compra: {event.name}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Basado en {event.pax} pax + {Math.round((event.safetyMargin - 1) * 100)}% margen seguridad.
                    </p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <button type="button" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Exportar PDF
                    </button>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg bg-green-50 p-4 border border-green-100">
                <div>
                    <p className="text-sm text-green-600 font-semibold">Coste Estimado Total Materia Prima</p>
                    <p className="text-3xl font-bold text-green-800">{formatCurrency(totalEstimatedCost)}</p>
                </div>
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Ingrediente
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Categoría
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Cantidad Total
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Coste Estimado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {shoppingList.map((item) => (
                                        <tr key={item.ingredient.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {item.ingredient.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {item.ingredient.category}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-bold">
                                                {item.totalQuantity.toFixed(2)} {item.unit}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {formatCurrency(item.estimatedCost)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
