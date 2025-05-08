import { Router } from "express";  // Correctly import Router
import { UserController } from '../controllers/UserController';

export class UserRouter {
  constructor(private router: Router, 
            private userController: UserController) {
    this.addRoutes(); 
  }

  public getRouter(): Router {
    return this.router;
  } 

  private addRoutes() {
    this.router.delete('/:id', this.userController.delete);  
    this.router.get('/', this.userController.getAll);  
    this.router.get('/email/:emailAddress', this.userController.getByEmail); 
    this.router.get('/:id', this.userController.getById); 
    this.router.post('/', this.userController.create);  
    this.router.patch('/', this.userController.update);
  }
}