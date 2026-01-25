import {
    UserGroupIcon,
    HomeIcon,
    DocumentDuplicateIcon,
    CalendarIcon,
    ClipboardDocumentCheckIcon,
    ArchiveBoxIcon,
    Cog6ToothIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';

export const links = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    {
        name: 'Productos',
        href: '/dashboard/products',
        icon: ArchiveBoxIcon,
    },
    { name: 'Recetas', href: '/dashboard/recipes', icon: DocumentDuplicateIcon },
    { name: 'Eventos', href: '/dashboard/events', icon: CalendarIcon },
    { name: 'Compras', href: '/dashboard/purchasing', icon: ShoppingCartIcon },
    { name: 'Tareas', href: '/dashboard/tasks', icon: ClipboardDocumentCheckIcon },
    { name: 'Empleados', href: '/dashboard/employees', icon: UserGroupIcon },
    { name: 'Configuración', href: '/dashboard/settings', icon: Cog6ToothIcon },
];
