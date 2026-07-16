import { ITaskService } from './ITaskService';
import { ITaskRepository } from '../repositories/ITaskRepository';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../types/domain';

export class TaskService implements ITaskService {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async getAllTasks(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    return task;
  }

  async createTask(dto: CreateTaskDto): Promise<Task> {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    return this.taskRepository.create(dto);
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new Error(`Task with id ${id} not found`);
    }
    if (dto.title !== undefined && dto.title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }
    return this.taskRepository.update(id, dto);
  }

  async deleteTask(id: string): Promise<void> {
    const existing = await this.taskRepository.findById(id);
    if (!existing) {
      throw new Error(`Task with id ${id} not found`);
    }
    await this.taskRepository.delete(id);
  }
}