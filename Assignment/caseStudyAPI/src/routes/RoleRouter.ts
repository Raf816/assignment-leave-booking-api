import { Router } from "express";  
import { IRouter } from "./IRouter";
import { IEntityController } from "../controllers/IEntityController";

export class RoleRouter implements IRouter{
    public routeName = "roles";
    public basePath = "/api/roles";
    public authenticate = true;

    constructor(private router: Router, 
                private roleController: IEntityController) {
        this.addRoutes(); 
    }

    public getRouter(): Router {
        return this.router;
    } 

    private addRoutes() {
        this.router.get('/', this.roleController.getAll); 
        this.router.get('/:id', this.roleController.getById); 
        this.router.delete('/:id',this.roleController.delete);
        this.router.post('/', this.roleController.create);  
        this.router.patch('/', this.roleController.update);
    }    
}