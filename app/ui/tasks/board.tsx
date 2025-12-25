import { TaskStatusButton } from '@/app/ui/tasks/buttons';
import { prisma } from '@/lib/prisma';
import clsx from 'clsx';
import { User, Recipe } from '@prisma/client';

type TaskWithRelations = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    assignedTo: User | null;
    recipe: Recipe | null;
    plannedStart: Date | null;
    plannedEnd: Date | null;
};

export default async function TaskBoard() {
    const tasks = await prisma.task.findMany({
        include: {
            assignedTo: true,
            recipe: true
        },
        orderBy: { createdAt: 'desc' },
    });

    const columns = [
        { id: 'PENDING', title: 'Pendiente', color: 'bg-gray-50 border-gray-200' },
        { id: 'IN_PROGRESS', title: 'En Curso', color: 'bg-blue-50 border-blue-200' },
        { id: 'DONE', title: 'Completado', color: 'bg-green-50 border-green-200' },
        { id: 'ISSUE', title: 'Incidencia', color: 'bg-red-50 border-red-200' },
    ];

    return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto min-w-[800px] pb-4">
            {columns.map(col => (
                <div key={col.id} className={`rounded-lg border p-4 ${col.color} min-h-[500px]`}>
                    <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
                        {col.title}
                        <span className="bg-white px-2 py-0.5 rounded text-sm text-gray-500 border">
                            {tasks.filter(t => t.status === col.id).length}
                        </span>
                    </h3>
                    <div className="space-y-3">
                        {tasks.filter(t => t.status === col.id).map(task => (
                            <div key={task.id} className="bg-white p-3 rounded shadow-sm border border-gray-100">
                                <h4 className="font-semibold text-gray-900">{task.title}</h4>
                                {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}

                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                    {task.assignedTo && (
                                        <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                            {task.assignedTo.name}
                                        </span>
                                    )}
                                    {task.recipe && (
                                        <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                                            🍳 {task.recipe.name}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-3 flex justify-end gap-1 pt-2 border-t border-gray-50">
                                    {/* Status Transitions */}
                                    {task.status === 'PENDING' && <TaskStatusButton id={task.id} status="IN_PROGRESS" currentStatus={task.status} />}
                                    {task.status === 'IN_PROGRESS' && <TaskStatusButton id={task.id} status="DONE" currentStatus={task.status} />}
                                    {task.status === 'IN_PROGRESS' && <TaskStatusButton id={task.id} status="ISSUE" currentStatus={task.status} />}
                                    {task.status === 'ISSUE' && <TaskStatusButton id={task.id} status="PENDING" currentStatus={task.status} />}
                                    {task.status === 'ISSUE' && <TaskStatusButton id={task.id} status="DONE" currentStatus={task.status} />}
                                    {/* Anyone can move back to pending if needed or other transitions */}
                                </div>
                            </div>
                        ))}
                        {tasks.filter(t => t.status === col.id).length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm italic">
                                Sin tareas
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
