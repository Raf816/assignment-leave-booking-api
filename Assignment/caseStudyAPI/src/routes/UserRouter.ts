import { Router } from "express";  
import { IRouter } from "../interfaces/IRouter";
import { IEntityController } from "../interfaces/IEntityController";
import { IGetByEmail } from "../interfaces/IGetByEmail";


export class UserRouter implements IRouter{
  public routeName = "users";
  public basePath = "/api/users";
  public authenticate = true;

  constructor(private router: Router, 
            private userController: IGetByEmail) {
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
    this.router.patch('/:id', this.userController.update);
  }
}