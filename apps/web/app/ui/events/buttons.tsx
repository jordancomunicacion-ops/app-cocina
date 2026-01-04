import { PencilIcon, PlusIcon, TrashIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteEvent } from '@/app/lib/actions/events';

export function CreateEvent() {
    return (
        <Link
            href="/dashboard/events/create"
            className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
            <span className="hidden md:block">Nuevo Evento</span>
            <PlusIcon className="h-5 md:ml-4" />
        </Link>
    );
}

export function UpdateEvent({ id }: { id: string }) {
    return (
        <Link
            href={`/dashboard/events/${id}/edit`}
            className="rounded-md border p-2 hover:bg-gray-100"
        >
            <PencilIcon className="w-5" />
        </Link>
    );
}

export function DeleteEvent({ id }: { id: string }) {
    const deleteEventWithId = deleteEvent.bind(null, id);

    return (
        <form action={deleteEventWithId}>
            <button className="rounded-md border p-2 hover:bg-gray-100">
                <span className="sr-only">Delete</span>
                <TrashIcon className="w-5" />
            </button>
        </form>
    );
}

export function ViewShoppingList({ id }: { id: string }) {
    return (
        <Link
            href={`/dashboard/events/${id}/shopping-list`}
            className="rounded-md border p-2 hover:bg-gray-100 text-blue-600"
            title="Lista de Compra"
        >
            <ClipboardDocumentListIcon className="w-5" />
        </Link>
    );
}
