import { Router } from "express";  
import { ILoginController } from "../controllers/LoginController";
import { IRouter } from "./IRouter";

export class LoginRouter implements IRouter {
    public routeName = "login";
    public basePath = "/api/login";
    public authenticate = false;

    constructor(private router: Router, 
        private loginController: ILoginController) {
            this.addRoutes(); 
    }

    public getRouter(): Router {
        return this.router;
    } 

    private addRoutes() {  
        this.router.post('/', this.loginController.login); 
    }
}