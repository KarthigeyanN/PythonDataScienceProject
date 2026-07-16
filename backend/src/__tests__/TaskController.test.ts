import { Request, Response } from 'express';
import { TaskController } from '../lib/controllers/TaskController';
import { ITaskService } from '../lib/services/ITaskService';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from '../types/domain';

class MockTaskService implements ITaskService {
  private tasks: Task[] = [];
  private nextId = 1;

  async getAllTasks(): Promise<Task[]> {
    return this.tasks;
  }

  async getTaskById(id: string): Promise<Task> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Task with id ${id} not found`);
    return task;
  }

  async createTask(dto: CreateTaskDto): Promise<Task> {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    const task: Task = {
      id: String(this.nextId++),
      title: dto.title,
      description: dto.description || null,
      status: TaskStatus.TODO,
      priority: dto.priority || TaskPriority.MEDIUM,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.push(task);
    return task;
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Task with id ${id} not found`);
    if (dto.title !== undefined && dto.title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }
    this.tasks[index] = { ...this.tasks[index], ...dto, updatedAt: new Date() } as Task;
    return this.tasks[index];
  }

  async deleteTask(id: string): Promise<void> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Task with id ${id} not found`);
    this.tasks.splice(index, 1);
  }
}

function createMockRes(): Response {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('TaskController', () => {
  let controller: TaskController;
  let mockService: MockTaskService;

  beforeEach(() => {
    mockService = new MockTaskService();
    controller = new TaskController(mockService);
  });

  describe('getAll', () => {
    it('should return all tasks', async () => {
      await mockService.createTask({ title: 'Task 1' });
      await mockService.createTask({ title: 'Task 2' });
      const req = {} as Request;
      const res = createMockRes();
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: expect.any(Array) });
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.data).toHaveLength(2);
    });

    it('should return 500 on error', async () => {
      jest.spyOn(mockService, 'getAllTasks').mockRejectedValue(new Error('DB Error'));
      const req = {} as Request;
      const res = createMockRes();
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getById', () => {
    it('should return a task by id', async () => {
      const created = await mockService.createTask({ title: 'Test' });
      const req = { params: { id: created.id } } as unknown as Request;
      const res = createMockRes();
      await controller.getById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: expect.objectContaining({ id: created.id }) });
    });

    it('should return 404 for missing task', async () => {
      const req = { params: { id: '999' } } as unknown as Request;
      const res = createMockRes();
      await controller.getById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on unexpected error', async () => {
      jest.spyOn(mockService, 'getTaskById').mockRejectedValue(new Error('Unexpected DB error'));
      const req = { params: { id: '1' } } as unknown as Request;
      const res = createMockRes();
      await controller.getById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('create', () => {
    it('should create a task', async () => {
      const req = { body: { title: 'New Task', priority: TaskPriority.HIGH } } as Request;
      const res = createMockRes();
      await controller.create(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: expect.objectContaining({ title: 'New Task' }) });
    });

    it('should return 400 for empty title', async () => {
      const req = { body: { title: '' } } as Request;
      const res = createMockRes();
      await controller.create(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on unexpected error', async () => {
      jest.spyOn(mockService, 'createTask').mockRejectedValue(new Error('Unexpected error'));
      const req = { body: { title: 'Test' } } as Request;
      const res = createMockRes();
      await controller.create(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const created = await mockService.createTask({ title: 'Original' });
      const req = {
        params: { id: created.id },
        body: { title: 'Updated', status: TaskStatus.IN_PROGRESS },
      } as unknown as Request;
      const res = createMockRes();
      await controller.update(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: expect.objectContaining({ title: 'Updated' }) });
    });

    it('should return 404 for missing task', async () => {
      const req = { params: { id: '999' }, body: { title: 'Test' } } as unknown as Request;
      const res = createMockRes();
      await controller.update(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 for empty title on update', async () => {
      const created = await mockService.createTask({ title: 'Test' });
      const req = { params: { id: created.id }, body: { title: '' } } as unknown as Request;
      const res = createMockRes();
      await controller.update(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on unexpected error', async () => {
      jest.spyOn(mockService, 'updateTask').mockRejectedValue(new Error('Unexpected error'));
      const req = { params: { id: '1' }, body: { title: 'Test' } } as unknown as Request;
      const res = createMockRes();
      await controller.update(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const created = await mockService.createTask({ title: 'To Delete' });
      const req = { params: { id: created.id } } as unknown as Request;
      const res = createMockRes();
      await controller.delete(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 for missing task', async () => {
      const req = { params: { id: '999' } } as unknown as Request;
      const res = createMockRes();
      await controller.delete(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on unexpected error', async () => {
      jest.spyOn(mockService, 'deleteTask').mockRejectedValue(new Error('Unexpected error'));
      const req = { params: { id: '1' } } as unknown as Request;
      const res = createMockRes();
      await controller.delete(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});