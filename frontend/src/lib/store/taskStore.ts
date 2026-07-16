import { create } from 'zustand';
import { TaskStatus, TaskPriority } from '@/types/domain';

interface TaskFilterState {
  statusFilter: TaskStatus | null;
  priorityFilter: TaskPriority | null;
  searchQuery: string;
  setStatusFilter: (status: TaskStatus | null) => void;
  setPriorityFilter: (priority: TaskPriority | null) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useTaskFilterStore = create<TaskFilterState>((set) => ({
  statusFilter: null,
  priorityFilter: null,
  searchQuery: '',
  setStatusFilter: (status) => set({ statusFilter: status }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetFilters: () =>
    set({
      statusFilter: null,
      priorityFilter: null,
      searchQuery: '',
    }),
}));