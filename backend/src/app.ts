import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { TaskRoutes } from './lib/routes/TaskRoutes';
import { TaskController } from './lib/controllers/TaskController';
import { TaskService } from './lib/services/TaskService';
import { PrismaTaskRepository } from './lib/repositories/PrismaTaskRepository';

export function createApp(): express.Application {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Dependency Injection
  const taskRepository = new PrismaTaskRepository();
  const taskService = new TaskService(taskRepository);
  const taskController = new TaskController(taskService);
  const taskRoutes = new TaskRoutes(taskController);

  // Routes
  app.use('/api/tasks', taskRoutes.getRouter());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}