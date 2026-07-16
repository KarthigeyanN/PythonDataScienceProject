import { Task, CreateTaskDto, UpdateTaskDto } from '../../types/domain';

export interface ITaskService {
  getAllTasks(): Promise<Task[]>;
  getTaskById(id: string): Promise<Task>;
  createTask(dto: CreateTaskDto): Promise<Task>;
  updateTask(id: string, dto: UpdateTaskDto): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}