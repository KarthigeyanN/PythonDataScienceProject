import axios from 'axios';
import { Task, CreateTaskDto, UpdateTaskDto, ApiResponse } from '@/types/domain';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    const response = await apiClient.get<ApiResponse<Task[]>>('/tasks');
    return response.data.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  },

  create: async (dto: CreateTaskDto): Promise<Task> => {
    const response = await apiClient.post<ApiResponse<Task>>('/tasks', dto);
    return response.data.data;
  },

  update: async (id: string, dto: UpdateTaskDto): Promise<Task> => {
    const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, dto);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};