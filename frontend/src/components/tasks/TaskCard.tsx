'use client';

import { Task, TaskStatus, TaskPriority } from '@/types/domain';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [TaskStatus.DONE]: 'bg-green-100 text-green-800',
};

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-gray-100 text-gray-600',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-800',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-800',
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const nextStatus: Record<TaskStatus, TaskStatus> = {
    [TaskStatus.TODO]: TaskStatus.IN_PROGRESS,
    [TaskStatus.IN_PROGRESS]: TaskStatus.DONE,
    [TaskStatus.DONE]: TaskStatus.TODO,
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
        <div className="flex gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}
          >
            {task.status.replace('_', ' ')}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => onStatusChange(task.id, nextStatus[task.status])}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {task.status === TaskStatus.DONE ? 'Reopen' : 'Move to ' + nextStatus[task.status].replace('_', ' ')}
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}