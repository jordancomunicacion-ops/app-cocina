import EmployeesTable from '@/app/ui/employees/table';
import { CreateEmployee } from '@/app/ui/employees/buttons';
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
                <h1 className="text-2xl">Gestión de Empleados</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <CreateEmployee />
            </div>
            <Suspense fallback={<div>Cargando empleados...</div>}>
                <EmployeesTable query={query} currentPage={currentPage} />
            </Suspense>
        </div>
    );
}
