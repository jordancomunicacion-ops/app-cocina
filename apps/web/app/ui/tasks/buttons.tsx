'use client';

import { PlusIcon, PlayIcon, CheckIcon, ExclamationCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { updateTaskStatus } from '@/app/lib/actions/tasks';

export function CreateTask() {
    return (
        <Link
            href="/dashboard/tasks/create"
            className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
            <span className="hidden md:block">Nueva Tarea</span>
            <PlusIcon className="h-5 md:ml-4" />
        </Link>
    );
}

export function TaskStatusButton({ id, status, currentStatus }: { id: string, status: string, currentStatus: string }) {
    const update = updateTaskStatus.bind(null, id, status);

    // Don't show button if already in that status
    if (status === currentStatus) return null;

    let icon = <ArrowRightIcon className="w-4 h-4" />;
    let label = "Mover";
    let bgClass = "bg-gray-100 text-gray-600 hover:bg-gray-200";

    if (status === 'IN_PROGRESS') {
        icon = <PlayIcon className="w-4 h-4" />;
        label = "Empezar";
        bgClass = "bg-blue-100 text-blue-600 hover:bg-blue-200";
    } else if (status === 'DONE') {
        icon = <CheckIcon className="w-4 h-4" />;
        label = "Completar";
        bgClass = "bg-green-100 text-green-600 hover:bg-green-200";
    } else if (status === 'ISSUE') {
        icon = <ExclamationCircleIcon className="w-4 h-4" />;
        label = "Problema";
        bgClass = "bg-red-100 text-red-600 hover:bg-red-200";
    }

    return (
        <form action={update}>
            <button className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${bgClass}`} title={label}>
                {icon} <span className="hidden sm:inline">{label}</span>
            </button>
        </form>
    );
}

