import {
    UserGroupIcon,
    HomeIcon,
    DocumentDuplicateIcon,
    CalendarIcon,
    ClipboardDocumentCheckIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';

export const links = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    {
        name: 'Inventario',
        href: '/dashboard/inventory',
        icon: ArchiveBoxIcon,
    },
    { name: 'Recetas', href: '/dashboard/recipes', icon: DocumentDuplicateIcon },
    { name: 'Eventos', href: '/dashboard/events', icon: CalendarIcon },
    { name: 'Tareas', href: '/dashboard/tasks', icon: ClipboardDocumentCheckIcon },
    { name: 'Empleados', href: '/dashboard/employees', icon: UserGroupIcon },
];
