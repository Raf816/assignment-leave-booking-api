import { Router } from "express";
import { IRouter } from "./IRouter";
import { LeaveRequestController } from "../controllers/LeaveRequestController";
import { MiddlewareFactory } from "../helper/MiddlewareFactory";

export class LeaveRequestRouter implements IRouter {
  public routeName = "leave-requests";
  public basePath = "/api/leave-requests";
  public authenticate = true;

  constructor(private router: Router,private leaveRequestController: LeaveRequestController) {
    this.addRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  private addRoutes() {
    // STAFF: Submit a leave request
    this.router.post(
      "/",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.leaveRequestController.requestLeave
    );

    // STAFF: View their own leave requests
    this.router.get(
      "/my-requests",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.leaveRequestController.getMyRequests
    );

    // MANAGER/ADMIN: Approve a leave request
    this.router.patch(
      "/approve/:id",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.requireRole(["admin", "manager"]),
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.leaveRequestController.approveLeave
    );

    // MANAGER/ADMIN: Reject a leave request
    this.router.patch(
      "/reject/:id",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.requireRole(["admin", "manager"]),
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.leaveRequestController.rejectLeave
    );

    // STAFF/ADMIN: Cancel a leave request
    this.router.patch(
      "/cancel/:id",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.leaveRequestController.cancelLeave
    );
    
    // ADMIN/MANAGER: View all leave requests (optionally filtered by userId/status)
    this.router.get(
      "/all",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.requireRole(["admin", "manager"]),
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.leaveRequestController.getAllLeaveRequests
    );
    
    // STAFF or ADMIN: View remaining leave balance
    this.router.get(
      "/remaining/:userId",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.leaveRequestController.getRemainingLeave
    );

    // MANAGER/ADMIN: View leave balance for any staff member
    this.router.get(
      "/balance/:id",
      MiddlewareFactory.authenticateToken,
      MiddlewareFactory.requireRole(["admin", "manager"]),
      MiddlewareFactory.jwtRateLimitMiddleware(this.basePath),
      MiddlewareFactory.logRouteAccess(this.basePath),
      this.leaveRequestController.getLeaveBalance
    );

  }
}
