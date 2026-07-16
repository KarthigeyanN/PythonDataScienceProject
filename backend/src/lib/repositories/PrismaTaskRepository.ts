import { PrismaClient } from '@prisma/client';
import { ITaskRepository } from './ITaskRepository';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../types/domain';
import { PrismaClientSingleton } from '../database/PrismaClient';

export class PrismaTaskRepository implements ITaskRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaClientSingleton.getInstance();
  }

  async findAll(): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(this.mapToDomain);
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    return task ? this.mapToDomain(task) : null;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        priority: dto.priority ?? 'MEDIUM',
      },
    });
    return this.mapToDomain(task);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
      },
    });
    return this.mapToDomain(task);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  private mapToDomain(prismaTask: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    createdAt: Date;
    updatedAt: Date;
  }): Task {
    return {
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description,
      status: prismaTask.status as Task['status'],
      priority: prismaTask.priority as Task['priority'],
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt,
    };
  }
}