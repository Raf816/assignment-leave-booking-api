import { Router } from "express";  
import { RoleController } from '../controllers/RoleController';
export class RoleRouter {
    private router: Router; 
    private roleController: RoleController;

    constructor(router: Router, roleController: RoleController) {
        this.router = router;
        this.roleController = roleController;
        this.addRoutes(); 
    }

    public getRouter(): Router {
        return this.router;
    } 

    private addRoutes() {
        this.router.delete('/:id', this.roleController.delete); 
        this.router.get('/', this.roleController.getAll);  
        this.router.get('/:id', this.roleController.getById);
        this.router.post('/', this.roleController.create);  
        this.router.patch('/', this.roleController.update);
    }
}