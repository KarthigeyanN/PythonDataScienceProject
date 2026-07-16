import { Task, CreateTaskDto, UpdateTaskDto } from '../../types/domain';

export interface ITaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(dto: CreateTaskDto): Promise<Task>;
  update(id: string, dto: UpdateTaskDto): Promise<Task>;
  delete(id: string): Promise<void>;
}