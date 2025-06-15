import { Router } from "express";
import { IRouter } from "../interfaces/IRouter";
import { LeaveTypeController } from "../controllers/LeaveTypeController";
import { MiddlewareFactory } from "../helper/MiddlewareFactory";

export class LeaveTypeRouter implements IRouter {
  public routeName = "leave-type";
  public basePath = "/api/leave-types";
  public authenticate = true;

  constructor(private router: Router, private controller: LeaveTypeController) {
    this.addRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  private addRoutes(): void {
    // GET /api/leave-types (admin, manager, staff)
    this.router.get(
      "/",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.controller.getAll
    );

    // POST /api/leave-types (admin only)
    this.router.post(
      "/",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.requireRole(["admin"]),
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.controller.create
    );

    // PATCH /api/leave-types/:id (admin only)
    this.router.patch(
      "/:id",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.requireRole(["admin"]),
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.controller.update
    );

    // DELETE /api/leave-types/:id (admin only)
    this.router.delete(
      "/:id",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.requireRole(["admin"]),
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.controller.delete
    );
  }
}
