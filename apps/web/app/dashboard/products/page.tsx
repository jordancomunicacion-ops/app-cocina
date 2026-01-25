import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default async function Page() {
    const products = await prisma.supplierProduct.findMany({
        orderBy: { name: 'asc' },
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Productos de Proveedor</h1>
                <Link
                    href="/dashboard/products/create"
                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Crear Producto
                </Link>
            </div>

            <div className="mt-6 flow-root">
                <div className="inline-block min-w-full align-middle">
                    <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                        <table className="min-w-full text-gray-900">
                            <thead className="rounded-lg text-left text-sm font-normal">
                                <tr>
                                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                        Producto
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium">
                                        Proveedor
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium">
                                        Precio / Unidad
                                    </th>
                                    <th scope="col" className="relative py-3 pl-6 pr-3">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="w-full border-b py-3 text-sm last-of-type:border-none hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex items-center gap-3">
                                                <p className="font-semibold">{product.name}</p>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            {product.supplier || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            {new Intl.NumberFormat('es-ES', {
                                                style: 'currency',
                                                currency: 'EUR',
                                            }).format(product.price)}
                                            <span className="text-gray-500 font-normal"> / {product.unit}</span>
                                        </td>
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={`/dashboard/products/${product.id}`}
                                                    className="rounded-md border p-2 text-sm font-medium hover:bg-gray-100"
                                                >
                                                    Ver
                                                </Link>
                                                <Link
                                                    href={`/dashboard/products/${product.id}/transformations/create`}
                                                    className="rounded-md border p-2 text-sm font-medium hover:bg-gray-100"
                                                >
                                                    Elaboración
                                                </Link>
                                                <Link
                                                    href={`/dashboard/products/${product.id}/edit`}
                                                    className="rounded-md border p-2 text-sm font-medium hover:bg-gray-100"
                                                >
                                                    Editar
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );
}
