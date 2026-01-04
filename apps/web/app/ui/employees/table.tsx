import { UpdateEmployee, DeleteEmployee } from '@/app/ui/employees/buttons';
import { prisma } from '@/lib/prisma';
import clsx from 'clsx';

export default async function EmployeesTable({
    query,
    currentPage,
}: {
    query: string;
    currentPage: number;
}) {
    const employees = await prisma.user.findMany({
        where: {
            name: { contains: query },
        },
        orderBy: { name: 'asc' },
    });

    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <table className="hidden min-w-full text-gray-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                    Nombre
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Email
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Puesto
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Teléfono
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Rol
                                </th>
                                <th scope="col" className="relative py-3 pl-6 pr-3">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {employees.map((employee: any) => (
                                <tr
                                    key={employee.id}
                                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                >
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold">{employee.name}</p>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {employee.email}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                                        {employee.jobTitle || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                                        {employee.phone || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <span
                                            className={clsx(
                                                'inline-flex items-center rounded-full px-2 py-1 text-xs',
                                                {
                                                    'bg-purple-100 text-purple-700': employee.role === 'ADMIN',
                                                    'bg-orange-100 text-orange-700': employee.role === 'CHEF',
                                                    'bg-gray-100 text-gray-700': employee.role === 'EMPLOYEE',
                                                },
                                            )}
                                        >
                                            {employee.role}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex justify-end gap-3">
                                            <UpdateEmployee id={employee.id} />
                                            <DeleteEmployee id={employee.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
