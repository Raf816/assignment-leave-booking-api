import { Router } from "express";
import { IRouter } from "./IRouter";
import { LeaveRequestController } from "../controllers/LeaveRequestController";
import { MiddlewareFactory } from "../helper/MiddlewareFactory";

export class LeaveRequestRouter implements IRouter {
  public routeName = "leave-requests";
  public basePath = "/api/leave-requests";
  public authenticate = true;

  constructor(private router: Router, private leaveRequestController: LeaveRequestController) {
    this.addRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  private addRoutes() {
    this.router.post(
      "/",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.leaveRequestController.requestLeave
    );

    this.router.get(
      "/my-requests",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.leaveRequestController.getMyRequests
    );
  }
}
