import RecipesTable from '@/app/ui/recipes/table';
import { CreateRecipe } from '@/app/ui/recipes/buttons';
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
                <h1 className="text-2xl">Recetario (Escandallos)</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <CreateRecipe />
            </div>
            <Suspense fallback={<div>Cargando recetas...</div>}>
                <RecipesTable query={query} currentPage={currentPage} />
            </Suspense>
        </div>
    );
}
