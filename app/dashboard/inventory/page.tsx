import InventoryTable from '@/app/ui/inventory/table';
import { CreateIngredient } from '@/app/ui/inventory/buttons';
import { Suspense } from 'react';

export default async function Page({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}) {
    const params = await searchParams;
    const query = params?.query || '';
    const currentPage = Number(params?.page) || 1;

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">Inventario</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                {/* <Search placeholder="Buscar ingredientes..." /> */}
                <CreateIngredient />
            </div>
            {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
            <Suspense fallback={<div>Cargando...</div>}>
                <InventoryTable query={query} currentPage={currentPage} />
            </Suspense>
        </div>
    );
}
