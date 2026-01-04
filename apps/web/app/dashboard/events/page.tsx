import EventsTable from '@/app/ui/events/table';
import { CreateEvent } from '@/app/ui/events/buttons';
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
                <h1 className="text-2xl">Gestión de Eventos</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <CreateEvent />
            </div>
            <Suspense fallback={<div>Cargando eventos...</div>}>
                <EventsTable query={query} currentPage={currentPage} />
            </Suspense>
        </div>
    );
}
