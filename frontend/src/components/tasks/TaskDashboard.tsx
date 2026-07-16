'use client';

import { useState, useCallback } from 'react';
import { Task, TaskStatus, TaskPriority, CreateTaskDto, UpdateTaskDto } from '@/types/domain';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/lib/hooks/useTasks';
import { useTaskFilterStore } from '@/lib/store/taskStore';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { Modal } from '../shared/Modal';

export function TaskDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { data: tasks = [], isLoading, error } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { searchQuery, setSearchQuery, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter, resetFilters } = useTaskFilterStore();

  const handleOpenCreate = useCallback(() => {
    setEditingTask(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTask(null);
  }, []);

  const handleSubmit = useCallback(
    async (dto: CreateTaskDto | UpdateTaskDto) => {
      try {
        if (editingTask) {
          await updateTask.mutateAsync({ id: editingTask.id, dto: dto as UpdateTaskDto });
        } else {
          await createTask.mutateAsync(dto as CreateTaskDto);
        }
        handleCloseModal();
      } catch {
        // Error handling is managed by React Query
      }
    },
    [editingTask, createTask, updateTask, handleCloseModal]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this task?')) {
        await deleteTask.mutateAsync(id);
      }
    },
    [deleteTask]
  );

  const handleStatusChange = useCallback(
    async (id: string, status: TaskStatus) => {
      await updateTask.mutateAsync({ id, dto: { status } });
    },
    [updateTask]
  );

  const isSaving = createTask.isPending || updateTask.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />

        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter((e.target.value || null) as TaskStatus | null)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">All Statuses</option>
          {Object.values(TaskStatus).map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter || ''}
          onChange={(e) => setPriorityFilter((e.target.value || null) as TaskPriority | null)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">All Priorities</option>
          {Object.values(TaskPriority).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {(statusFilter || priorityFilter || searchQuery) && (
          <button
            onClick={resetFilters}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">
            Failed to load tasks. Please make sure the backend server is running.
          </p>
        </div>
      )}

      {/* Task List */}
      <TaskList
        tasks={tasks}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isSaving}
        />
      </Modal>
    </div>
  );
}