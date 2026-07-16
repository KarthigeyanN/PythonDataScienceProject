import { Request, Response } from 'express';
import { ITaskController } from './ITaskController';
import { ITaskService } from '../services/ITaskService';

export class TaskController implements ITaskController {
  constructor(private readonly taskService: ITaskService) {}

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const tasks = await this.taskService.getAllTasks();
      res.status(200).json({ data: tasks });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const task = await this.taskService.getTaskById(id);
      res.status(200).json({ data: task });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      if (message.includes('not found')) {
        res.status(404).json({ error: message });
      } else {
        res.status(500).json({ error: message });
      }
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const task = await this.taskService.createTask(req.body);
      res.status(201).json({ data: task });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      if (message.includes('required') || message.includes('cannot be empty')) {
        res.status(400).json({ error: message });
      } else {
        res.status(500).json({ error: message });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const task = await this.taskService.updateTask(id, req.body);
      res.status(200).json({ data: task });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      if (message.includes('not found')) {
        res.status(404).json({ error: message });
      } else if (message.includes('cannot be empty')) {
        res.status(400).json({ error: message });
      } else {
        res.status(500).json({ error: message });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.taskService.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      if (message.includes('not found')) {
        res.status(404).json({ error: message });
      } else {
        res.status(500).json({ error: message });
      }
    }
  }
}