import { Router } from 'express';
import { ITaskController } from '../controllers/ITaskController';

export class TaskRoutes {
  private router: Router;

  constructor(private readonly taskController: ITaskController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', (req, res) => this.taskController.getAll(req, res));
    this.router.get('/:id', (req, res) => this.taskController.getById(req, res));
    this.router.post('/', (req, res) => this.taskController.create(req, res));
    this.router.put('/:id', (req, res) => this.taskController.update(req, res));
    this.router.delete('/:id', (req, res) => this.taskController.delete(req, res));
  }

  public getRouter(): Router {
    return this.router;
  }
}