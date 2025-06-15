import { Router } from "express";
import { IRouter } from "../interfaces/IRouter";
import { UserManagementController } from "../controllers/UserManagementController";
import { MiddlewareFactory } from "../helper/MiddlewareFactory";

export class UserManagementRouter implements IRouter {
  public routeName = "user-management";
  public basePath = "/api/user-management";
  public authenticate = true;

  constructor(private router: Router, private userManagementController: UserManagementController) {
    this.addRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  private addRoutes(): void {
    this.router.post(
      "/assign",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.requireRole(["admin"]),
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.userManagementController.assignManagerToStaff
    );
  }
}
