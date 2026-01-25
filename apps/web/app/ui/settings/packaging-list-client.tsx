'use client';

import { createPackaging, deletePackaging, CategoryFormState } from '@/app/lib/actions/settings';
import { useActionState } from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { RecipePackaging } from '@prisma/client';

export default function PackagingListClient({ packaging }: { packaging: RecipePackaging[] }) {
    const initialState: CategoryFormState = { message: null, errors: {} };
    const [state, formAction] = useActionState(createPackaging, initialState);

    return (
        <div className="rounded-md bg-white p-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Envases / Moldes</h2>

            {/* List */}
            <ul className="mb-6 divide-y divide-gray-100">
                {packaging.length === 0 && <p className="text-sm text-gray-500 italic">No hay envases definidos.</p>}
                {packaging.map((pkg) => (
                    <li key={pkg.id} className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-700">{pkg.name}</span>
                        <button
                            onClick={() => deletePackaging(pkg.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </li>
                ))}
            </ul>

            {/* Add Form */}
            <form action={formAction} className="border-t pt-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Añadir Envase</label>
                <div className="flex gap-2">
                    <input
                        name="name"
                        type="text"
                        placeholder="Ej. Molde 22cm"
                        className="flex-grow rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
                    <button
                        type="submit"
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                {state.message && <p className="mt-2 text-xs text-red-500">{state.message}</p>}
            </form>
        </div>
    );
}
