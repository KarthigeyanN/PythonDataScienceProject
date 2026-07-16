import { TaskService } from '../lib/services/TaskService';
import { ITaskRepository } from '../lib/repositories/ITaskRepository';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from '../types/domain';

class MockTaskRepository implements ITaskRepository {
  private tasks: Task[] = [];
  private nextId = 1;

  async findAll(): Promise<Task[]> {
    return this.tasks;
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.find((t) => t.id === id) || null;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
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

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    this.tasks[index] = {
      ...this.tasks[index],
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.priority !== undefined && { priority: dto.priority }),
      updatedAt: new Date(),
    };
    return this.tasks[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }
    this.tasks.splice(index, 1);
  }
}

describe('TaskService', () => {
  let taskService: TaskService;
  let mockRepository: MockTaskRepository;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    taskService = new TaskService(mockRepository);
  });

  describe('getAllTasks', () => {
    it('should return an empty array when no tasks exist', async () => {
      const tasks = await taskService.getAllTasks();
      expect(tasks).toEqual([]);
    });

    it('should return all tasks', async () => {
      await taskService.createTask({ title: 'Task 1' });
      await taskService.createTask({ title: 'Task 2' });
      const tasks = await taskService.getAllTasks();
      expect(tasks).toHaveLength(2);
    });
  });

  describe('getTaskById', () => {
    it('should return a task by id', async () => {
      const created = await taskService.createTask({ title: 'Test Task' });
      const found = await taskService.getTaskById(created.id);
      expect(found.title).toBe('Test Task');
    });

    it('should throw error for non-existent task', async () => {
      await expect(taskService.getTaskById('999')).rejects.toThrow('not found');
    });
  });

  describe('createTask', () => {
    it('should create a task with valid data', async () => {
      const task = await taskService.createTask({
        title: 'New Task',
        description: 'Description',
        priority: TaskPriority.HIGH,
      });
      expect(task.title).toBe('New Task');
      expect(task.description).toBe('Description');
      expect(task.priority).toBe(TaskPriority.HIGH);
      expect(task.status).toBe(TaskStatus.TODO);
    });

    it('should throw error for empty title', async () => {
      await expect(taskService.createTask({ title: '' })).rejects.toThrow('Task title is required');
    });

    it('should throw error for whitespace-only title', async () => {
      await expect(taskService.createTask({ title: '   ' })).rejects.toThrow('Task title is required');
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const created = await taskService.createTask({ title: 'Original' });
      const updated = await taskService.updateTask(created.id, {
        title: 'Updated',
        status: TaskStatus.IN_PROGRESS,
      });
      expect(updated.title).toBe('Updated');
      expect(updated.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should throw error for non-existent task', async () => {
      await expect(taskService.updateTask('999', { title: 'Test' })).rejects.toThrow('not found');
    });

    it('should throw error for empty title on update', async () => {
      const created = await taskService.createTask({ title: 'Test' });
      await expect(taskService.updateTask(created.id, { title: '' })).rejects.toThrow('cannot be empty');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const created = await taskService.createTask({ title: 'To Delete' });
      await taskService.deleteTask(created.id);
      await expect(taskService.getTaskById(created.id)).rejects.toThrow('not found');
    });

    it('should throw error for non-existent task', async () => {
      await expect(taskService.deleteTask('999')).rejects.toThrow('not found');
    });
  });
});