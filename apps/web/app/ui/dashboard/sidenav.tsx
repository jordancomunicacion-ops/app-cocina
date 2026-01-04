'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { links } from './nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOutAction } from '@/app/lib/actions';

export default function SideNav({ user }: { user?: any }) {
    const pathname = usePathname();

    // Filter links based on role
    const filteredLinks = links.filter(link => {
        if (link.name === 'Empleados') {
            return user?.role === 'ADMIN';
        }
        return true;
    });

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-30 shadow-sm">
            {/* LOGO */}
            <div className="p-4 flex justify-center border-b border-gray-100">
                <img src="/logo-text.png" alt="SOTO DEL PRIOR" className="h-12" />
            </div>

            {/* PROFILE */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg uppercase">
                    {user?.name?.[0] || 'U'}
                </div>
                <div>
                    <p className="font-bold text-gray-800 text-sm truncate w-32">{user?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500">{user?.role || 'Empleado'}</p>
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredLinks.map((link) => {
                    const LinkIcon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={clsx(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                {
                                    'bg-indigo-50 text-indigo-700': pathname === link.href,
                                    'text-gray-600 hover:bg-gray-50 hover:text-gray-900': pathname !== link.href,
                                },
                            )}
                        >
                            <LinkIcon className="w-5" />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            {/* FOOTER */}
            <div className="p-4 border-t border-gray-100 space-y-2">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50">
                    <PowerIcon className="w-5" />
                    <span>Mi Perfil</span>
                </button>
                <form action={signOutAction}>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50">
                        <PowerIcon className="w-5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}
